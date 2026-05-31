const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { auth } = require("../middleware/auth");
const { parsePagination } = require("../lib/pagination");

let connectedUsers = new Map();

const setConnectedUsers = (map) => {
  connectedUsers = map;
};

router.get("/conversations", auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { page, limit, skip, meta } = parsePagination(req.query, {
      defaultLimit: 30,
      maxLimit: 100,
    });

    const pipeline = [
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
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
      { $sort: { "lastMessage.createdAt": -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ];

    const [result] = await Message.aggregate(pipeline);
    const conversations = result?.data || [];
    const total = result?.total?.[0]?.count || 0;

    for (const conv of conversations) {
      await Message.populate(conv.lastMessage, [
        { path: "senderId", select: "email profile" },
        { path: "receiverId", select: "email profile" },
      ]);
    }

    res.json({
      conversations,
      pagination: meta(total),
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
});

router.get("/conversation/:conversationId", auth, async (req, res) => {
  try {
    let { conversationId } = req.params;
    const userId = req.user._id || req.user.id;
    const { page, limit, skip, meta } = parsePagination(req.query, {
      defaultLimit: 50,
      maxLimit: 100,
    });

    if (conversationId.includes("/")) {
      const [userId1, userId2] = conversationId.split("/");
      conversationId = [userId1, userId2].sort().join("_");
    }

    const filter = { conversationId };

    const [messages, total] = await Promise.all([
      Message.find(filter)
        .populate("senderId", "email profile")
        .populate("receiverId", "email profile")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments(filter),
    ]);

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

    res.json({
      messages: messages.reverse(),
      pagination: meta(total),
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

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

router.put("/:messageId", auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;
    const userId = req.user._id || req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const messageToEdit = await Message.findById(messageId);
    if (!messageToEdit) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (messageToEdit.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this message" });
    }

    messageToEdit.message = message.trim();
    messageToEdit.isEdited = true;
    messageToEdit.editedAt = new Date();
    await messageToEdit.save();

    await messageToEdit.populate("senderId", "email profile");

    const editedMessageData = {
      ...messageToEdit.toObject(),
      sender: messageToEdit.senderId,
      conversationId: messageToEdit.conversationId,
      messageId: messageToEdit._id,
      action: "edit",
      isEdit: true,
    };

    const io = req.app.get("io");
    const getUserSocketId = req.app.get("getUserSocketId");
    if (io) {
      const receiverId = messageToEdit.receiverId.toString();
      const senderId = userId.toString();
      io.to(`user:${receiverId}`).emit("messageEdited", editedMessageData);
      io.to(`user:${senderId}`).emit("messageEdited", editedMessageData);
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

router.setConnectedUsers = setConnectedUsers;
module.exports = router;
