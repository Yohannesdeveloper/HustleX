/**
 * Utility to detect the backend server port dynamically
 */

const PORT_CACHE_KEY = 'hustlex_backend_port';
const PORT_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

interface PortInfo {
  port: number;
  url: string;
  timestamp: number;
}

/**
 * Safely parse JSON from unknown
 */
function parseJson<T>(data: unknown): T | null {
  if (typeof data === 'object' && data !== null) {
    return data as T;
  }
  return null;
}

/**
 * Get cached port if still valid
 */
function getCachedPort(): number | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(PORT_CACHE_KEY);
    if (cached) {
      const portInfo = parseJson<PortInfo>(JSON.parse(cached));
      if (portInfo && Date.now() - portInfo.timestamp < PORT_CACHE_TIMEOUT) {
        return portInfo.port;
      }
    }
  } catch {
    // ignore invalid cache
  }

  return null;
}

/**
 * Cache the detected port
 */
function cachePort(port: number): void {
  if (typeof window === 'undefined') return;

  try {
    const portInfo: PortInfo = { port, url: `http://localhost:${port}`, timestamp: Date.now() };
    localStorage.setItem(PORT_CACHE_KEY, JSON.stringify(portInfo));
  } catch {
    // ignore localStorage errors
  }
}

/**
 * Generic fetch helper with timeout
 */
async function fetchJson<T>(url: string, timeout = 1000): Promise<T | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
    if (response.ok) {
      const data = await response.json();
      return parseJson<T>(data);
    }
  } catch {
    // ignore errors
  }
  return null;
}

/**
 * Detect backend port using multiple methods
 */
export async function detectBackendPort(basePort = 5000): Promise<number> {
  // 1️⃣ Check cache first
  const cachedPort = getCachedPort();
  if (cachedPort) {
    try {
      const resp = await fetch(`http://localhost:${cachedPort}/api/health`, { signal: AbortSignal.timeout(500) });
      if (resp.ok || resp.status === 429) return cachedPort;
    } catch {
      // cached port not working
    }
  }

  const commonPorts = Array.from(new Set([basePort, 5000, 5001, 5002, 5003, 3000, 3001]));

  // 2️⃣ Try API endpoint
  for (const port of commonPorts) {
    const data = await fetchJson<{ port: number }>(`http://localhost:${port}/api/port`);
    if (data?.port) {
      cachePort(data.port);
      return data.port;
    }
  }

  // 3️⃣ Try port.json
  const fileData = await fetchJson<{ port: number }>('/port.json');
  if (fileData?.port) {
    cachePort(fileData.port);
    return fileData.port;
  }

  // 4️⃣ Try health check
  for (const port of commonPorts) {
    try {
      const resp = await fetch(`http://localhost:${port}/api/health`, { signal: AbortSignal.timeout(1000) });
      if (resp.ok || resp.status === 429) {
        cachePort(port);
        return port;
      }
    } catch {
      continue;
    }
  }

  // 5️⃣ Fallback
  return basePort;
}

/**
 * Get backend URL
 */
export async function getBackendUrl(): Promise<string> {
  if (typeof window !== 'undefined' && window.location.hostname.includes('devtunnels')) {
    return `https://${window.location.hostname}`;
  }
  const port = await detectBackendPort();
  return `http://localhost:${port}`;
}

export async function getBackendApiUrl(): Promise<string> {
  const base = await getBackendUrl();
  return `${base}/api`;
}

/**
 * Synchronous versions (use cached or default)
 */
export function getBackendPortSync(defaultPort = 5000): number {
  const cached = getCachedPort();
  return cached || defaultPort;
}

export function getBackendUrlSync(): string {
  if (typeof window !== 'undefined' && window.location.hostname.includes('devtunnels')) {
    return `https://${window.location.hostname}`;
  }
  const port = getBackendPortSync();
  return `http://localhost:${port}`;
}

export function getBackendApiUrlSync(): string {
  return `${getBackendUrlSync()}/api`;
}
