import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
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
  }) => void;
  onMessage: (callback: (data: any) => void) => void;
  offMessage: (callback: (data: any) => void) => void;
  onTyping: (callback: (data: any) => void) => void;
  offTyping: (callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const callbacksRef = useRef<Set<(data: any) => void>>(new Set());
  const messageCallbacksRef = useRef<Set<(data: any) => void>>(new Set());
  const typingCallbacksRef = useRef<Set<(data: any) => void>>(new Set());
  const errorCountRef = useRef<number>(0);

  useEffect(() => {
    let activeSocket: Socket | null = null;
    let currentUrl = getBackendUrlSync();

    const connect = (url: string) => {
      if (activeSocket) {
        activeSocket.close();
      }

      console.log(`🔌 Connecting to WebSocket at: ${url}`);
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
        console.log("WebSocket connected");
        setConnected(true);
        errorCountRef.current = 0;
      });

      newSocket.on("disconnect", () => {
        console.log("WebSocket disconnected");
        setConnected(false);
      });

      newSocket.on("connect_error", (error: any) => {
        errorCountRef.current++;
        setConnected(false);

        if (errorCountRef.current <= maxErrorLogs) {
          if (error.message?.includes("timeout") ||
            error.message?.includes("ECONNREFUSED")) {
            if (errorCountRef.current === 1) {
              console.warn("WebSocket: Backend server appears to be offline. Connection will retry automatically.");
              console.warn("WebSocket attempted URL:", currentUrl);
            }
          } else {
            console.error("WebSocket connection error:", error.message || error);
            console.error("WebSocket attempted URL:", currentUrl);
          }
        }

        // If we detect connection errors that suggest the URL is wrong (stale port cache),
        // try to run port detection and reconnect to the discovered backend URL.
        // We only attempt this a limited number of times to avoid loops.
        (async () => {
          try {
            // Only run for connect errors that look like the server is unreachable
            const msg = (error && error.message) || "";
            if (msg.includes("ECONNREFUSED") || msg.includes("timeout") || msg.includes("NetworkError")) {
              const detectedUrl = await getBackendUrl();
              if (detectedUrl && detectedUrl !== currentUrl) {
                console.log(`🔄 Detected backend at ${detectedUrl}. Reconnecting WebSocket...`);
                currentUrl = detectedUrl;
                connect(detectedUrl);
              }
            }
          } catch (e) {
            console.warn("WebSocket port detection reconnect failed:", e);
          }
        })();
      });

      newSocket.on("newApplication", (data: any) => {
        console.log("Received newApplication event:", data);
        callbacksRef.current.forEach((callback) => {
          try {
            callback(data);
          } catch (error) {
            console.error("Error in newApplication callback:", error);
          }
        });
      });

      newSocket.on("newMessage", (data: any) => {
        console.log("Received newMessage event:", data);
        messageCallbacksRef.current.forEach((callback) => {
          try {
            callback(data);
          } catch (error) {
            console.error("Error in newMessage callback:", error);
          }
        });
      });

      // Listen for message sent confirmation
      newSocket.on("messageSent", (data: any) => {
        console.log("Message sent confirmation:", data);
        // Intentionally do not forward messageSent to message callbacks
        // to avoid duplicate message handling (newMessage already covers it).
      });

      newSocket.on("userTyping", (data: any) => {
        typingCallbacksRef.current.forEach((callback) => {
          try {
            callback({ ...data, typing: true });
          } catch (error) {
            console.error("Error in typing callback:", error);
          }
        });
      });

      newSocket.on("userStoppedTyping", (data: any) => {
        typingCallbacksRef.current.forEach((callback) => {
          try {
            callback({ ...data, typing: false });
          } catch (error) {
            console.error("Error in typing callback:", error);
          }
        });
      });

      activeSocket = newSocket;
      setSocket(newSocket);
    };

    // Initial connection
    const socketUrl = window.location.hostname.includes("devtunnels")
      ? `https://${window.location.hostname}`
      : currentUrl;

    connect(socketUrl);

    // Detect port asynchronously and reconnect if needed
    if (!window.location.hostname.includes("devtunnels")) {
      getBackendUrl().then((detectedUrl) => {
        if (detectedUrl !== currentUrl) {
          console.log(`🔄 WebSocket URL detected as ${detectedUrl} (was ${currentUrl}). Reconnecting...`);
          currentUrl = detectedUrl;
          connect(detectedUrl);
        }
      }).catch((err) => {
        console.warn("WebSocket port detection failed:", err);
      });
    }

    return () => {
      if (activeSocket) {
        activeSocket.close();
      }
      callbacksRef.current.clear();
      messageCallbacksRef.current.clear();
      typingCallbacksRef.current.clear();
    };
  }, []);

  const onNewApplication = useCallback((callback: (data: any) => void) => {
    callbacksRef.current.add(callback);
  }, []);

  const offNewApplication = useCallback((callback: (data: any) => void) => {
    callbacksRef.current.delete(callback);
  }, []);

  const joinUser = useCallback(
    (userId: string) => {
      if (socket && connected) {
        socket.emit("join", userId);
      }
    },
    [socket, connected]
  );

  const sendMessage = useCallback(
    (data: {
      senderId: string;
      receiverId: string;
      message: string;
      conversationId: string;
      messageType?: string;
      voiceData?: string | null;
      voiceDuration?: number;
      files?: any[];
    }) => {
      if (socket && connected) {
        socket.emit("sendMessage", data);
      }
    },
    [socket, connected]
  );

  const onMessage = useCallback((callback: (data: any) => void) => {
    messageCallbacksRef.current.add(callback);
  }, []);

  const offMessage = useCallback((callback: (data: any) => void) => {
    messageCallbacksRef.current.delete(callback);
  }, []);

  const onTyping = useCallback((callback: (data: any) => void) => {
    typingCallbacksRef.current.add(callback);
  }, []);

  const offTyping = useCallback((callback: (data: any) => void) => {
    typingCallbacksRef.current.delete(callback);
  }, []);

  const value: WebSocketContextType = {
    socket,
    connected,
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
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
