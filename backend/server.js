const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { detect: detectPort } = require("detect-port");
dotenv.config();

const connectDB = require("./config/database");

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
const chatbotRoutes = require("./routes/chatbot");
const statisticsRoutes = require("./routes/statistics");
const pricingRoutes = require("./routes/pricing");

const app = express();

// Connect to MongoDB
connectDB();

// CORS must be applied BEFORE helmet/ratelimit to ensure preflights aren't blocked
const corsOptions = {
  origin: true, // reflect request origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Admin-Code",
    "x-admin-code",
  ],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Security middleware
// Allow images and other static assets to be consumed by the frontend on a different origin
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP for Socket.IO compatibility
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "development" ? 2000 : 100, // much higher limit for dev
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "1gb" }));
app.use(express.urlencoded({ extended: true, limit: "1gb" }));

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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

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

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  allowEIO3: true,
  // Increase payload size to support multiple file/voice attachments in chat
  maxHttpBufferSize: 10 * 1024 * 1024, // 10MB
});

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
const connectedUsers = new Map(); // userId -> socketId

// Make connectedUsers accessible to message routes
if (messageRoutes.setConnectedUsers) {
  messageRoutes.setConnectedUsers(connectedUsers);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins with their userId
  socket.on("join", (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} joined with socket ${socket.id}`);
    }
  });

  // Handle sending messages
  socket.on("sendMessage", async (data) => {
    try {
      const Message = require("./models/Message");
      const { senderId, receiverId, message, conversationId, messageType, voiceData, voiceDuration } = data;

      // Normalize files payload – handle both structured arrays and stringified data
      let files = [];
      if (Array.isArray(data.files)) {
        // Sometimes the frontend (or older clients) might send files as a single JSON string
        if (data.files.length > 0 && typeof data.files[0] === "string") {
          try {
            const parsed = JSON.parse(data.files[0]);
            if (Array.isArray(parsed)) {
              files = parsed;
            }
          } catch (e) {
            console.error("Failed to parse stringified files array:", e);
            files = [];
          }
        } else {
          files = data.files;
        }
      } else if (typeof data.files === "string") {
        // Direct JSON string case
        try {
          const parsed = JSON.parse(data.files);
          if (Array.isArray(parsed)) {
            files = parsed;
          }
        } catch (e) {
          console.error("Failed to parse files JSON string:", e);
          files = [];
        }
      } else if (data.files && typeof data.files === "object") {
        // Single file object case
        files = [data.files];
      }

      // Ensure conversationId is properly formatted
      const formattedConversationId = conversationId || [senderId, receiverId].sort().join("_");

      // Create message in database
      const newMessage = new Message({
        conversationId: formattedConversationId,
        senderId,
        receiverId,
        message,
        messageType: messageType || 'text',
        voiceData: voiceData || undefined,
        voiceDuration: voiceDuration || undefined,
        files: files || [],
      });
      await newMessage.save();

      // Populate sender info
      await newMessage.populate("senderId", "email profile");

      // Ensure all fields are included, especially files array
      const messageObj = newMessage.toObject();
      const messageData = {
        ...messageObj,
        sender: newMessage.senderId,
        conversationId: formattedConversationId,
        // Explicitly include files, voiceData, etc. to ensure they're sent
        files: messageObj.files || [],
        voiceData: messageObj.voiceData || undefined,
        voiceDuration: messageObj.voiceDuration || undefined,
        messageType: messageObj.messageType || 'text',
      };

      console.log("📤 Broadcasting message with files:", {
        messageId: messageData._id,
        hasFiles: messageData.files && messageData.files.length > 0,
        fileCount: messageData.files ? messageData.files.length : 0,
        messageType: messageData.messageType,
      });

      // Emit to receiver if online
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", messageData);
      }

      // Confirm to sender
      socket.emit("messageSent", messageData);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { receiverId, conversationId } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        senderId: socket.userId,
        conversationId,
      });
    }
  });

  socket.on("stopTyping", (data) => {
    const { receiverId, conversationId } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", {
        senderId: socket.userId,
        conversationId,
      });
    }
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

      // Emit to receiver if online
      const receiverSocketId = connectedUsers.get(receiverIdStr);
      if (receiverSocketId) {
        console.log(`✅ Sending edit to receiver ${receiverIdStr} at socket ${receiverSocketId}`);
        io.to(receiverSocketId).emit("messageEdited", editedMessageData);
      } else {
        console.log(`⚠️ Receiver ${receiverIdStr} is not online`);
      }

      // Confirm to sender (always emit to sender)
      const senderSocketId = connectedUsers.get(senderIdStr);
      if (senderSocketId && senderSocketId !== socket.id) {
        // Only emit separately if it's a different socket (shouldn't happen, but just in case)
        console.log(`✅ Confirming edit to sender ${senderIdStr} at socket ${senderSocketId}`);
        io.to(senderSocketId).emit("messageEdited", editedMessageData);
      }
      // Also emit to the current socket (sender)
      socket.emit("messageEdited", editedMessageData);
    } catch (error) {
      console.error("Error editing message:", error);
      socket.emit("messageError", { error: "Failed to edit message" });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

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
    PORT = await findAvailablePort(desiredPort);
    writePortToFile(PORT);

    server.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔌 Socket.IO server initialized`);
      console.log(`💾 MongoDB: ${mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected"}`);
      console.log(`🔄 Nodemon: Watching for changes...`);
      console.log(`========================================\n`);
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
