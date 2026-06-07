const crypto = require("crypto");
const Message = require("../models/Message");

function createClientMessageId() {
  return `temp_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

function normalizeFiles(data) {
  let files = [];
  if (Array.isArray(data.files)) {
    if (data.files.length > 0 && typeof data.files[0] === "string") {
      try {
        const parsed = JSON.parse(data.files[0]);
        if (Array.isArray(parsed)) files = parsed;
      } catch {
        files = [];
      }
    } else {
      files = data.files;
    }
  } else if (typeof data.files === "string") {
    try {
      const parsed = JSON.parse(data.files);
      if (Array.isArray(parsed)) files = parsed;
    } catch {
      files = [];
    }
  } else if (data.files && typeof data.files === "object") {
    files = [data.files];
  }
  return files;
}

/**
 * Persist a chat message and return the payload for Socket.IO broadcast.
 */
async function persistChatMessage(data) {
  const {
    senderId,
    receiverId,
    message,
    conversationId,
    messageType,
    voiceData,
    voiceDuration,
  } = data;

  const files = normalizeFiles(data);
  const formattedConversationId =
    conversationId || [senderId, receiverId].sort().join("_");

  const newMessage = new Message({
    conversationId: formattedConversationId,
    senderId,
    receiverId,
    message,
    messageType: messageType || "text",
    voiceData: voiceData || undefined,
    voiceDuration: voiceDuration || undefined,
    files: files || [],
  });

  await newMessage.save();
  await newMessage.populate("senderId", "email profile");

  const messageObj = newMessage.toObject();
  return {
    ...messageObj,
    sender: newMessage.senderId,
    conversationId: formattedConversationId,
    files: messageObj.files || [],
    voiceData: messageObj.voiceData || undefined,
    voiceDuration: messageObj.voiceDuration || undefined,
    messageType: messageObj.messageType || "text",
  };
}

/**
 * Optimistic payload for instant UI (before MongoDB write).
 */
function buildOptimisticMessage(data) {
  const {
    senderId,
    receiverId,
    message,
    conversationId,
    messageType,
    voiceData,
    voiceDuration,
    clientMessageId,
  } = data;

  const files = normalizeFiles(data);
  const formattedConversationId =
    conversationId || [senderId, receiverId].sort().join("_");
  const id = clientMessageId || createClientMessageId();

  return {
    _id: id,
    id,
    clientMessageId: id,
    conversationId: formattedConversationId,
    senderId,
    receiverId,
    message,
    messageType: messageType || "text",
    voiceData: voiceData || undefined,
    voiceDuration: voiceDuration || undefined,
    files: files || [],
    pending: true,
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  persistChatMessage,
  buildOptimisticMessage,
  createClientMessageId,
  normalizeFiles,
};

