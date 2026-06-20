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
        
        // Storage API
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
