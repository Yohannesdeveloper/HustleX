export const MINI_APP_BG = "#111827";

export function initTelegramMiniApp(bg = MINI_APP_BG): void {
  if (typeof document === "undefined") return;
  document.body.style.backgroundColor = bg;
  document.documentElement.style.backgroundColor = bg;
  const tg = window.Telegram?.WebApp as {
    ready?: () => void;
    expand?: () => void;
    setHeaderColor?: (color: string) => void;
    setBackgroundColor?: (color: string) => void;
  } | undefined;
  if (!tg) return;
  tg.ready?.();
  tg.expand?.();
  try {
    tg.setHeaderColor?.(bg);
    tg.setBackgroundColor?.(bg);
  } catch {
    /* ignore */
  }
}

export function storeTelegramUserFromInitData(): void {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (tgUser) {
    sessionStorage.setItem("telegramUser", JSON.stringify(tgUser));
  }
}
