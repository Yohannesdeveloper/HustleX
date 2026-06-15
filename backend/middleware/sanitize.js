const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Setup DOMPurify with JSDOM for server-side sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Sanitize string input to prevent XSS attacks
 * Removes dangerous HTML tags and attributes while preserving safe content
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  
  // Use DOMPurify to sanitize HTML and prevent XSS
  return purify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Sanitize object recursively to prevent XSS in all string fields
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
}

/**
 * Prevent NoSQL injection by sanitizing query operators
 */
function preventNoSQLInjection(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  // Preserve arrays — iterate indices like object keys but keep array type
  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      // Block MongoDB operators in user input
      if (key.startsWith('$') || (typeof value === 'object' && value !== null)) {
        // Check for MongoDB query operators
        if (typeof value === 'object' && value !== null) {
          const hasOperators = Object.keys(value).some(k => k.startsWith('$'));
          if (hasOperators && !['$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin', '$exists'].includes(key)) {
            console.warn(`Blocked potential NoSQL injection attempt: ${key}`);
            continue; // Skip this field
          }
          sanitized[key] = preventNoSQLInjection(value);
        } else {
          sanitized[key] = value;
        }
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Middleware to sanitize all request inputs
 */
function sanitizeInput(req, res, next) {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
    req.body = preventNoSQLInjection(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
    req.query = preventNoSQLInjection(req.query);
  }
  
  // Sanitize params
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
}

/**
 * Validate and sanitize URL to prevent malicious links
 * Allows only http, https, ftp, and mailto protocols
 * Blocks javascript:, data:, vbscript:, and other dangerous protocols
 */
function validateAndSanitizeURL(url) {
  if (!url || typeof url !== 'string') return url;
  
  const trimmedUrl = url.trim();
  
  // Allow empty strings
  if (trimmedUrl === '') return trimmedUrl;
  
  // Add https:// if protocol is missing
  let sanitizedUrl = trimmedUrl;
  if (!sanitizedUrl.startsWith('http://') && 
      !sanitizedUrl.startsWith('https://') && 
      !sanitizedUrl.startsWith('ftp://') &&
      !sanitizedUrl.startsWith('mailto:')) {
    sanitizedUrl = 'https://' + sanitizedUrl;
  }
  
  // Validate URL format using regex
  const urlPattern = /^(https?:\/\/|ftp:\/\/|mailto:)(([\da-z.-]+)\.([a-z.]{2,6})|localhost)(:\d+)?(\/[a-zA-Z0-9@:%_+.~#?&\/=-]*)?$/i;
  
  if (!urlPattern.test(sanitizedUrl)) {
    console.warn(`Blocked invalid URL: ${trimmedUrl}`);
    return null; // Return null for invalid URLs
  }
  
  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'blob:',
    'about:',
    'chrome:',
    'moz-extension:',
    'safari-extension:',
  ];
  
  const lowerUrl = sanitizedUrl.toLowerCase();
  if (dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol))) {
    console.warn(`Blocked dangerous protocol in URL: ${trimmedUrl}`);
    return null;
  }
  
  // Block URLs with encoded characters that could bypass filters
  if (sanitizedUrl.includes('%00') || // Null byte
      sanitizedUrl.includes('%0a') || // Newline
      sanitizedUrl.includes('%0d') || // Carriage return
      sanitizedUrl.includes('<') ||
      sanitizedUrl.includes('>') ||
      sanitizedUrl.includes('"') ||
      sanitizedUrl.includes("'") ||
      sanitizedUrl.includes('`')) {
    console.warn(`Blocked URL with suspicious characters: ${trimmedUrl}`);
    return null;
  }
  
  // Validate URL can be parsed
  try {
    const parsedUrl = new URL(sanitizedUrl);
    
    // Block localhost/private IPs in production (optional security measure)
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsedUrl.hostname.toLowerCase();
      const blockedHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
      if (blockedHostnames.includes(hostname)) {
        console.warn(`Blocked localhost/private IP in production: ${trimmedUrl}`);
        return null;
      }
      
      // Block private IP ranges
      if (/^10\./.test(hostname) || 
          /^192\.168\./.test(hostname) ||
          /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) {
        console.warn(`Blocked private IP range: ${trimmedUrl}`);
        return null;
      }
    }
    
    return sanitizedUrl;
  } catch (error) {
    console.warn(`Failed to parse URL: ${trimmedUrl}`, error.message);
    return null;
  }
}

/**
 * Escape HTML entities for safe rendering
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  
  return text.replace(/[&<>"'`=\/]/g, s => map[s]);
}

module.exports = {
  sanitizeInput,
  sanitizeString,
  sanitizeObject,
  preventNoSQLInjection,
  escapeHtml,
  validateAndSanitizeURL,
};
