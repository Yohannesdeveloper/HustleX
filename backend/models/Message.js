const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    messageType: {
      type: String,
      enum: ['text', 'voice', 'files', 'text_and_voice', 'text_and_files', 'mixed'],
      default: 'text',
    },
    voiceData: {
      type: String, // Base64 encoded audio data
    },
    voiceDuration: {
      type: Number, // Duration in seconds
    },
    // Store arbitrary file metadata (name, size, type, dataUrl, etc.)
    // Use Mixed to be fully compatible with any client payload shape
    files: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });

module.exports = mongoose.model("Message", messageSchema);
