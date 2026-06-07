/**
 * API Gateway / Router for Microservices
 * Routes requests to appropriate microservices
 * This prepares the codebase for microservices architecture
 */

const express = require("express");
const axios = require("axios");
const { externalApiCircuitBreaker } = require("../middleware/circuit-breaker");

const router = express.Router();

// ================================
// Service Registry
// Maps service names to their URLs
// In production, this would use AWS Service Discovery or Consul
// ================================
const serviceRegistry = {
  "auth-service": process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  "job-service": process.env.JOB_SERVICE_URL || "http://localhost:5002",
  "chat-service": process.env.CHAT_SERVICE_URL || "http://localhost:5003",
  "payment-service": process.env.PAYMENT_SERVICE_URL || "http://localhost:5004",
  "notification-service": process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5005",
};

// ================================
// Service Health Cache
// Track which services are healthy
// ================================
const serviceHealth = {};

async function checkServiceHealth(serviceName, url) {
  try {
    const response = await axios.get(`${url}/health`, { timeout: 3000 });
    serviceHealth[serviceName] = {
      healthy: response.status === 200,
      lastChecked: new Date().toISOString(),
      responseTime: response.headers["x-response-time"] || "unknown",
    };
    return serviceHealth[serviceName];
  } catch (error) {
    serviceHealth[serviceName] = {
      healthy: false,
      lastChecked: new Date().toISOString(),
      error: error.message,
    };
    return serviceHealth[serviceName];
  }
}

// ================================
// Proxy Request to Microservice
// ================================
async function proxyToService(req, res, serviceName, path) {
  const serviceUrl = serviceRegistry[serviceName];
  
  if (!serviceUrl) {
    return res.status(502).json({
      message: `Service not found: ${serviceName}`,
      error: "SERVICE_UNAVAILABLE",
    });
  }

  // Check circuit breaker
  const isHealthy = serviceHealth[serviceName]?.healthy;
  if (!isHealthy && serviceHealth[serviceName]) {
    return res.status(503).json({
      message: `Service temporarily unavailable: ${serviceName}`,
      error: "SERVICE_DOWN",
      retryAfter: 30,
    });
  }

  try {
    // Forward request to microservice
    const response = await externalApiCircuitBreaker.execute(async () => {
      return await axios({
        method: req.method,
        url: `${serviceUrl}${path}`,
        headers: {
          ...req.headers,
          host: new URL(serviceUrl).host,
        },
        data: req.body,
        params: req.query,
        timeout: 30000,
        validateStatus: () => true, // Don't throw on error status codes
      });
    });

    // Forward response
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`❌ Failed to proxy to ${serviceName}:`, error.message);
    
    // Update health status
    await checkServiceHealth(serviceName, serviceUrl);

    res.status(502).json({
      message: `Service error: ${serviceName}`,
      error: error.message,
    });
  }
}

// ================================
// Gateway Routes
// ================================

// Auth Service
router.all("/auth/*", (req, res) => {
  const path = req.originalUrl.replace("/gateway/auth", "");
  proxyToService(req, res, "auth-service", path);
});

// Job Service
router.all("/jobs/*", (req, res) => {
  const path = req.originalUrl.replace("/gateway/jobs", "");
  proxyToService(req, res, "job-service", path);
});

// Chat Service
router.all("/chat/*", (req, res) => {
  const path = req.originalUrl.replace("/gateway/chat", "");
  proxyToService(req, res, "chat-service", path);
});

// Payment Service
router.all("/payments/*", (req, res) => {
  const path = req.originalUrl.replace("/gateway/payments", "");
  proxyToService(req, res, "payment-service", path);
});

// Notification Service
router.all("/notifications/*", (req, res) => {
  const path = req.originalUrl.replace("/gateway/notifications", "");
  proxyToService(req, res, "notification-service", path);
});

// ================================
// Gateway Health Check
// ================================
router.get("/health", async (req, res) => {
  const health = {
    service: "api-gateway",
    timestamp: new Date().toISOString(),
    status: "healthy",
    services: {},
  };

  // Check all registered services
  for (const [name, url] of Object.entries(serviceRegistry)) {
    health.services[name] = await checkServiceHealth(name, url);
  }

  // Count healthy services
  const healthyCount = Object.values(health.services).filter(s => s.healthy).length;
  const totalCount = Object.keys(health.services).length;

  if (healthyCount === 0) {
    health.status = "unhealthy";
    res.status(503);
  } else if (healthyCount < totalCount) {
    health.status = "degraded";
  }

  res.json(health);
});

// ================================
// Service Discovery Endpoint
// ================================
router.get("/services", (req, res) => {
  res.json({
    services: serviceRegistry,
    health: serviceHealth,
  });
});

module.exports = router;
