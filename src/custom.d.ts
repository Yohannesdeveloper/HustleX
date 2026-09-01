declare module "framer-motion";

interface TelegramCloudStorage {
  setItem(key: string, value: string, callback?: () => void, callback_failure?: () => void): void;
  getItem(key: string, callback: (value: string) => void): void;
  removeItem(key: string, callback?: () => void, callback_failure?: () => void): void;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  ready(): void;
  expand(): void;
  close(): void;
  sendData(data: string): void;
  requestPhoneNumber(callback: (result: any) => void, failure?: () => void): void;
  CloudStorage: TelegramCloudStorage;
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}
