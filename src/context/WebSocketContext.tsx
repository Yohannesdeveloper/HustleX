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
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use refs instead of state — prevents ANY re-render when socket connects/disconnects
  const socketRef = useRef<Socket | null>(null);
  const connectedRef = useRef(false);
  const callbacksRef = useRef<Set<(data: any) => void>>(new Set());
  const messageCallbacksRef = useRef<Set<(data: any) => void>>(new Set());
  const typingCallbacksRef = useRef<Set<(data: any) => void>>(new Set());
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
    };
  }, []);

  const onNewApplication = useCallback((cb: (data: any) => void) => { callbacksRef.current.add(cb); }, []);
  const offNewApplication = useCallback((cb: (data: any) => void) => { callbacksRef.current.delete(cb); }, []);
  const joinUser = useCallback((userId: string) => {
    if (socketRef.current && connectedRef.current) socketRef.current.emit("join", userId);
  }, []);
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && connectedRef.current) socketRef.current.emit("sendMessage", data);
  }, []);
  const onMessage = useCallback((cb: (data: any) => void) => { messageCallbacksRef.current.add(cb); }, []);
  const offMessage = useCallback((cb: (data: any) => void) => { messageCallbacksRef.current.delete(cb); }, []);
  const onTyping = useCallback((cb: (data: any) => void) => { typingCallbacksRef.current.add(cb); }, []);
  const offTyping = useCallback((cb: (data: any) => void) => { typingCallbacksRef.current.delete(cb); }, []);

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
