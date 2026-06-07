/**
 * Request Timeout Middleware
 * Prevents slow requests from consuming server resources
 * Automatically terminates requests that exceed timeout threshold
 */

function requestTimeout(timeout = 30000) {
  return (req, res, next) => {
    // Set timeout on the request
    req.setTimeout(timeout, () => {
      console.error(`⏱️  Request timeout: ${req.method} ${req.originalUrl}`);
      if (!res.headersSent) {
        res.status(503).json({
          message: "Request timeout - server took too long to respond",
          error: "SERVICE_TIMEOUT",
        });
      }
    });

    // Set timeout on the response
    res.setTimeout(timeout, () => {
      console.error(`⏱️  Response timeout: ${req.method} ${req.originalUrl}`);
      if (!res.headersSent) {
        res.status(503).json({
          message: "Response timeout - operation took too long",
          error: "RESPONSE_TIMEOUT",
        });
      }
    });

    // Track request start time for logging
    req.startTime = Date.now();

    // Override res.json to add response time header before sending
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (!res.headersSent) {
        const duration = Date.now() - req.startTime;
        res.setHeader("X-Response-Time", `${duration}ms`);
        
        // Log slow requests
        if (duration > 2000) {
          console.warn(
            `🐌 Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`
          );
        }
      }
      return originalJson(body);
    };

    // Log requests on finish (for monitoring, not for setting headers)
    res.on("finish", () => {
      const duration = Date.now() - req.startTime;
      
      // Only log, don't set headers here
      if (duration > 5000) {
        console.error(
          `🔴 Very slow request: ${req.method} ${req.originalUrl} - ${duration}ms [${res.statusCode}]`
        );
      }
    });

    next();
  };
}

module.exports = requestTimeout;
