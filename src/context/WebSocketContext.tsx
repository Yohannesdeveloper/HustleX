import React, { createContext, useContext, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { getBackendUrlSync, getBackendUrl } from "../utils/portDetector";

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  onNewApplication: (callback: (data: any) => void) => void;
  offNewApplication: (callback: (data: any) => void) => void;
  joinUser: (userId: string) => void;
  sendMessage: (data: {
    senderId: string;
    receiverId: string;
    message: string;
    conversationId: string;
    messageType?: string;
    voiceData?: string | null;
    voiceDuration?: number;
    files?: any[];
    clientMessageId?: string;
  }) => void;
  onMessage: (callback: (data: any) => void) => void;
  offMessage: (callback: (data: any) => void) => void;
  onTyping: (callback: (data: any) => void) => void;
  offTyping: (callback: (data: any) => void) => void;
  watchPresence: (userId: string) => void;
  unwatchPresence: (userId: string | string[]) => void;
  requestPresence: (userIds: string[]) => void;
  onPresence: (callback: (data: { userId: string; online: boolean; lastSeen?: string | null }) => void) => void;
  offPresence: (callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use refs instead of state — prevents ANY re-render when socket connects/disconnects
  const socketRef = useRef<Socket | null>(null);
  const connectedRef = useRef(false);
  const callbacksRef = useRef<Set<(data: any) => void>>(new Set());
  const messageCallbacksRef = useRef<Set<(data: any) => void>>(new Set());
  const typingCallbacksRef = useRef<Set<(data: any) => void>>(new Set());
  const presenceCallbacksRef = useRef<Set<(data: any) => void>>(new Set());
  // Presence bookkeeping so a reconnect can re-register without remounting consumers
  const selfIdRef = useRef<string | null>(null);
  const watchedIdsRef = useRef<Set<string>>(new Set());
  const errorCountRef = useRef<number>(0);

  useEffect(() => {
    let currentUrl = getBackendUrlSync();

    const connect = (url: string) => {
      if (socketRef.current) {
        socketRef.current.close();
      }

      const newSocket = io(url, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
        forceNew: true,
        withCredentials: true,
      });

      const maxErrorLogs = 3;

      newSocket.on("connect", () => {
        connectedRef.current = true;
        errorCountRef.current = 0;
        // Room membership died with the old socket — re-register self and watchers
        if (selfIdRef.current) newSocket.emit("join", selfIdRef.current);
        if (watchedIdsRef.current.size > 0) {
          newSocket.emit("presence:batch", Array.from(watchedIdsRef.current));
        }
      });

      newSocket.on("disconnect", () => {
        connectedRef.current = false;
      });

      newSocket.on("connect_error", (error: any) => {
        errorCountRef.current++;
        connectedRef.current = false;

        if (errorCountRef.current <= maxErrorLogs) {
          if (error.message?.includes("timeout") || error.message?.includes("ECONNREFUSED")) {
            if (errorCountRef.current === 1) {
              console.warn("WebSocket: Backend server appears to be offline. Connection will retry automatically.");
            }
          } else {
            console.error("WebSocket connection error:", error.message || error);
          }
        }

        (async () => {
          try {
            const msg = (error && error.message) || "";
            if (msg.includes("ECONNREFUSED") || msg.includes("timeout") || msg.includes("NetworkError")) {
              const detectedUrl = await getBackendUrl();
              if (detectedUrl && detectedUrl !== currentUrl) {
                currentUrl = detectedUrl;
                connect(detectedUrl);
              }
            }
          } catch (e) {}
        })();
      });

      newSocket.on("newApplication", (data: any) => {
        callbacksRef.current.forEach((cb) => { try { cb(data); } catch (e) {} });
      });

      newSocket.on("newMessage", (data: any) => {
        messageCallbacksRef.current.forEach((cb) => { try { cb(data); } catch (e) {} });
      });

      newSocket.on("messageSent", () => {});

      newSocket.on("userTyping", (data: any) => {
        typingCallbacksRef.current.forEach((cb) => { try { cb({ ...data, typing: true }); } catch (e) {} });
      });

      newSocket.on("userStoppedTyping", (data: any) => {
        typingCallbacksRef.current.forEach((cb) => { try { cb({ ...data, typing: false }); } catch (e) {} });
      });

      newSocket.on("presence:update", (data: any) => {
        presenceCallbacksRef.current.forEach((cb) => { try { cb(data); } catch (e) {} });
      });

      // Batch replies are fanned out as single-user updates so every
      // presence subscriber (chat header, freelancer grid, …) shares one path
      newSocket.on("presence:batch", (data: any) => {
        if (!data || typeof data !== "object") return;
        Object.entries(data as Record<string, { online?: boolean; lastSeen?: string | null }>)
          .forEach(([userId, entry]) => {
            presenceCallbacksRef.current.forEach((cb) => {
              try { cb({ userId, online: !!entry?.online, lastSeen: entry?.lastSeen ?? null }); } catch (e) {}
            });
          });
      });

      socketRef.current = newSocket;
    };

    const socketUrl = window.location.hostname.includes("devtunnels")
      ? `https://${window.location.hostname}`
      : currentUrl;

    connect(socketUrl);

    if (!window.location.hostname.includes("devtunnels")) {
      getBackendUrl().then((detectedUrl) => {
        if (detectedUrl !== currentUrl) {
          currentUrl = detectedUrl;
          connect(detectedUrl);
        }
      }).catch(() => {});
    }

    return () => {
      if (socketRef.current) socketRef.current.close();
      callbacksRef.current.clear();
      messageCallbacksRef.current.clear();
      typingCallbacksRef.current.clear();
      presenceCallbacksRef.current.clear();
      watchedIdsRef.current.clear();
      selfIdRef.current = null;
    };
  }, []);

  const onNewApplication = useCallback((cb: (data: any) => void) => { callbacksRef.current.add(cb); }, []);
  const offNewApplication = useCallback((cb: (data: any) => void) => { callbacksRef.current.delete(cb); }, []);
  const joinUser = useCallback((userId: string) => {
    if (!userId) return;
    selfIdRef.current = String(userId);
    if (socketRef.current && connectedRef.current) socketRef.current.emit("join", userId);
  }, []);
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && connectedRef.current) socketRef.current.emit("sendMessage", data);
  }, []);
  const onMessage = useCallback((cb: (data: any) => void) => { messageCallbacksRef.current.add(cb); }, []);
  const offMessage = useCallback((cb: (data: any) => void) => { messageCallbacksRef.current.delete(cb); }, []);
  const onTyping = useCallback((cb: (data: any) => void) => { typingCallbacksRef.current.add(cb); }, []);
  const offTyping = useCallback((cb: (data: any) => void) => { typingCallbacksRef.current.delete(cb); }, []);
  const watchPresence = useCallback((userId: string) => {
    if (!userId) return;
    watchedIdsRef.current.add(String(userId));
    if (socketRef.current && connectedRef.current) socketRef.current.emit("watchPresence", userId);
  }, []);
  const requestPresence = useCallback((userIds: string[]) => {
    const ids = (userIds || []).map(String).filter(Boolean);
    if (!ids.length) return;
    ids.forEach((id) => watchedIdsRef.current.add(id));
    if (socketRef.current && connectedRef.current) socketRef.current.emit("presence:batch", ids);
  }, []);
  const unwatchPresence = useCallback((userId: string | string[]) => {
    const ids = (Array.isArray(userId) ? userId : [userId]).map(String).filter(Boolean);
    ids.forEach((id) => watchedIdsRef.current.delete(id));
    if (!socketRef.current || !connectedRef.current || !ids.length) return;
    socketRef.current.emit("unwatchPresence", ids);
  }, []);
  const onPresence = useCallback((cb: (data: any) => void) => { presenceCallbacksRef.current.add(cb); }, []);
  const offPresence = useCallback((cb: (data: any) => void) => { presenceCallbacksRef.current.delete(cb); }, []);

  // Value never changes reference — no re-renders ever triggered by WebSocket
  const value: WebSocketContextType = {
    get socket() { return socketRef.current; },
    get connected() { return connectedRef.current; },
    onNewApplication,
    offNewApplication,
    joinUser,
    sendMessage,
    onMessage,
    offMessage,
    onTyping,
    offTyping,
    watchPresence,
    unwatchPresence,
    requestPresence,
    onPresence,
    offPresence,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) throw new Error("useWebSocket must be used within a WebSocketProvider");
  return context;
};
