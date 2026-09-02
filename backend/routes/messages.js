const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { auth } = require("../middleware/auth");

// Get connectedUsers map from server (will be set by server.js)
let connectedUsers = new Map();

// Function to set connectedUsers map (called by server.js)
const setConnectedUsers = (map) => {
  connectedUsers = map;
};

// Get all conversations for a user
router.get("/conversations", auth, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const userIdStr = (req.user._id || req.user.id).toString();
    const userObjId = mongoose.Types.ObjectId.isValid(userIdStr)
      ? new mongoose.Types.ObjectId(userIdStr)
      : null;

    const matchConditions = userObjId
      ? [
          { senderId: userObjId },
          { receiverId: userObjId },
          { senderId: userIdStr },
          { receiverId: userIdStr },
        ]
      : [{ senderId: userIdStr }, { receiverId: userIdStr }];

    // Get all unique conversations for this user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: matchConditions,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $addFields: {
          senderIdStr: { $toString: "$senderId" },
          receiverIdStr: { $toString: "$receiverId" },
        },
      },
      {
        $addFields: {
          canonicalConvId: {
            $cond: [
              { $lt: ["$senderIdStr", "$receiverIdStr"] },
              { $concat: ["conversation_", "$senderIdStr", "_", "$receiverIdStr"] },
              { $concat: ["conversation_", "$receiverIdStr", "_", "$senderIdStr"] },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$canonicalConvId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverIdStr", userIdStr] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    // Populate sender and receiver info
    for (let i = 0; i < conversations.length; i++) {
      conversations[i].lastMessage = await Message.populate(conversations[i].lastMessage, [
        { path: "senderId", select: "email profile" },
        { path: "receiverId", select: "email profile" },
      ]);
    }

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
});

// Get messages for a specific conversation
router.get("/conversation/:conversationId", auth, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    let { conversationId } = req.params;
    const userIdStr = (req.user._id || req.user.id).toString();

    // Clean any prefix and extract participant IDs
    const cleanId = conversationId.replace(/^conversation_/, "");
    let userIds = [];
    if (cleanId.includes("/")) {
      userIds = cleanId.split("/");
    } else if (cleanId.includes("_")) {
      userIds = cleanId.split("_");
    }

    let query = {};
    if (userIds.length === 2 && userIds[0] && userIds[1]) {
      const u1 = userIds[0];
      const u2 = userIds[1];
      const sortedIds = [u1, u2].sort();
      const sortedKey = sortedIds.join("_");
      const prefixedKey = `conversation_${sortedKey}`;
      const rawKey1 = `${u1}_${u2}`;
      const rawKey2 = `${u2}_${u1}`;
      const rawPrefixedKey1 = `conversation_${rawKey1}`;
      const rawPrefixedKey2 = `conversation_${rawKey2}`;

      const idPossibleMatches = [
        conversationId,
        cleanId,
        sortedKey,
        prefixedKey,
        rawKey1,
        rawKey2,
        rawPrefixedKey1,
        rawPrefixedKey2,
      ];

      const orClauses = [
        { conversationId: { $in: idPossibleMatches } },
        { senderId: u1, receiverId: u2 },
        { senderId: u2, receiverId: u1 },
      ];

      if (mongoose.Types.ObjectId.isValid(u1) && mongoose.Types.ObjectId.isValid(u2)) {
        const objId1 = new mongoose.Types.ObjectId(u1);
        const objId2 = new mongoose.Types.ObjectId(u2);
        orClauses.push(
          { senderId: objId1, receiverId: objId2 },
          { senderId: objId2, receiverId: objId1 }
        );
      }

      query = { $or: orClauses };
    } else {
      query = {
        $or: [
          { conversationId: conversationId },
          { conversationId: cleanId },
          { conversationId: `conversation_${cleanId}` },
        ],
      };
    }

    const messages = await Message.find(query)
      .populate("senderId", "email profile")
      .populate("receiverId", "email profile")
      .sort({ createdAt: 1 });

    // Mark messages as read
    const userObjId = mongoose.Types.ObjectId.isValid(userIdStr)
      ? new mongoose.Types.ObjectId(userIdStr)
      : null;
    const receiverMatch = userObjId
      ? { $in: [userObjId, userIdStr] }
      : userIdStr;

    await Message.updateMany(
      {
        ...query,
        receiverId: receiverMatch,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Get or create conversation between two users
router.get("/conversation/:userId1/:userId2", auth, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const conversationId = `conversation_${[userId1, userId2].sort().join("_")}`;

    res.json({ conversationId });
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ message: "Error getting conversation" });
  }
});

// Send a message (API fallback when WebSocket is unavailable)
router.post("/", auth, async (req, res) => {
  try {
    const senderId = (req.user._id || req.user.id).toString();
    const {
      receiverId,
      message,
      conversationId,
      messageType,
      type,
      voiceData,
      voiceDuration,
      files,
    } = req.body || {};

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const cleanReceiverId = receiverId.toString();
    const formattedConversationId =
      conversationId ||
      `conversation_${[senderId, cleanReceiverId].sort().join("_")}`;

    const newMessage = new Message({
      conversationId: formattedConversationId,
      senderId,
      receiverId: cleanReceiverId,
      message: message.trim(),
      messageType: messageType || type || "text",
      voiceData: voiceData || undefined,
      voiceDuration: voiceDuration || undefined,
      files: files || [],
    });

    await newMessage.save();
    await newMessage.populate("senderId", "email profile");

    const messageObj = newMessage.toObject();
    const messageData = {
      ...messageObj,
      sender: newMessage.senderId,
      conversationId: formattedConversationId,
      files: messageObj.files || [],
      voiceData: messageObj.voiceData || undefined,
      voiceDuration: messageObj.voiceDuration || undefined,
      messageType: messageObj.messageType || "text",
    };

    const io = req.app.get("io");
    if (io && connectedUsers) {
      const receiverSocketId = connectedUsers.get(cleanReceiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", messageData);
      }
      const senderSocketId = connectedUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageSent", messageData);
      }
    }

    res.json(messageData);
  } catch (error) {
    console.error("Error sending message (API):", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Edit a message
router.put("/:messageId", auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;
    const userId = req.user._id || req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Find the message
    const messageToEdit = await Message.findById(messageId);
    if (!messageToEdit) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Verify user owns the message
    if (messageToEdit.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this message" });
    }

    // Update the message
    messageToEdit.message = message.trim();
    messageToEdit.isEdited = true;
    messageToEdit.editedAt = new Date();
    await messageToEdit.save();

    // Populate sender info
    await messageToEdit.populate("senderId", "email profile");

    const editedMessageData = {
      ...messageToEdit.toObject(),
      sender: messageToEdit.senderId,
      conversationId: messageToEdit.conversationId,
      messageId: messageToEdit._id,
      action: 'edit',
      isEdit: true,
    };

    // Emit WebSocket event to notify receiver
    const io = req.app.get('io');
    if (io && connectedUsers) {
      // Get receiver socket ID
      const receiverSocketId = connectedUsers.get(messageToEdit.receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageEdited", editedMessageData);
      }
      
      // Also notify sender
      const senderSocketId = connectedUsers.get(userId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageEdited", editedMessageData);
      }
    }

    res.json({
      message: "Message edited successfully",
      editedMessage: editedMessageData,
    });
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ message: "Error editing message" });
  }
});

// Delete a message
router.delete("/:messageId", auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id || req.user.id;

    // Find the message
    const messageToDelete = await Message.findById(messageId);
    if (!messageToDelete) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Verify user owns the message
    if (messageToDelete.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this message" });
    }

    // Store conversation info before deletion
    const conversationId = messageToDelete.conversationId;
    const receiverId = messageToDelete.receiverId.toString();

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    const deletedMessageData = {
      messageId: messageId,
      conversationId: conversationId,
      action: 'delete',
      isDelete: true,
    };

    // Emit WebSocket event to notify receiver
    const io = req.app.get('io');
    if (io && connectedUsers) {
      // Get receiver socket ID
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", deletedMessageData);
      }
      
      // Also notify sender
      const senderSocketId = connectedUsers.get(userId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDeleted", deletedMessageData);
      }
    }

    res.json({
      message: "Message deleted successfully",
      deletedMessage: deletedMessageData,
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Error deleting message" });
  }
});

// Export router with setConnectedUsers function
router.setConnectedUsers = setConnectedUsers;
module.exports = router;
