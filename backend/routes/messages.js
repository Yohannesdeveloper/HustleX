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
    const userId = req.user._id || req.user.id;

    // Get all unique conversations for this user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", userId] },
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
    for (const conv of conversations) {
      await Message.populate(conv.lastMessage, [
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
    let { conversationId } = req.params;
    const userId = req.user._id || req.user.id;

    // Handle conversationId format: userId1/userId2 or conversation_userId1_userId2
    if (conversationId.includes("/")) {
      const [userId1, userId2] = conversationId.split("/");
      conversationId = [userId1, userId2].sort().join("_");
    }

    const messages = await Message.find({ conversationId })
      .populate("senderId", "email profile")
      .populate("receiverId", "email profile")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
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
    const conversationId = [userId1, userId2].sort().join("_");

    res.json({ conversationId });
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ message: "Error getting conversation" });
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

// Export router with setConnectedUsers function
router.setConnectedUsers = setConnectedUsers;
module.exports = router;
