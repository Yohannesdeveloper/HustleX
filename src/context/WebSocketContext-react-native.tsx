import React, { createContext, useMemo, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getBackendUrlSync, getBackendUrl } from '../utils/portDetector';
import { useAuth } from '../store/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WebSocketContextValue = {
  socket: Socket | null;
  connected: boolean;
  joinUser: (userId: string) => void;
  sendMessage: (message: any) => void;
  onMessage: (callback: (data: any) => void) => void;
  offMessage: (callback: (data: any) => void) => void;
  onNewApplication: (callback: (data: any) => void) => void;
  offNewApplication: (callback: (data: any) => void) => void;
};

export const WebSocketContext = createContext<WebSocketContextValue>({
  socket: null,
  connected: false,
  joinUser: () => {},
  sendMessage: () => {},
  onMessage: () => {},
  offMessage: () => {},
  onNewApplication: () => {},
  offNewApplication: () => {},
});

type WebSocketProviderProps = {
  children: React.ReactNode;
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [backendUrl, setBackendUrl] = useState<string | null>(null); // Start with null to wait for detection
  const [isDetectingPort, setIsDetectingPort] = useState(true);
  const messageCallbacksRef = useRef<Set<(data: any) => void>>(new Set());
  const applicationCallbacksRef = useRef<Set<(data: any) => void>>(new Set());

  // Detect backend port FIRST before initializing socket
  useEffect(() => {
    const detectPort = async () => {
      setIsDetectingPort(true);
      const initialUrl = getBackendUrlSync();
      const currentHostname = initialUrl.replace(/^https?:\/\//, '').split(':')[0] || 'localhost';
      
      console.log(`[WebSocket] Starting port detection for hostname: ${currentHostname}`);
      
      // Method 1: Use getBackendUrl() which already handles port detection correctly
      // This ensures we use the same port detection logic as the API service
      // It will try port.json first, then API endpoints, then health checks
      try {
        const url = await getBackendUrl();
        console.log(`[WebSocket] ✅ Detected backend URL: ${url}`);
        setBackendUrl(url);
        setIsDetectingPort(false);
        return;
      } catch (error) {
        console.warn('[WebSocket] Error detecting backend URL via getBackendUrl():', error);
      }
      
      // Method 2: Try common ports directly (5001, 5002, 5000) with health check
      // Try both detected hostname and localhost
      const commonPorts = [5001, 5002, 5000];
      const hostnamesToTry = currentHostname !== 'localhost' ? [currentHostname, 'localhost'] : ['localhost'];
      
      for (const testHostname of hostnamesToTry) {
        for (const port of commonPorts) {
          try {
            const testUrl = `http://${testHostname}:${port}/api/health`;
            console.log(`[WebSocket] Trying health check: ${testUrl}`);
            const healthResponse = await fetch(testUrl, {
              method: 'GET',
              signal: AbortSignal.timeout(2000),
            });
            if (healthResponse.ok) {
              const url = `http://${testHostname}:${port}`;
              console.log(`[WebSocket] ✅ Port ${port} is available on ${testHostname}: ${url}`);
              setBackendUrl(url);
              setIsDetectingPort(false);
              return;
            }
          } catch (error) {
            // Port not available, try next
            continue;
          }
        }
      }
      
      // Method 3: Try to fetch /api/port from common ports
      for (const testHostname of hostnamesToTry) {
        for (const port of commonPorts) {
          try {
            const portUrl = `http://${testHostname}:${port}/api/port`;
            console.log(`[WebSocket] Trying /api/port: ${portUrl}`);
            const portResponse = await fetch(portUrl, {
              method: 'GET',
              signal: AbortSignal.timeout(2000),
            });
            if (portResponse.ok) {
              const portData = await portResponse.json();
              if (portData.port) {
                const newUrl = `http://${testHostname}:${portData.port}`;
                console.log(`[WebSocket] ✅ Found port via /api/port on ${testHostname}:${port}: ${newUrl}`);
                setBackendUrl(newUrl);
                setIsDetectingPort(false);
                return;
              }
            }
          } catch (error) {
            // Port not available, try next
            continue;
          }
        }
      }
      
      // Method 4: Fallback to port 5002 (most likely when 5001 is busy)
      // Try both hostnames
      const fallbackHostname = currentHostname !== 'localhost' ? currentHostname : 'localhost';
      const fallbackUrl = `http://${fallbackHostname}:5002`;
      console.warn(`[WebSocket] ⚠️ Could not detect backend, using fallback: ${fallbackUrl}`);
      console.warn(`[WebSocket] Make sure backend is running on port 5002`);
      setBackendUrl(fallbackUrl);
      setIsDetectingPort(false);
    };
    
    detectPort();
  }, []);

  // Initialize socket connection - wait for port detection to complete
  useEffect(() => {
    if (isDetectingPort) {
      return; // Wait for port detection
    }
    
    if (!backendUrl) {
      console.warn('[WebSocket] No backend URL available');
      return;
    }

    console.log(`[WebSocket] Connecting to ${backendUrl}`);

    // Get auth token for connection
    let socketInstance: Socket | null = null;
    
    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        
        // Ensure URL doesn't have trailing slash
        const cleanUrl = backendUrl.replace(/\/$/, '');
        
        console.log(`[WebSocket] Initializing socket to: ${cleanUrl}`);
        
        const newSocket = io(cleanUrl, {
          transports: ['polling'], // Use polling only - more reliable for React Native/Expo
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 30000,
          auth: token ? { token } : {},
          forceNew: false, // Allow reuse of connections
          upgrade: false, // Don't upgrade to websocket
        });

        socketInstance = newSocket;

        newSocket.on('connect', () => {
          console.log('[WebSocket] Connected:', newSocket.id);
          setConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
          console.log('[WebSocket] Disconnected:', reason);
          setConnected(false);
        });

        let lastErrorLogTime = 0;
        const ERROR_LOG_INTERVAL = 10000; // Only log errors every 10 seconds
        
        newSocket.on('connect_error', (error) => {
          const now = Date.now();
          const shouldLog = now - lastErrorLogTime > ERROR_LOG_INTERVAL;
          
          if (shouldLog) {
            lastErrorLogTime = now;
            console.warn('[WebSocket] Connection error:', error.message);
            console.warn('[WebSocket] Attempting to connect to:', cleanUrl);
            
            // Only log full error details if it's a new type of error
            // Type assertion needed because socket.io error may have additional properties
            const errorWithContext = error as any;
            if (error.message.includes('xhr poll error') && errorWithContext.context?._response?.includes('Failed to connect')) {
              console.warn('[WebSocket] Backend may not be running or not accessible at:', cleanUrl);
              console.warn('[WebSocket] Check that:');
              console.warn('  1. Backend server is running');
              console.warn('  2. Backend is accessible from this device');
              console.warn('  3. Port matches backend server port (check port.json or try 5001, 5002, 5000)');
            }
          }
          
          setConnected(false);
        });

        // Handle incoming messages
        newSocket.on('newMessage', (data) => {
          console.log('[WebSocket] Received newMessage:', data);
          messageCallbacksRef.current.forEach((callback) => {
            try {
              callback(data);
            } catch (error) {
              console.error('[WebSocket] Error in message callback:', error);
            }
          });
        });

        // Handle message sent confirmation
        newSocket.on('messageSent', (data) => {
          console.log('[WebSocket] Message sent confirmation:', data);
          messageCallbacksRef.current.forEach((callback) => {
            try {
              callback(data);
            } catch (error) {
              console.error('[WebSocket] Error in message callback:', error);
            }
          });
        });

        // Handle message errors
        newSocket.on('messageError', (error) => {
          console.error('[WebSocket] Message error:', error);
        });

        // Handle new applications
        newSocket.on('newApplication', (data) => {
          console.log('[WebSocket] Received newApplication:', data);
          applicationCallbacksRef.current.forEach((callback) => {
            try {
              callback(data);
            } catch (error) {
              console.error('[WebSocket] Error in application callback:', error);
            }
          });
        });

        setSocket(newSocket);
      } catch (error) {
        console.error('[WebSocket] Error initializing socket:', error);
        setConnected(false);
      }
    };

    initializeSocket();

    // Cleanup on unmount or URL change
    return () => {
      console.log('[WebSocket] Cleaning up socket connection');
      if (socketInstance) {
        socketInstance.close();
        socketInstance = null;
      }
      setSocket((currentSocket) => {
        if (currentSocket && currentSocket.connected) {
          currentSocket.close();
        }
        return null;
      });
      setConnected(false);
    };
  }, [backendUrl, isDetectingPort]);

  const joinUser = useCallback((userId: string) => {
    if (socket && connected) {
      console.log(`[WebSocket] Joining user: ${userId}`);
      socket.emit('join', userId);
    } else {
      console.warn('[WebSocket] Cannot join user - socket not connected');
    }
  }, [socket, connected]);

  const sendMessage = useCallback((messageData: any) => {
    if (socket && connected) {
      console.log('[WebSocket] Sending message:', messageData);
      socket.emit('sendMessage', messageData);
    } else {
      console.warn('[WebSocket] Cannot send message - socket not connected');
      // Fallback: try to reconnect
      if (socket) {
        socket.connect();
      }
    }
  }, [socket, connected]);

  const onMessage = useCallback((callback: (data: any) => void) => {
    messageCallbacksRef.current.add(callback);
    return () => {
      messageCallbacksRef.current.delete(callback);
    };
  }, []);

  const offMessage = useCallback((callback: (data: any) => void) => {
    messageCallbacksRef.current.delete(callback);
  }, []);

  const onNewApplication = useCallback((callback: (data: any) => void) => {
    applicationCallbacksRef.current.add(callback);
    return () => {
      applicationCallbacksRef.current.delete(callback);
    };
  }, []);

  const offNewApplication = useCallback((callback: (data: any) => void) => {
    applicationCallbacksRef.current.delete(callback);
  }, []);

  const value = useMemo<WebSocketContextValue>(() => ({
    socket,
    connected,
    joinUser,
    sendMessage,
    onMessage,
    offMessage,
    onNewApplication,
    offNewApplication,
  }), [socket, connected, joinUser, sendMessage, onMessage, offMessage, onNewApplication, offNewApplication]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
