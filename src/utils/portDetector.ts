/**
 * Utility to detect the backend server port dynamically
 * Tries multiple methods:
 * 1. API endpoint /api/port
 * 2. port.json file
 * 3. Common ports (5000, 5001, etc.)
 */

const PORT_CACHE_KEY = 'hustlex_backend_port';
const PORT_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Extract a usable hostname (IP address) from a dev-server host string like
 * "192.168.1.3:8081", "192.168.1.3", "exp://192.168.1.3:8081", etc.
 */
function extractHostname(host: string | null | undefined): string | null {
  if (!host) return null;
  let value = String(host);
  // Strip common URL prefixes
  value = value.replace(/^https?:\/\//i, '').replace(/^exp:\/\//i, '').replace(/^exps:\/\//i, '');
  // Remove any path after the host
  value = value.split('/')[0];
  // Take the part before the port, if present
  const hostOnly = value.split(':')[0];
  // Accept dotted-quad IPv4 LAN/local addresses
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostOnly) && hostOnly !== '127.0.0.1' && hostOnly !== '0.0.0.0') {
    return hostOnly;
  }
  return null;
}

/**
 * Get the dev server hostname (IP address) for React Native/Expo.
 * Works for physical devices via Expo Go, where the dev server IP is the
 * same machine that runs the backend.
 */
function getDevServerHostname(): string | null {
  try {
    if (typeof require === 'undefined') return null;
    const Constants = require('expo-constants');
    const c = Constants?.default || Constants;
    if (!c) return null;

    // ~/.expo/... expoConfig.hostUri  (e.g. "192.168.1.3:8081")
    const candidates: (string | null | undefined)[] = [
      c.expoConfig?.hostUri,
      c.expoConfig?.hostUri && !c.expoConfig?.hostUri.includes(':') ? c.expoConfig?.hostUri : null,
      c.debuggerHost,
      c.platform?.ios?.hostUri,
      c.platform?.android?.hostUri,
      c.manifest?.debuggerHost,
      c.expoGoConfig?.debuggerHost,
    ];

    for (const candidate of candidates) {
      const host = extractHostname(candidate);
      if (host) {
        return host;
      }
    }
  } catch (e) {
    // expo-constants not available or error, continue
  }
  return null;
}

interface PortInfo {
  port: number;
  url: string;
  timestamp: number;
}

function getSafeLocalStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Try to detect port by attempting to fetch from API
 */
async function detectPortFromAPI(basePort: number, hostname: string = 'localhost'): Promise<number | null> {
  // Try 5000 first (current backend port), then 5001, then 5002, then basePort, then others
  const commonPorts = [5000, 5001, 5002, basePort, 5003, 3000, 3001];
  
  for (const port of commonPorts) {
    try {
      const response = await fetch(`http://${hostname}:${port}/api/port`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000), // 1 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.port) {
          console.log(`[portDetector] Found port ${data.port} via /api/port on ${hostname}:${port}`);
          return data.port;
        }
      }
    } catch (error) {
      // Port not available, try next
      continue;
    }
  }
  
  return null;
}

/**
 * Try to read port from port.json file
 * Tries multiple methods: direct file fetch, and via backend API endpoints
 */
async function detectPortFromFile(hostname: string = 'localhost'): Promise<number | null> {
  // Method 1: Try to fetch port.json directly (works in web environments)
  try {
    const response = await fetch('/port.json', {
      method: 'GET',
      signal: AbortSignal.timeout(1000),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.port) {
        console.log(`[portDetector] Found port from port.json: ${data.port}`);
        return data.port;
      }
    }
  } catch (error) {
    // File not available via direct fetch, try via backend
  }
  
  // Method 2: Try to get port.json via backend API on common ports
  // This works when the backend serves the port.json file
  const commonPorts = [5000, 5001, 5002, 5003];
  for (const port of commonPorts) {
    try {
      const response = await fetch(`http://${hostname}:${port}/port.json`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.port) {
          console.log(`[portDetector] Found port from backend port.json (${hostname}:${port}): ${data.port}`);
          return data.port;
        }
      }
    } catch (error) {
      // Port not available, try next
      continue;
    }
  }
  
  return null;
}

/**
 * Try common ports by checking health endpoint
 */
async function detectPortByHealthCheck(basePort: number, hostname: string = 'localhost'): Promise<number | null> {
  // Try 5000 first (current backend port), then 5001, then 5002, then basePort, then others
  const commonPorts = [5000, 5001, 5002, basePort, 5003, 3000, 3001];
  
  for (const port of commonPorts) {
    try {
      const response = await fetch(`http://${hostname}:${port}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000),
      });
      
      if (response.ok) {
        console.log(`[portDetector] Found backend on ${hostname}:${port} via health check`);
        return port;
      }
    } catch (error) {
      // Port not available, try next
      continue;
    }
  }
  
  return null;
}

/**
 * Get cached port if still valid
 */
function getCachedPort(): number | null {
  try {
    const storage = getSafeLocalStorage();
    const cached = storage ? storage.getItem(PORT_CACHE_KEY) : null;
    if (cached) {
      const portInfo: PortInfo = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - portInfo.timestamp < PORT_CACHE_TIMEOUT) {
        return portInfo.port;
      }
    }
  } catch (error) {
    // Invalid cache, ignore
  }
  
  return null;
}

/**
 * Cache the detected port
 */
function cachePort(port: number): void {
  try {
    const portInfo: PortInfo = {
      port,
      url: `http://localhost:${port}`,
      timestamp: Date.now(),
    };
    const storage = getSafeLocalStorage();
    if (storage) {
      storage.setItem(PORT_CACHE_KEY, JSON.stringify(portInfo));
    }
  } catch (error) {
    // localStorage not available, ignore
  }
}

/**
 * Clear the cached port
 * Useful when the backend port changes
 */
export function clearPortCache(): void {
  try {
    const storage = getSafeLocalStorage();
    if (storage) {
      storage.removeItem(PORT_CACHE_KEY);
      console.log('[portDetector] Port cache cleared');
    }
  } catch (error) {
    console.warn('[portDetector] Failed to clear port cache:', error);
  }
}

/**
 * Detect backend port using multiple methods
 */
export async function detectBackendPort(basePort: number = 5000, hostname: string = 'localhost'): Promise<number> {
  // Check cache first
  const cachedPort = getCachedPort();
  if (cachedPort) {
    // Verify cached port is still working (try both hostname and localhost)
    for (const testHostname of [hostname, 'localhost']) {
      try {
        const response = await fetch(`http://${testHostname}:${cachedPort}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(500),
        });
        if (response.ok) {
          console.log(`[portDetector] Using cached port ${cachedPort} on ${testHostname}`);
          return cachedPort;
        }
      } catch (error) {
        // Try next hostname
        continue;
      }
    }
  }
  
  // Try reading from port.json file FIRST (most reliable if backend wrote it)
  // Try both hostname and localhost
  for (const testHostname of [hostname, 'localhost']) {
    const detectedPort = await detectPortFromFile(testHostname);
    if (detectedPort) {
      cachePort(detectedPort);
      return detectedPort;
    }
  }
  
  // Try API endpoint (will try common ports including 5002)
  // Try both hostname and localhost
  for (const testHostname of [hostname, 'localhost']) {
    const detectedPort = await detectPortFromAPI(basePort, testHostname);
    if (detectedPort) {
      cachePort(detectedPort);
      return detectedPort;
    }
  }
  
  // Try health check on common ports (prioritize 5001 as default, then 5002 as fallback)
  // Try both hostname and localhost
  for (const testHostname of [hostname, 'localhost']) {
    const detectedPort = await detectPortByHealthCheck(basePort, testHostname);
    if (detectedPort) {
      cachePort(detectedPort);
      return detectedPort;
    }
  }
  
  // Fallback to base port
  console.warn(`[portDetector] Could not detect port on ${hostname} or localhost, using fallback: ${basePort}`);
  return basePort;
}

/**
 * Get backend base URL
 */
export async function getBackendUrl(): Promise<string> {
  // Method 0: Check for production/hosted backend URL (highest priority)
  const configUrl = getProductionUrlFromConfig();
  if (configUrl) {
    console.log(`[portDetector] Using hosted backend URL: ${configUrl}`);
    return configUrl;
  }
  
  let hostname = 'localhost';
  
  // Method 1: Try Expo Constants (most reliable for React Native/Expo)
  const expoHostname = getDevServerHostname();
  if (expoHostname) {
    hostname = expoHostname;
    console.log(`[portDetector] Using Expo hostname: ${hostname}`);
  }
  
  // Try to detect the dev server IP from various sources
  if (typeof window !== 'undefined') {
    // Check for devtunnels
    if (window.location && window.location.hostname && window.location.hostname.includes("devtunnels")) {
      return `https://${window.location.hostname}`;
    }
    
    // Method 2: Get from window.location.hostname
    if (hostname === 'localhost' && window.location && window.location.hostname) {
      const locationHostname = window.location.hostname;
      const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(locationHostname);
      const isLocalhost = locationHostname === 'localhost' || locationHostname === '127.0.0.1' || locationHostname === '0.0.0.0';
      
      if (isIPAddress && !isLocalhost) {
        hostname = locationHostname;
        console.log(`[portDetector] Using window.location hostname: ${hostname}`);
      }
    }
  }
  
  // If still on localhost (no local dev server detected), still try to detect port
  // Don't immediately fall back to production URL - the backend might be running locally
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log(`[portDetector] Localhost detected, will try to detect local backend port`);
    // Try to detect if backend is running locally first
    const localPort = await detectBackendPort(5000, 'localhost');
    if (localPort) {
      // Verify the port is actually serving before claiming local backend exists
      try {
        const verifyResponse = await fetch(`http://localhost:${localPort}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000),
        });
        if (verifyResponse.ok) {
          const url = `http://localhost:${localPort}`;
          console.log(`[portDetector] ✅ Local backend verified: ${url}`);
          return url;
        }
      } catch (e) {
        // Port not actually serving, fall through to production
      }
    }
    // No local backend available, use hosted backend URL
    console.log(`[portDetector] No local backend detected, using hosted URL: ${PRODUCTION_BACKEND_URL}`);
    return PRODUCTION_BACKEND_URL;
  }
  
  console.log(`[portDetector] Detecting port for hostname: ${hostname}`);
  const port = await detectBackendPort(5000, hostname);
  const url = `http://${hostname}:${port}`;
  console.log(`[portDetector] Final backend URL: ${url}`);
  return url;
}

/**
 * Get backend API URL
 */
export async function getBackendApiUrl(): Promise<string> {
  const baseUrl = await getBackendUrl();
  return `${baseUrl}/api`;
}

/**
 * Synchronous version that uses cached port or falls back to default
 * Use this for immediate needs, but prefer async versions
 * Defaults to 5000 (current backend port)
 */
export function getBackendPortSync(defaultPort: number = 5000): number {
  const cached = getCachedPort();
  // Try to read from port.json if available (synchronous fetch won't work, so use cached or default)
  // The async version will update the cache
  return cached || defaultPort;
}

const PRODUCTION_BACKEND_URL = 'https://hustlex-production.up.railway.app';

let _cachedProductionUrl: string | null = null;

function getProductionUrlFromConfig(): string | null {
  if (_cachedProductionUrl) return _cachedProductionUrl;

  // Check EXPO_PUBLIC_API_URL env variable (Expo exposes EXPO_PUBLIC_* to client)
  try {
    if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
      const envUrl = process.env.EXPO_PUBLIC_API_URL;
      if (envUrl && envUrl !== 'null' && envUrl.trim() !== '') {
        _cachedProductionUrl = envUrl;
        return envUrl;
      }
    }
  } catch (e) {
    // process.env not available
  }

  // Check expo-constants extra.backendUrl (works in all modes)
  try {
    if (typeof require !== 'undefined') {
      const Constants = require('expo-constants');
      const url = Constants?.default?.expoConfig?.extra?.backendUrl;
      if (url && url !== 'null' && url.trim() !== '') {
        _cachedProductionUrl = url;
        return url;
      }
    }
  } catch (e) {
    // expo-constants not available
  }
  return null;
}

export function getBackendUrlSync(): string {
  // Method 0: Check for production/hosted backend URL (only in production release builds)
  const configUrl = getProductionUrlFromConfig();
  if (configUrl) {
    console.log(`[portDetector] Using hosted backend URL (sync): ${configUrl}`);
    return configUrl;
  }
  
  let hostname = 'localhost';
  
  // Method 1: Try Expo Constants dev server hostname
  const expoHostname = getDevServerHostname();
  if (expoHostname) {
    hostname = expoHostname;
    console.log(`[portDetector] Detected IP from Expo Constants: ${hostname}`);
  }
  
  // Method 2: Try to use cached port (from async detection)
  const cachedPort = getCachedPort();
  if (cachedPort && hostname !== 'localhost') {
    const url = `http://${hostname}:${cachedPort}`;
    console.log(`[portDetector] Using cached port (sync): ${url}`);
    return url;
  }
  
  // Try to detect the dev server IP from various sources
  if (typeof window !== 'undefined') {
    // Check for devtunnels
    if (window.location && window.location.hostname && window.location.hostname.includes("devtunnels")) {
      return `https://${window.location.hostname}`;
    }
    
    // Method 2: Get from window.location.hostname (works in web and some RN environments)
    if (hostname === 'localhost' && window.location && window.location.hostname) {
      const locationHostname = window.location.hostname;
      const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(locationHostname);
      const isLocalhost = locationHostname === 'localhost' || locationHostname === '127.0.0.1' || locationHostname === '0.0.0.0';
      
      if (isIPAddress && !isLocalhost) {
        hostname = locationHostname;
        console.log(`[portDetector] Detected IP from window.location: ${hostname}`);
      }
    }
    
    // Method 3: Try to extract from bundle URL (for React Native/Expo web)
    if (hostname === 'localhost' && typeof document !== 'undefined') {
      try {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const src = scripts[i].src;
          if (src && src.includes('://')) {
            try {
              const url = new URL(src);
              const urlHostname = url.hostname;
              const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(urlHostname);
              if (isIPAddress && urlHostname !== '127.0.0.1' && urlHostname !== '0.0.0.0') {
                hostname = urlHostname;
                console.log(`[portDetector] Detected IP from script src: ${hostname}`);
                break;
              }
            } catch (e) {
              // Invalid URL, continue
            }
          }
        }
      } catch (e) {
        // Can't access scripts, continue
      }
    }
    
    // Method 4: Try to extract from current page URL
    if (hostname === 'localhost' && window.location && window.location.href) {
      try {
        const url = new URL(window.location.href);
        const urlHostname = url.hostname;
        const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(urlHostname);
        if (isIPAddress && urlHostname !== '127.0.0.1' && urlHostname !== '0.0.0.0') {
          hostname = urlHostname;
          console.log(`[portDetector] Detected IP from window.location.href: ${hostname}`);
        }
      } catch (e) {
        // Invalid URL, continue
      }
    }
  }
  
  const port = getBackendPortSync(5000); // Default to 5000
  const url = `http://${hostname}:${port}`;
  console.log(`[portDetector] Final backend URL: ${url}`);
  return url;
}

export function getBackendApiUrlSync(): string {
  const baseUrl = getBackendUrlSync();
  return `${baseUrl}/api`;
}
