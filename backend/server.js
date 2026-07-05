const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { Server } = require('socket.io');
const mongoose = require("mongoose");
const { detect: detectPort } = require("detect-port");
const morgan = require("morgan");
dotenv.config();

const { logScaleStatus } = require("./config/scale");
logScaleStatus();

const connectDB = require("./config/database");
const { sanitizeInput } = require("./middleware/sanitize");
const { initializeRedis, cacheMiddleware } = require("./middleware/cache");
const requestTimeout = require("./middleware/timeout");

const { metricsMiddleware, getPrometheusMetrics, recordSocketMessage, recordSocketError } = require("./middleware/metrics");

// Import routes
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const applicationRoutes = require("./routes/applications");
const uploadRoutes = require("./routes/upload");
const notificationRoutes = require("./routes/notifications");
const companyRoutes = require("./routes/companies");
const blogRoutes = require("./routes/blogs");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
const contactRoutes = require("./routes/contact");
const statisticsRoutes = require("./routes/statistics");
const pricingRoutes = require("./routes/pricing");
const seoRoutes = require("./routes/seo");
const seoController = require("./controllers/seoController");
const chatbotRoutes = require("./routes/chatbot");

const app = express();

// Trust the first proxy (required behind nginx / Railway / Vercel reverse proxy)
// so that express-rate-limit and req.ip resolve the real client IP from X-Forwarded-For.
app.set('trust proxy', true);

app.use(metricsMiddleware);

// Serve robots.txt and sitemap.xml directly at root level
app.get("/robots.txt", seoController.getRobots);
app.get("/sitemap.xml", seoController.getSitemap);

// Connect to MongoDB
connectDB();

// CORS must be applied BEFORE helmet/ratelimit to ensure preflights aren't blocked
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CLIENT_URL || "",
      "https://hustlexet.vercel.app",
      "https://hustlex-production.up.railway.app"
    ];
    
    if (allowedOrigins.includes(origin) || origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return callback(null, true);
    }
    
    // For development, allow all origins
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Admin-Code",
    "x-admin-code",
  ],
  optionsSuccessStatus: 200,
  maxAge: 86400, // Cache preflight request for 24 hours
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Compression middleware - MUST be applied early for optimal performance
// Compresses all responses with gzip/brotli (reduces payload size by 60-80%)
app.use(compression({
  level: 6, // Balance between CPU usage and compression ratio (1-9)
  threshold: 1024, // Only compress responses larger than 1KB
}));

// Initialize Redis cache
initializeRedis();

const { isS3Enabled } = require("./services/storage");
const { isQueueEnabled } = require("./lib/redis-config");
console.log(`📦 File storage: ${isS3Enabled() ? "S3 + CDN" : "local disk"}`);
console.log(`📬 Background queues: ${isQueueEnabled() ? "enabled (run npm run worker)" : "disabled"}`);

// Security middleware - MUST be applied early
// Allow images and other static assets to be consumed by the frontend on a different origin
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false, // Required for some features
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for React
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https:", "wss:", "ws:"], // For WebSocket
        mediaSrc: ["'self'", "blob:"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    } : false, // Disable CSP in development
  })
);

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS in production
  if (process.env.NODE_ENV === "production") {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
});

// Request logging with morgan
if (process.env.NODE_ENV === "production") {
  // Use combined format for production (includes more details)
  app.use(morgan('combined', {
    stream: {
      write: (message) => {
        const logMessage = message.trim();
        console.log(logMessage);
        // Write to log file
        const logDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(path.join(logDir, 'access.log'), logMessage + '\n');
      }
    }
  }));
} else {
  // Use dev format for development (colorized, concise)
  app.use(morgan('dev'));
}

// Body parsing middleware - LIMIT SIZE to prevent DoS
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize({
  replaceWith: '_',
}));

// Data sanitization against XSS attacks
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Custom input sanitization middleware
app.use(sanitizeInput);

// Request timeout handling (30 seconds default)
app.use(requestTimeout(30000));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/", seoRoutes);

// Prometheus metrics (K8s / monitoring)
app.get("/metrics", (req, res) => {
  res.set("Content-Type", "text/plain; version=0.0.4");
  res.send(getPrometheusMetrics());
});

// Health check endpoint - Basic
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running", timestamp: new Date().toISOString() });
});

// Enhanced health check - Detailed system status
app.get("/api/health/detailed", async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
    };

    // Check MongoDB connection
    try {
      const dbState = mongoose.connection.readyState;
      health.database = {
        status: dbState === 1 ? "connected" : "disconnected",
        responseTime: null,
      };

      if (dbState === 1) {
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        health.database.responseTime = `${Date.now() - start}ms`;
      }
    } catch (error) {
      health.database = {
        status: "error",
        error: error.message,
      };
      health.status = "degraded";
    }

    // Check Redis connection
    try {
      const { redisClient } = require("./middleware/cache");
      const client = redisClient();
      if (client && client.status === "ready") {
        const start = Date.now();
        await client.ping();
        health.redis = {
          status: "connected",
          responseTime: `${Date.now() - start}ms`,
        };
      } else {
        health.redis = {
          status: "disconnected",
          note: "Redis caching disabled or not ready",
        };
      }
    } catch (error) {
      health.redis = {
        status: "error",
        error: error.message,
      };
      health.status = "degraded";
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    health.memory = {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
    };

    // CPU usage (basic)
    health.cpu = {
      cores: require("os").cpus().length,
      platform: process.platform,
      nodeVersion: process.version,
    };

    const { isQueueEnabled } = require("./lib/redis-config");
    health.queues = { enabled: isQueueEnabled() };
    if (isQueueEnabled()) {
      try {
        const { getQueueStats } = require("./services/queue-stats");
        health.queues.stats = await getQueueStats();
      } catch (queueErr) {
        health.queues.error = queueErr.message;
      }
    }

    // Determine overall status
    if (health.database.status === "error" && health.redis.status === "error") {
      health.status = "unhealthy";
      res.status(503);
    } else if (health.status === "degraded") {
      res.status(200); // Still respond OK but with degraded status
    } else {
      res.status(200);
    }

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// SEO Pre-rendering middleware for public pages (placed before 404 handler)
app.use(seoController.prerenderPage);

// 404 handler — catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Port detection utility
async function findAvailablePort(desiredPort) {
  try {
    const availablePort = await detectPort(desiredPort);
    if (availablePort !== desiredPort) {
      console.log(`⚠️  Port ${desiredPort} is in use. Using port ${availablePort} instead.`);
    }
    return availablePort;
  } catch (error) {
    console.error("Error detecting port:", error);
    return desiredPort; // Fallback to desired port
  }
}

// Write port to file for frontend to read
function writePortToFile(port) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  const portInfo = {
    port: port,
    url: `http://localhost:${port}`,
    timestamp: new Date().toISOString()
  };

  // Locations to write port.json
  const paths = [
    path.join(__dirname, "..", "port.json"),
    path.join(__dirname, "..", "public", "port.json")
  ];

  paths.forEach(p => {
    try {
      // Ensure directory exists
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(p, JSON.stringify(portInfo, null, 2));
      console.log(`📝 Port info written to ${path.basename(p)} at ${p}`);
    } catch (error) {
      // Only log if it's not a "no such file or directory" error for the public folder
      // (which might not exist in some environments)
      console.error(`Error writing port to ${p}:`, error.message);
    }
  });
}

// Initialize port detection
const desiredPort = parseInt(process.env.PORT) || 5000;
let PORT = desiredPort;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO (Redis adapter attached in startup after connect attempt)
const { createAdapter } = require("@socket.io/redis-adapter");
const { initSocketRedis, getSocketPubClient } = require("./lib/redis-socket");

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [process.env.CLIENT_URL || 'https://hustlex.com']
      : [
          process.env.CLIENT_URL || 'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:3000',
          'http://localhost:5173',
        ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  allowEIO3: true,
  maxHttpBufferSize: 10 * 1024 * 1024, // 10MB
  // Tune for high concurrency
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  transports: ['websocket', 'polling'],
});

const { setIO } = require("./services/realtime");
setIO(io);

// Make io accessible to routes
app.set('io', io);

/**
 * Redis-backed socket presence store.
 * Replaces the in-process Map so all pods share online state.
 * Key: hustlex:presence:{userId}  Value: socketId  TTL: 90s (refreshed on activity)
 */
const PRESENCE_PREFIX = 'hustlex:presence:';
const PRESENCE_TTL = 90; // seconds

async function setUserPresence(userId, socketId) {
  const redis = getSocketPubClient();
  if (!redis) return;
  try {
    await redis.setex(`${PRESENCE_PREFIX}${userId}`, PRESENCE_TTL, socketId);
  } catch (err) {
    console.error("setUserPresence error:", err.message);
  }
}

async function getUserSocketId(userId) {
  const redis = getSocketPubClient();
  if (!redis) return null;
  try {
    return await redis.get(`${PRESENCE_PREFIX}${userId}`);
  } catch (err) {
    console.error("getUserSocketId error:", err.message);
    return null;
  }
}

async function removeUserPresence(userId) {
  const redis = getSocketPubClient();
  if (!redis) return;
  try {
    await redis.del(`${PRESENCE_PREFIX}${userId}`);
  } catch (err) {
    console.error("removeUserPresence error:", err.message);
  }
}

// Expose helpers to routes that need to emit to specific users
app.set('getUserSocketId', getUserSocketId);

// Legacy in-process map kept for setConnectedUsers compatibility
const connectedUsers = new Map();
if (messageRoutes.setConnectedUsers) {
  messageRoutes.setConnectedUsers(connectedUsers);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins with their userId
  socket.on("join", (userId) => {
    if (userId) {
      // Update both local map (for same-pod fast path) and Redis (for cross-pod routing)
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      setUserPresence(userId, socket.id);
      // Join a named room so any pod can emit to this user via io.to(userId)
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined with socket ${socket.id}`);
    }
  });

  // Handle sending messages — async queue (scale) or inline persist
  socket.on("sendMessage", async (data) => {
    try {
      const { senderId, receiverId } = data;
      const {
        persistChatMessage,
        buildOptimisticMessage,
        createClientMessageId,
      } = require("./services/message-persist");
      const {
        isMessageAsyncEnabled,
        enqueueChatMessageAsync,
        persistChatMessageQueued,
      } = require("./services/queue-helpers");

      const clientMessageId = data.clientMessageId || createClientMessageId();

      if (isMessageAsyncEnabled()) {
        const optimistic = buildOptimisticMessage({ ...data, clientMessageId });
        const senderRoom = `user:${socket.userId || senderId}`;
        io.to(senderRoom).emit("newMessage", optimistic);
        await enqueueChatMessageAsync({ ...data, clientMessageId });
        recordSocketMessage();
        return;
      }

      let messageData;
      try {
        messageData = await persistChatMessageQueued(data);
        if (!messageData) {
          messageData = await persistChatMessage(data);
        }
      } catch (queueErr) {
        console.warn("Message queue failed, saving inline:", queueErr.message);
        messageData = await persistChatMessage(data);
      }

      io.to(`user:${receiverId}`).emit("newMessage", messageData);
      io.to(`user:${socket.userId || senderId}`).emit("newMessage", messageData);
      recordSocketMessage();
    } catch (error) {
      console.error("Error sending message:", error);
      recordSocketError();
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // Handle typing indicator — emit to named room (works cross-pod)
  socket.on("typing", (data) => {
    const { receiverId, conversationId } = data;
    io.to(`user:${receiverId}`).emit("userTyping", {
      senderId: socket.userId,
      conversationId,
    });
  });

  socket.on("stopTyping", (data) => {
    const { receiverId, conversationId } = data;
    io.to(`user:${receiverId}`).emit("userStoppedTyping", {
      senderId: socket.userId,
      conversationId,
    });
  });

  // Handle editing messages
  socket.on("editMessage", async (data) => {
    try {
      const Message = require("./models/Message");
      const { senderId, receiverId, message, conversationId, messageId } = data;

      // Verify the message exists
      const messageToEdit = await Message.findById(messageId);
      if (!messageToEdit) {
        socket.emit("messageError", { error: "Message not found" });
        return;
      }

      // Verify sender owns the message - use socket.userId (authenticated) instead of trusting client data
      const authenticatedUserId = socket.userId || senderId;
      const messageOwnerId = messageToEdit.senderId.toString();
      const authUserIdStr = authenticatedUserId.toString();

      if (messageOwnerId !== authUserIdStr) {
        console.error(`❌ Unauthorized edit attempt: User ${authUserIdStr} tried to edit message ${messageId} owned by ${messageOwnerId}`);
        socket.emit("messageError", { error: "Unauthorized to edit this message" });
        return;
      }

      console.log(`✅ Authorized edit: User ${authUserIdStr} editing message ${messageId}`);

      // Update message in database
      messageToEdit.message = message;
      messageToEdit.isEdited = true;
      messageToEdit.editedAt = new Date();
      await messageToEdit.save();

      // Populate sender and receiver info
      await messageToEdit.populate("senderId", "email profile");
      await messageToEdit.populate("receiverId", "email profile");

      // Extract IDs properly
      const senderIdStr = messageToEdit.senderId._id?.toString() || messageToEdit.senderId.toString();
      const receiverIdStr = messageToEdit.receiverId._id?.toString() || messageToEdit.receiverId.toString();
      const conversationIdStr = messageToEdit.conversationId || [senderIdStr, receiverIdStr].sort().join("_");

      const editedMessageData = {
        ...messageToEdit.toObject(),
        sender: messageToEdit.senderId,
        senderId: senderIdStr,
        receiverId: receiverIdStr,
        conversationId: conversationIdStr,
        messageId: messageId.toString(),
        _id: messageId.toString(),
        id: messageId.toString(),
        action: 'edit',
        isEdit: true,
        editedAt: messageToEdit.editedAt || new Date().toISOString(),
      };

      console.log("📤 Broadcasting message edit:", {
        messageId: messageId.toString(),
        senderId: senderIdStr,
        receiverId: receiverIdStr,
        conversationId: conversationIdStr,
        message: editedMessageData.message,
      });

      // Emit to receiver room (works cross-pod via Redis adapter)
      io.to(`user:${receiverIdStr}`).emit("messageEdited", editedMessageData);
      console.log(`✅ Sent edit to receiver room user:${receiverIdStr}`);

      // Confirm to sender room
      io.to(`user:${senderIdStr}`).emit("messageEdited", editedMessageData);
      console.log(`✅ Confirmed edit to sender room user:${senderIdStr}`);
    } catch (error) {
      console.error("Error editing message:", error);
      socket.emit("messageError", { error: "Failed to edit message" });
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      await removeUserPresence(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

// Note: /api/health is already registered above (lines ~219–314).
// The duplicate has been removed to prevent silent route override.

// Port info endpoint for frontend
app.get("/api/port", (req, res) => {
  res.json({
    port: PORT,
    url: `http://localhost:${PORT}`,
  });
});

// Start server with automatic port detection
(async () => {
  try {
    const socketRedis = await initSocketRedis();
    if (socketRedis.ready) {
      io.adapter(createAdapter(socketRedis.pubClient, socketRedis.subClient));
    }

    PORT = await findAvailablePort(desiredPort);
    writePortToFile(PORT);

    server.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔌 Socket.IO server initialized`);
      console.log(`💾 MongoDB: ${mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected"}`);
      if (process.env.NODEMON) {
        console.log(`🔄 Nodemon: watching for file changes`);
      }
      console.log(`========================================\n`);

      // Register Telegram webhook for login confirmation callbacks
      const tgBotToken = process.env.TELEGRAM_LOGIN_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
      const tgWebhookUrl = process.env.TELEGRAM_LOGIN_WEBHOOK_URL || process.env.TELEGRAM_WEBHOOK_URL;
      if (tgBotToken && tgWebhookUrl) {
        // First, delete the existing webhook to clear any old configuration
        fetch(`https://api.telegram.org/bot${tgBotToken}/deleteWebhook`)
          .then(() => console.log("🤖 Old webhook deleted"))
          .catch((err) => console.log("No existing webhook to delete:", err.message));


        // Then register the new webhook with all updates allowed
        const webhookEndpoint = `${tgWebhookUrl}`;
        fetch(`https://api.telegram.org/bot${tgBotToken}/setWebhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: webhookEndpoint,
            // Remove allowed_updates to receive all update types (messages, commands, callbacks, etc.)
          }),
        })
          .then((r) => r.json())
          .then((result) => {
            console.log(
              `🤖 Telegram webhook registered: ${result.ok ? "✅" : "❌"}`,
              result.description || ""
            );
          })
          .catch((err) =>
            console.error("Failed to register Telegram webhook:", err.message)
          );
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();

// Error handling to prevent crashes
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  console.error("Stack:", err.stack);
  // Don't exit, keep server running
  // In development with nodemon, it will auto-restart if needed
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  console.error("Stack:", err.stack);
  // In development, log but don't exit immediately
  // Nodemon will handle restarts
  if (process.env.NODE_ENV === "production") {
    // Graceful shutdown for production
    server.close(() => {
      console.log("Server closed due to uncaught exception");
      process.exit(1);
    });
  } else {
    // In development, just log and let nodemon restart
    console.error("Uncaught exception in development mode. Nodemon will restart.");
  }
});

// Handle server errors
server.on("error", async (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Attempting to find another port...`);
    try {
      const newPort = await findAvailablePort(PORT + 1);
      PORT = newPort;
      writePortToFile(PORT);
      server.listen(PORT, () => {
        console.log(`🚀 Server restarted on port ${PORT}`);
      });
    } catch (error) {
      console.error("Failed to find available port:", error);
      process.exit(1);
    }
  } else {
    console.error("Server error:", err);
  }
});
