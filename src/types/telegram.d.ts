// Telegram WebApp type definitions
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        // Navigation methods
        openLink: (url: string) => void;
        
        // Lifecycle methods
        ready: () => void;
        expand: () => void;
        
        // CloudStorage API (v6.9+)
        CloudStorage?: {
          setItem: (key: string, value: string, callback?: (error: Error | null, success: boolean) => void) => void;
          getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void;
          removeItem: (key: string, callback?: (error: Error | null, success: boolean) => void) => void;
          getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
        };
        // Deprecated or incorrect Storage API from previous definition
        Storage?: {
          setItem: (key: string, value: string, callback?: () => void) => void;
          getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void;
          removeItem: (key: string, callback?: () => void) => void;
          getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
        };
      };
    };
  }
}

export {};
