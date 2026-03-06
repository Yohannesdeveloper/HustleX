import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { useLocation } from "react-router-dom";
import { useWebSocket } from "../context/WebSocketContext";
import { Send, MessageSquare, X, Smile, CheckCircle2, Paperclip, Mic, MicOff, Video, FileText, Image, File, Trash2, Play, Pause, Square, Music, Film, Archive, Code, Database, FileSpreadsheet, Presentation, MoreVertical, Copy, Forward, Reply, Pencil, Download, Pin, User } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";
import apiService from "../services/api";
import { FreelancerWithStatus } from "../types";
import FreelancerProfileModal from "./FreelancerProfileModal";

interface Conversation {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  freelancer?: FreelancerWithStatus;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
}

interface ChatUser {
  _id?: string;
  id?: string;
  email?: string;
  profile?: UserProfile;
}

interface FileAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

interface StoredMessage {
  _id?: string;
  id?: string;
  senderId?: string | ChatUser;
  receiverId?: string | ChatUser;
  conversationId?: string;
  message: string;
  messageType?: string;
  voiceData?: string | null;
  voiceDuration?: number;
  files?: FileAttachment[];
  createdAt?: string;
  timestamp?: string;
  sender?: ChatUser;
  receiver?: ChatUser;
  senderEmail?: string;
  senderName?: string;
  receiverEmail?: string;
  receiverName?: string;
  editedAt?: string;
  isEdited?: boolean;
  action?: string;
  isEdit?: boolean;
  messageId?: string;
}

const getNormalizedConversationKey = (userId: string, otherId: string) =>
  `conversation_${[userId, otherId].sort().join("_")}`;

const normalizeEmail = (email?: string) => email?.trim().toLowerCase();
const normalizeName = (name?: string) =>
  name?.trim().toLowerCase().replace(/\s+/g, " ");

const getConversationKey = (conv: Conversation) => {
  const emailKey = normalizeEmail(conv.freelancerEmail);
  if (emailKey) return `email:${emailKey}`;
  const nameKey = normalizeName(conv.freelancerName);
  if (nameKey) return `name:${nameKey}`;
  if (conv.id?.startsWith("conversation_")) {
    const parts = conv.id.replace("conversation_", "").split("_");
    if (parts.length >= 2) {
      return `id:${parts.sort().join("_")}`;
    }
  }
  return conv.freelancerId ? `id:${conv.freelancerId}` : "";
};

const getConversationKeyFromData = (data: {
  freelancerId?: string;
  freelancerEmail?: string;
  freelancerName?: string;
}) => data.freelancerId || normalizeEmail(data.freelancerEmail) || normalizeName(data.freelancerName);

const extractId = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const candidate = value as { _id?: string; id?: string };
    return candidate._id || candidate.id || "";
  }
  return "";
};

const getUserId = (value?: string | ChatUser) => extractId(value);

const parseStoredMessages = (raw: string | null): StoredMessage[] => {
  try {
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? (parsed as StoredMessage[]) : [];
  } catch (parseError) {
    console.warn("Failed to parse stored messages:", parseError);
    return [];
  }
};

const getStoredMessages = (key: string) => parseStoredMessages(localStorage.getItem(key));

const getConversationClearedKey = (userId: string, otherId: string) =>
  `conversation_cleared_${[userId, otherId].sort().join("_")}`;

const persistMessageToLocalStorage = (
  conversationKey: string,
  message: StoredMessage
) => {
  try {
    const existing = getStoredMessages(conversationKey);
    const exists = existing.some((m) =>
      (m._id && message._id && m._id === message._id) ||
      (m.id && message.id && m.id === message.id) ||
      (m.message === message.message &&
        m.senderId === message.senderId &&
        m.receiverId === message.receiverId &&
        (m.createdAt || m.timestamp) === (message.createdAt || message.timestamp))
    );
    if (!exists) {
      existing.push(message);
      localStorage.setItem(conversationKey, JSON.stringify(existing));
    }
  } catch (error) {
    console.error("Failed to persist message to localStorage:", error);
  }
};

const dedupeConversations = (list: Conversation[]) => {
  const map = new Map<string, Conversation>();
  for (const conv of list) {
    const key = getConversationKey(conv);
    if (!key) {
      continue;
    }
    const existing = map.get(key);
    if (!existing) {
      map.set(key, conv);
      continue;
    }
    const existingTime = new Date(existing.lastMessageTime).getTime();
    const currentTime = new Date(conv.lastMessageTime).getTime();
    if (currentTime >= existingTime) {
      map.set(key, conv);
    }
  }
  return Array.from(map.values());
};

const MessagesTab: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();
  const location = useLocation();
  const { socket, connected, joinUser, sendMessage, onMessage, offMessage } = useWebSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [messageMenuOpen, setMessageMenuOpen] = useState<string | null>(null);
  const [chatHeaderMenuOpen, setChatHeaderMenuOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<{ id: string; text: string } | null>(null);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<string[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const chatHeaderMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for message edit events from WebSocket (works for both sender and receiver)
  useEffect(() => {
    if (!socket) return;

    const handleMessageEdit = (data: StoredMessage) => {
      console.log("📝 Received message edit event:", data);

      // Check if we have a selected conversation
      if (!selectedConversation || !user?._id) {
        console.log("⏭️ No selected conversation, skipping edit");
        return;
      }

      const conversationKey = getNormalizedConversationKey(user._id, selectedConversation.freelancerId);
      const backendConversationId = [user._id, selectedConversation.freelancerId].sort().join("_");

      // Extract IDs for comparison
      const dataSenderId = getUserId(data.senderId);
      const dataReceiverId = getUserId(data.receiverId);
      const dataConversationId = data.conversationId;

      // Check if this edit is for the current conversation
      const isCurrentConversation =
        dataConversationId === backendConversationId ||
        dataConversationId === conversationKey ||
        (dataSenderId && dataReceiverId && (
          (dataSenderId.toString() === user._id.toString() && dataReceiverId.toString() === selectedConversation.freelancerId.toString()) ||
          (dataReceiverId.toString() === user._id.toString() && dataSenderId.toString() === selectedConversation.freelancerId.toString())
        ));

      if (isCurrentConversation) {
        const editId = data.messageId || data._id || data.id;
        console.log("✅ Updating message in current conversation:", editId, "New text:", data.message);

        // Update message in state immediately (real-time)
        setMessages((prev) => {
          const updated = prev.map((msg) => {
            const msgId = (msg._id || msg.id)?.toString();
            const editIdStr = editId?.toString();

            if (msgId === editIdStr) {
              console.log("🔄 Found matching message, updating:", msgId);
              return {
                ...msg,
                message: data.message,
                editedAt: data.editedAt || new Date().toISOString(),
                isEdited: true,
              };
            }
            return msg;
          });

          // Log if message wasn't found
          const found = updated.some((msg) => {
            const msgId = (msg._id || msg.id)?.toString();
            return msgId === editId?.toString();
          });
          if (!found) {
            console.warn("⚠️ Message not found in current messages list:", editId);
          }

          // Update conversation list if this is the last message
          const lastMessage = updated[updated.length - 1];
          if (lastMessage && (lastMessage._id?.toString() === editId?.toString() || lastMessage.id?.toString() === editId?.toString())) {
            setConversations((prevConvs) =>
              prevConvs.map((conv) => {
                const convKey = getConversationKey(conv);
                if (convKey === conversationKey || convKey === backendConversationId) {
                  return {
                    ...conv,
                    lastMessage: data.message,
                  };
                }
                return conv;
              })
            );
          }

          return updated;
        });

        // Update localStorage
        try {
          const storedMessages = getStoredMessages(conversationKey);
          const updatedMessages = storedMessages.map((msg) => {
            const msgId = (msg._id || msg.id)?.toString();
            const editIdStr = editId?.toString();

            if (msgId === editIdStr) {
              return {
                ...msg,
                message: data.message,
                editedAt: data.editedAt || new Date().toISOString(),
                isEdited: true,
              };
            }
            return msg;
          });
          localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
          console.log("💾 Updated localStorage");
        } catch (error) {
          console.error("❌ Error updating localStorage for edit:", error);
        }
      } else {
        console.log("⏭️ Edit is for different conversation, skipping");
      }
    };

    socket.on("messageEdited", handleMessageEdit);

    return () => {
      socket.off("messageEdited", handleMessageEdit);
    };
  }, [socket, selectedConversation, user?._id]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedFreelancerIdRef = useRef<string | null>(null);
  const conversationsRef = useRef<Conversation[]>([]);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // Join user to WebSocket when connected
  useEffect(() => {
    if (connected && user?._id) {
      joinUser(user._id);
    }
  }, [connected, user?._id, joinUser]);

  // Listen for real-time messages
  useEffect(() => {
    const handleNewMessage = (messageData: StoredMessage) => {
      console.log("Received message via WebSocket:", messageData);
      console.log("📥 Message files check:", {
        hasFiles: messageData.files && messageData.files.length > 0,
        fileCount: messageData.files ? messageData.files.length : 0,
        files: messageData.files,
        messageType: messageData.messageType,
      });

      // Check if this is an edit action
      if (messageData.action === 'edit' || messageData.isEdit) {
        // Update existing message instead of adding new one
        setMessages((prev) =>
          prev.map((msg) =>
            (msg._id || msg.id) === (messageData.messageId || messageData._id)
              ? {
                ...msg,
                message: messageData.message,
                editedAt: messageData.editedAt || new Date().toISOString(),
                isEdited: true,
              }
              : msg
          )
        );

        // Update in localStorage
        if (selectedConversation && user?._id) {
          const conversationKey = getNormalizedConversationKey(user._id, selectedConversation.freelancerId);
          const storedMessages = getStoredMessages(conversationKey);
          const updatedMessages = storedMessages.map((msg) =>
            (msg._id || msg.id) === (messageData.messageId || messageData._id)
              ? {
                ...msg,
                message: messageData.message,
                editedAt: messageData.editedAt || new Date().toISOString(),
                isEdited: true,
              }
              : msg
          );
          localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
        }
        return;
      }

      // Normalize conversationId format
      // Backend uses: [senderId, receiverId].sort().join("_")
      // Frontend uses: conversation_${user._id}_${freelancerId}
      const senderId = getUserId(messageData.senderId);
      const receiverId = getUserId(messageData.receiverId);
      const backendConversationId = messageData.conversationId || [senderId, receiverId].sort().join("_");
      const targetFreelancerId = senderId === user?._id ? receiverId : senderId;
      const frontendConversationId = getNormalizedConversationKey(user?._id || "", targetFreelancerId);
      const messageKey = messageData._id || messageData.id || `${senderId}|${receiverId}|${messageData.message}|${messageData.createdAt || messageData.timestamp || ""}`;
      if (messageKey) {
        if (processedMessageIdsRef.current.has(messageKey)) {
          return;
        }
        processedMessageIdsRef.current.add(messageKey);
      }

      // Check if this message belongs to the currently selected conversation
      const isCurrentConversation = selectedConversation && (
        getConversationKey(selectedConversation) === frontendConversationId ||
        getConversationKey(selectedConversation) === backendConversationId ||
        selectedConversation.freelancerId === targetFreelancerId
      );

      // Check if this is a message we sent (confirmation from backend)
      const isOwnMessage = senderId === user?._id;

      // If this message belongs to the current conversation, add/replace it in messages
      if (isCurrentConversation) {
        setMessages((prev) => {
          // If it's our own message, check if we have a temp message to replace
          if (isOwnMessage) {
            // Find and replace temp message with same content (match by message text and file count)
            const tempIndex = prev.findIndex(m =>
              (m._id && m._id.startsWith("temp_")) &&
              m.message === messageData.message &&
              m.senderId === messageData.senderId &&
              m.receiverId === messageData.receiverId &&
              ((m.files?.length || 0) === (messageData.files?.length || 0)) &&
              (!!m.voiceData === !!messageData.voiceData)
            );

            if (tempIndex !== -1) {
              // Replace temp message with real message (preserve all fields including files)
              console.log("Replacing temp message with real message", {
                hasFiles: messageData.files && messageData.files.length > 0,
                fileCount: messageData.files ? messageData.files.length : 0,
              });
              const updated = [...prev];
              // Ensure all fields are preserved, especially files
              updated[tempIndex] = {
                ...messageData,
                files: messageData.files || [],
                voiceData: messageData.voiceData,
                voiceDuration: messageData.voiceDuration,
                messageType: messageData.messageType,
              };
              return updated;
            }
          }

          // Check if message already exists (avoid duplicates)
          const exists = prev.some(m =>
            (m._id || m.id) === (messageData._id || messageData.id) ||
            (!m._id?.startsWith("temp_") && m._id === messageData._id && m.message === messageData.message)
          );
          if (exists) {
            console.log("Message already exists, skipping");
            return prev;
          }
          console.log("Adding new message to current conversation", {
            hasFiles: messageData.files && messageData.files.length > 0,
            fileCount: messageData.files ? messageData.files.length : 0,
          });
          // Ensure all fields are preserved, especially files
          return [...prev, {
            ...messageData,
            files: messageData.files || [],
            voiceData: messageData.voiceData,
            voiceDuration: messageData.voiceDuration,
            messageType: messageData.messageType,
          }];
        });
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }

      // Persist incoming message to localStorage (include all fields including files, voice, etc.)
      const localKey = getNormalizedConversationKey(user?._id || "", targetFreelancerId || "");
      persistMessageToLocalStorage(localKey, {
        _id: messageData._id,
        id: messageData.id,
        senderId,
        receiverId,
        message: messageData.message,
        messageType: messageData.messageType,
        voiceData: messageData.voiceData,
        voiceDuration: messageData.voiceDuration,
        files: messageData.files || [],
        createdAt: messageData.createdAt || new Date().toISOString(),
        senderName: messageData.sender?.email || "",
        receiverName: messageData.receiver?.email || "",
        sender: messageData.sender,
        receiver: messageData.receiver,
      });

      // Always update conversation list
      setConversations((prev) => {
        // Find conversation by matching normalized key
        const targetFreelancerId = senderId === user?._id ? receiverId : senderId;
        const normalizedKey = getNormalizedConversationKey(user?._id || "", targetFreelancerId);
        const existingConv = prev.find(
          (conv) => getConversationKey(conv) === normalizedKey
        );

        if (existingConv) {
          // Update existing conversation - ensure no duplicates
          const updated = prev.map((conv) =>
            getConversationKey(conv) === normalizedKey
              ? {
                ...conv,
                lastMessage: messageData.message,
                lastMessageTime: messageData.createdAt || new Date().toISOString(),
              }
              : conv
          );

          // Remove duplicates by freelancerId (keep first occurrence)
          const seen = new Set<string>();
          const deduplicated = updated.filter(conv => {
            if (seen.has(conv.freelancerId)) {
              return false;
            }
            seen.add(conv.freelancerId);
            return true;
          });

          return deduplicated.sort((a, b) =>
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
          );
        } else {
          // Add new conversation only if it doesn't exist
          // Double-check to prevent duplicates
          const alreadyExists = prev.some(
            (conv) => getConversationKey(conv) === normalizedKey
          );
          if (alreadyExists) {
            // If it exists, just update it
            return prev.map((conv) =>
              getConversationKey(conv) === normalizedKey
                ? {
                  ...conv,
                  lastMessage: messageData.message,
                  lastMessageTime: messageData.createdAt || new Date().toISOString(),
                }
                : conv
            ).sort((a, b) =>
              new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
            );
          }

          // Add new conversation
          const profile = messageData.sender?.profile || {};
          const senderName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || messageData.sender?.email || "Unknown";
          const isOwnMessage = getUserId(messageData.senderId) === user?._id;
          const fallbackName = selectedConversation?.freelancerName || senderName;
          const fallbackEmail = selectedConversation?.freelancerEmail || messageData.sender?.email || "";

          const newConv = {
            id: normalizedKey,
            freelancerId: targetFreelancerId,
            freelancerName: isOwnMessage ? fallbackName : senderName,
            freelancerEmail: isOwnMessage ? fallbackEmail : (messageData.sender?.email || ""),
            lastMessage: messageData.message,
            lastMessageTime: messageData.createdAt || new Date().toISOString(),
            unreadCount: 0,
          };

          // Remove duplicates before adding
          const seen = new Set<string>();
          const deduplicated = prev.filter(conv => {
            if (seen.has(conv.freelancerId)) {
              return false;
            }
            seen.add(conv.freelancerId);
            return true;
          });

          return [newConv, ...deduplicated].sort((a, b) =>
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
          );
        }
      });
    };

    onMessage(handleNewMessage);

    return () => {
      offMessage(handleNewMessage);
    };
  }, [selectedConversation, user?._id, onMessage, offMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversations from localStorage
  useEffect(() => {
    if (!user?._id) return;

    const loadConversations = async () => {
      const allKeys = Object.keys(localStorage);
      const conversationKeys = allKeys.filter(
        (key) => key.startsWith("conversation_") && key.includes(user._id)
      );

      const convs: Conversation[] = [];

      const mergedByKey = new Map<string, { key: string; messages: StoredMessage[]; lastMessage: StoredMessage }>();
      const bestKeyByIdentity = new Map<string, { key: string; time: number }>();
      const keysToRemove = new Set<string>();

      for (const key of conversationKeys) {
        const parts = key.split("_");
        const id1 = parts[1];
        const id2 = parts[2];
        if (!id1 || !id2) continue;
        // Skip self-conversations (same ID twice)
        if (id1 === id2) {
          localStorage.removeItem(key);
          continue;
        }
        const otherId = id1 === user._id ? id2 : id1;
        if (!otherId || otherId === user._id) continue;

        const normalizedKey = getNormalizedConversationKey(user._id, otherId);
        const conversationMessages = getStoredMessages(key);
        if (conversationMessages.length === 0) continue;

        const lastMessage = conversationMessages[conversationMessages.length - 1];

        // Migrate to normalized key if needed (merge messages)
        if (key !== normalizedKey) {
          const existing = getStoredMessages(normalizedKey);
          const merged = [...existing, ...conversationMessages].sort((a, b) => {
            const aTime = a.createdAt || a.timestamp || 0;
            const bTime = b.createdAt || b.timestamp || 0;
            return new Date(aTime).getTime() - new Date(bTime).getTime();
          });
          localStorage.setItem(normalizedKey, JSON.stringify(merged));
          localStorage.removeItem(key);
        }

        // Merge by conversation key (prefer freelancerId, then email/name)
        const conversationKey = getConversationKeyFromData({
          freelancerId: otherId,
          freelancerEmail: lastMessage.receiverEmail || lastMessage.senderEmail,
          freelancerName: lastMessage.receiverName || lastMessage.senderName,
        });
        if (!conversationKey) continue;

        const existingMerge = mergedByKey.get(conversationKey);
        if (existingMerge) {
          const mergedMessages = [...existingMerge.messages, ...conversationMessages];
          const mergedLast = mergedMessages[mergedMessages.length - 1];
          mergedByKey.set(conversationKey, {
            key: normalizedKey,
            messages: mergedMessages,
            lastMessage: mergedLast,
          });
        } else {
          mergedByKey.set(conversationKey, {
            key: normalizedKey,
            messages: conversationMessages,
            lastMessage,
          });
        }

        // Track best key per identity (email/name) to remove duplicates in localStorage
        const identityKey =
          normalizeEmail(lastMessage.receiverEmail || lastMessage.senderEmail) ||
          normalizeName(lastMessage.receiverName || lastMessage.senderName) ||
          otherId;
        if (identityKey) {
          const timeValue = new Date(
            lastMessage.createdAt || lastMessage.timestamp || 0
          ).getTime();
          const existingBest = bestKeyByIdentity.get(identityKey);
          if (!existingBest || timeValue >= existingBest.time) {
            if (existingBest && existingBest.key !== normalizedKey) {
              keysToRemove.add(existingBest.key);
            }
            bestKeyByIdentity.set(identityKey, { key: normalizedKey, time: timeValue });
          } else {
            keysToRemove.add(normalizedKey);
          }
        }

        // Try to fetch freelancer data
        try {
          const freelancers = await apiService.getFreelancersWithStatus();
          const freelancer = freelancers.find((f: FreelancerWithStatus) => f._id === otherId);
          const freelancerProfile = freelancer?.profile || {};
          const freelancerName = freelancer
            ? `${freelancerProfile.firstName || ""} ${freelancerProfile.lastName || ""}`.trim() || freelancer.email
            : lastMessage.receiverName || "Unknown";

          convs.push({
            id: normalizedKey,
            freelancerId: otherId,
            freelancerName: freelancerName,
            freelancerEmail: freelancer?.email || lastMessage.receiverEmail || lastMessage.senderEmail || "",
            lastMessage: lastMessage.message,
            lastMessageTime: lastMessage.timestamp || lastMessage.createdAt || new Date().toISOString(),
            unreadCount: 0,
            freelancer: freelancer,
          });
        } catch (error) {
          // If freelancer not found, still show conversation
          convs.push({
            id: normalizedKey,
            freelancerId: otherId,
            freelancerName: lastMessage.receiverName || "Unknown",
            freelancerEmail: lastMessage.receiverEmail || lastMessage.senderEmail || "",
            lastMessage: lastMessage.message,
            lastMessageTime: lastMessage.timestamp || lastMessage.createdAt || new Date().toISOString(),
            unreadCount: 0,
          });
        }
      }

      // Persist merged messages to normalized keys and remove duplicates
      mergedByKey.forEach((entry) => {
        if (!keysToRemove.has(entry.key)) {
          localStorage.setItem(entry.key, JSON.stringify(entry.messages));
        }
      });
      keysToRemove.forEach((key) => {
        if (key.startsWith("conversation_")) {
          localStorage.removeItem(key);
        }
      });

      // Sort by last message time
      const deduped = dedupeConversations(convs).sort(
        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
      conversationsRef.current = deduped;
      setConversations(deduped);
    };

    loadConversations();

    // Listen for new messages
    const handleMessageSent = () => {
      loadConversations();
    };

    window.addEventListener('messageSent', handleMessageSent);
    return () => {
      window.removeEventListener('messageSent', handleMessageSent);
    };
  }, [user?._id]);

  const displayConversations = useMemo(
    () =>
      dedupeConversations(conversations).sort(
        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      ),
    [conversations]
  );

  // Update conversations ref when conversations change
  useEffect(() => {
    if (displayConversations.length !== conversations.length) {
      setConversations(displayConversations);
    }
    conversationsRef.current = displayConversations;
  }, [conversations, displayConversations]);

  // Auto-select conversation when navigating with freelancer ID
  useEffect(() => {
    const state = location.state as { freelancerId?: string; freelancer?: FreelancerWithStatus } | null;
    const freelancerId = state?.freelancerId;
    if (freelancerId && user?._id) {
      // Prevent messaging yourself
      if (freelancerId === user._id) {
        console.warn("Cannot message yourself");
        return;
      }

      // Skip if we've already processed this freelancer ID
      if (lastProcessedFreelancerIdRef.current === freelancerId) {
        return;
      }

      const conversationKey = getNormalizedConversationKey(user._id, freelancerId);

      const createAndSelectConversation = async () => {
        // Check if conversation already exists in conversations list using ref
        const existingConv = conversationsRef.current.find(
          (c) => getConversationKey(c) === getNormalizedConversationKey(user._id, freelancerId)
        );
        if (existingConv) {
          setSelectedConversation(existingConv);
          lastProcessedFreelancerIdRef.current = freelancerId;
          return;
        }

        // Check localStorage for existing messages
        const existingMessages = getStoredMessages(conversationKey);
        let conv: Conversation | null = null;

        if (existingMessages.length > 0) {
          // Conversation exists in localStorage, create it
          const lastMessage = existingMessages[existingMessages.length - 1];
          conv = {
            id: conversationKey,
            freelancerId: freelancerId,
            freelancerName: lastMessage.receiverName || "Unknown",
            freelancerEmail: lastMessage.receiverEmail || lastMessage.senderEmail || "",
            lastMessage: lastMessage.message,
            lastMessageTime: lastMessage.timestamp || lastMessage.createdAt || new Date().toISOString(),
            unreadCount: 0,
          };
        } else {
          // New conversation - fetch freelancer data
          let freelancer: FreelancerWithStatus | undefined = state?.freelancer;

          // If freelancer not in state, fetch it
          if (!freelancer) {
            try {
              const freelancers = await apiService.getFreelancersWithStatus();
              freelancer = freelancers.find((f: FreelancerWithStatus) => f._id === freelancerId);
            } catch (error) {
              console.error("Error fetching freelancer:", error);
            }
          }

          const profile = freelancer?.profile || {};
          const fullName = freelancer
            ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || freelancer.email
            : "Unknown Freelancer";

          conv = {
            id: conversationKey,
            freelancerId: freelancerId,
            freelancerName: fullName,
            freelancerEmail: freelancer?.email || "",
            lastMessage: "",
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            freelancer: freelancer,
          };
        }

        if (conv) {
          // Add to conversations list if not already there
          setConversations(prev => {
            const exists = prev.some(
              (c) => getConversationKey(c) === getConversationKey(conv!)
            );
            if (!exists) {
              return [conv!, ...prev];
            }
            return prev;
          });

          // Select the conversation
          setSelectedConversation(conv);
          lastProcessedFreelancerIdRef.current = freelancerId;
        }
      };

      createAndSelectConversation();
    }

    // Reset ref when location state changes to a different freelancer
    if (!location.state || !freelancerId) {
      lastProcessedFreelancerIdRef.current = null;
    }
  }, [location.state, user?._id]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !user?._id) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      const clearedKey = getConversationClearedKey(user._id, selectedConversation.freelancerId);
      const clearedAtRaw = localStorage.getItem(clearedKey);
      const clearedAt = clearedAtRaw ? new Date(clearedAtRaw).getTime() : null;

      try {
        // Try to load from API first
        // Backend uses format: senderId_receiverId (sorted)
        const backendConversationId = getNormalizedConversationKey(
          user._id,
          selectedConversation.freelancerId
        ).replace("conversation_", "");

        const apiMessages = await apiService.getConversationMessages(backendConversationId) as StoredMessage[];
        if (apiMessages && Array.isArray(apiMessages) && apiMessages.length > 0) {
          console.log("Loaded messages from API:", apiMessages.length);
          const filteredApiMessages = clearedAt
            ? apiMessages.filter((msg) => {
              const timestamp = msg.createdAt || msg.timestamp || "";
              return new Date(timestamp).getTime() > clearedAt;
            })
            : apiMessages;
          setMessages(filteredApiMessages);
          // Persist API messages locally for refresh safety
          const conversationKey = getNormalizedConversationKey(user._id, selectedConversation.freelancerId);
          localStorage.setItem(conversationKey, JSON.stringify(filteredApiMessages));
          return;
        }
      } catch (error) {
        console.log("Error loading from API, trying localStorage:", error);
      }

      // Fallback to localStorage
      const conversationKey = getNormalizedConversationKey(user._id, selectedConversation.freelancerId);
      const conversationMessages = getStoredMessages(conversationKey);
      console.log("Loaded messages from localStorage:", conversationMessages.length);
      const filteredLocalMessages = clearedAt
        ? conversationMessages.filter((msg) => {
          const timestamp = msg.createdAt || msg.timestamp || "";
          return new Date(timestamp).getTime() > clearedAt;
        })
        : conversationMessages;
      setMessages(filteredLocalMessages);
    };

    loadMessages();
  }, [selectedConversation, user?._id]);

  const handleSendMessage = async () => {
    // Check if there's anything to send
    const hasText = newMessage.trim().length > 0;
    const hasVoice = audioBlob !== null;
    const hasFiles = attachedFiles.length > 0;

    if ((!hasText && !hasVoice && !hasFiles) || !selectedConversation || !user?._id || sending) return;

    setSending(true);
    const messageText = newMessage.trim();

    // Handle editing existing message
    if (editingMessageId) {
      const updatedMessage = {
        message: messageText,
        editedAt: new Date().toISOString(),
        isEdited: true,
      };

      // Update message in state
      setMessages((prev) =>
        prev.map((msg) =>
          (msg._id || msg.id) === editingMessageId
            ? { ...msg, ...updatedMessage }
            : msg
        )
      );

      // Update in localStorage
      if (selectedConversation && user?._id) {
        const conversationKey = getNormalizedConversationKey(user._id, selectedConversation.freelancerId);
        const storedMessages = getStoredMessages(conversationKey);
        const updatedMessages = storedMessages.map((msg) =>
          (msg._id || msg.id) === editingMessageId
            ? { ...msg, ...updatedMessage }
            : msg
        );
        localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
      }

      // Send edit via WebSocket if connected, otherwise use REST API
      if (connected && socket) {
        const backendConversationId = [user._id, selectedConversation.freelancerId].sort().join("_");
        // Emit edit event instead of regular sendMessage to avoid creating new message
        console.log("Sending edit via WebSocket:", {
          senderId: user._id,
          receiverId: selectedConversation.freelancerId,
          message: messageText,
          conversationId: backendConversationId,
          messageId: editingMessageId,
        });
        socket.emit("editMessage", {
          senderId: user._id,
          receiverId: selectedConversation.freelancerId,
          message: messageText,
          conversationId: backendConversationId,
          messageId: editingMessageId,
        });
      } else {
        // Fallback to REST API if WebSocket not connected
        try {
          console.log("WebSocket not connected, using REST API to edit message");
          await apiService.editMessage(editingMessageId, messageText);
        } catch (error) {
          console.error("Error editing message via API:", error);
          setSending(false);
          return;
        }
      }

      // Reset edit state
      handleCancelEdit();
      setSending(false);
      return;
    }

    setNewMessage("");
    setShowEmojiPicker(false);

    const conversationId = getNormalizedConversationKey(user._id, selectedConversation.freelancerId);

    // Build message content based on what's being sent
    let displayMessage = messageText;
    let messageType = 'text';
    let voiceDataUrl: string | null = null;
    const fileAttachments: FileAttachment[] = [];

    // Handle voice recording
    if (hasVoice && audioBlob) {
      messageType = hasText ? 'text_and_voice' : 'voice';
      // Convert blob to base64 for storage
      voiceDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
      if (!hasText) {
        displayMessage = '🎤 Voice Message';
      }
    }

    // Handle file attachments
    if (hasFiles) {
      messageType = hasVoice ? 'mixed' : (hasText ? 'text_and_files' : 'files');
      // Convert files to base64 for storage
      for (const file of attachedFiles) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        fileAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl
        });
      }
      if (!hasText && !hasVoice) {
        displayMessage = `📎 ${attachedFiles.length} ${attachedFiles.length === 1 ? 'file' : 'files'} attached`;
      } else if (!hasText && hasVoice) {
        displayMessage = `🎤 Voice + 📎 ${attachedFiles.length} ${attachedFiles.length === 1 ? 'file' : 'files'}`;
      }
    }

    // Optimistically add message to UI
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      conversationId,
      senderId: user._id,
      receiverId: selectedConversation.freelancerId,
      message: displayMessage,
      messageType,
      voiceData: voiceDataUrl,
      voiceDuration: recordingTime,
      files: fileAttachments,
      createdAt: new Date().toISOString(),
      sender: {
        _id: user._id,
        email: user.email,
        profile: user.profile,
      },
    };

    setMessages((prev) => [...prev, tempMessage]);

    // Persist optimistic message to localStorage for refresh safety
    persistMessageToLocalStorage(conversationId, {
      id: tempMessage._id,
      senderId: user._id,
      receiverId: selectedConversation.freelancerId,
      message: displayMessage,
      messageType,
      voiceData: voiceDataUrl,
      voiceDuration: recordingTime,
      files: fileAttachments,
      timestamp: tempMessage.createdAt,
      senderName: `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim() || user?.email,
      receiverName: selectedConversation.freelancerName,
    });

    // Send via WebSocket if connected
    if (connected && socket) {
      // Use backend conversationId format: sorted IDs joined with underscore
      const backendConversationId = [user._id, selectedConversation.freelancerId].sort().join("_");
      console.log("Sending message via WebSocket:", {
        senderId: user._id,
        receiverId: selectedConversation.freelancerId,
        conversationId: backendConversationId,
        messageType,
      });
      sendMessage({
        senderId: user._id,
        receiverId: selectedConversation.freelancerId,
        message: displayMessage,
        messageType,
        voiceData: voiceDataUrl,
        voiceDuration: recordingTime,
        files: fileAttachments,
        conversationId: backendConversationId,
      });
    } else {
      // Fallback to localStorage if WebSocket not connected
      const normalizedKey = getNormalizedConversationKey(user._id, selectedConversation.freelancerId);
      const existingMessages = getStoredMessages(normalizedKey);
      const message = {
        id: Date.now().toString(),
        senderId: user._id,
        receiverId: selectedConversation.freelancerId,
        message: displayMessage,
        messageType,
        voiceData: voiceDataUrl,
        voiceDuration: recordingTime,
        files: fileAttachments,
        timestamp: new Date().toISOString(),
        senderName: `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim() || user?.email,
        receiverName: selectedConversation.freelancerName,
      };
      existingMessages.push(message);
      localStorage.setItem(normalizedKey, JSON.stringify(existingMessages));
    }

    // Clear reply state after sending
    if (replyToMessage) {
      setReplyToMessage(null);
    }

    // Clear voice recording after sending
    if (hasVoice) {
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
    }

    // Clear attached files after sending
    if (hasFiles) {
      setAttachedFiles([]);
    }

    // Update conversation list - ensure no duplicates
    setConversations((prev) => {
      const updated = prev.map((conv) =>
        getConversationKey(conv) === conversationId
          ? {
            ...conv,
            id: conversationId,
            freelancerName: selectedConversation.freelancerName,
            freelancerEmail: selectedConversation.freelancerEmail,
            lastMessage: displayMessage,
            lastMessageTime: new Date().toISOString(),
          }
          : conv
      );

      // Remove duplicates by freelancerId (keep first occurrence)
      const seen = new Set<string>();
      const deduplicated = updated.filter(conv => {
        if (seen.has(conv.freelancerId)) {
          return false;
        }
        seen.add(conv.freelancerId);
        return true;
      });

      return deduplicated.sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
    });

    setSending(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  // File attachment handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    // Images
    if (type.startsWith('image/')) return Image;

    // Videos
    if (type.startsWith('video/') || ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv'].some(ext => name.endsWith(ext))) return Film;

    // Audio
    if (type.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.wma', '.m4a'].some(ext => name.endsWith(ext))) return Music;

    // Documents
    if (type.includes('pdf') || name.endsWith('.pdf')) return FileText;
    if (type.includes('document') || type.includes('msword') || ['.doc', '.docx', '.rtf', '.odt'].some(ext => name.endsWith(ext))) return FileText;

    // Spreadsheets
    if (type.includes('spreadsheet') || type.includes('excel') || ['.xls', '.xlsx', '.csv', '.ods'].some(ext => name.endsWith(ext))) return FileSpreadsheet;

    // Presentations
    if (type.includes('presentation') || type.includes('powerpoint') || ['.ppt', '.pptx', '.odp'].some(ext => name.endsWith(ext))) return Presentation;

    // Code files
    if (['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.html', '.css', '.scss', '.sass', '.less', '.json', '.xml', '.yaml', '.yml', '.md', '.sql', '.sh', '.bat', '.ps1'].some(ext => name.endsWith(ext))) return Code;

    // Archives
    if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('compressed') || ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.iso'].some(ext => name.endsWith(ext))) return Archive;

    // Database
    if (['.db', '.sqlite', '.sql', '.mdb', '.accdb'].some(ext => name.endsWith(ext))) return Database;

    // Text files
    if (type.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.log')) return FileText;

    // Default
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => setIsPlayingRecording(false);
      audio.play();
      setIsPlayingRecording(true);
    }
  };

  const pauseRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingRecording(false);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Video call handlers
  const initiateVideoCall = async () => {
    setShowVideoCallModal(true);
    setCallStatus('calling');
    console.log('Initiating video call with:', selectedConversation?.freelancerName);

    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      console.log('Got media stream:', stream.getTracks().map(t => t.kind));

      setLocalStream(stream);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);

      // Wait for next render cycle then attach stream to video element
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(err => {
            console.log('Video play error:', err);
          });
          console.log('Stream attached to video element');
        } else {
          console.log('Video ref not available yet');
        }
      }, 100);

      // Simulate call connecting after 2 seconds
      setTimeout(() => {
        setCallStatus('connected');
        // Start call duration timer
        callTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }, 2000);

    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please ensure you have granted permission.');
      setCallStatus('idle');
      setShowVideoCallModal(false);
    }
  };

  const endVideoCall = () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Clear timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    setCallStatus('ended');
    setCallDuration(0);

    // Close modal after showing "call ended" message
    setTimeout(() => {
      setShowVideoCallModal(false);
      setCallStatus('idle');
    }, 1500);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Message action handlers
  const handleDeleteMessage = (messageId: string) => {
    // Remove from messages state
    setMessages(prev => prev.filter(msg => (msg._id || msg.id) !== messageId));

    // Also remove from localStorage
    if (selectedConversation && user?._id) {
      const conversationKey = getNormalizedConversationKey(user._id, selectedConversation.freelancerId);
      const storedMessages = getStoredMessages(conversationKey);
      const updatedMessages = storedMessages.filter((msg) =>
        (msg._id || msg.id) !== messageId
      );
      localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
    }

    setMessageMenuOpen(null);
  };

  const handleCopyMessage = (messageText: string) => {
    navigator.clipboard.writeText(messageText).then(() => {
      // Could add a toast notification here
      console.log('Message copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy message:', err);
    });
    setMessageMenuOpen(null);
  };

  const handleEditMessage = (messageId: string, messageText: string) => {
    // Double-check that this message belongs to the current user
    const message = messages.find(msg => (msg._id || msg.id) === messageId);
    if (!message) {
      console.error("Message not found");
      return;
    }

    const isOwnMessage = getUserId(message.senderId) === user?._id;
    if (!isOwnMessage) {
      console.error("Unauthorized: Cannot edit other user's message");
      return;
    }

    setEditingMessageId(messageId);
    setNewMessage(messageText);
    setMessageMenuOpen(null);
  };

  const handleReplyToMessage = (messageId: string, messageText: string) => {
    const previewText = messageText.length > 80 ? `${messageText.slice(0, 77)}...` : messageText;
    setReplyToMessage({ id: messageId, text: previewText });
    setMessageMenuOpen(null);
  };

  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  const togglePinMessage = (messageId: string) => {
    setPinnedMessageIds((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
    setMessageMenuOpen(null);
  };

  const handleForwardMessage = (messageText: string) => {
    if (!messageText) {
      setMessageMenuOpen(null);
      return;
    }
    const forwardPrefix = "Fwd: ";
    setNewMessage((prev) => {
      if (!prev) return `${forwardPrefix}${messageText}`;
      return `${prev}\n\n${forwardPrefix}${messageText}`;
    });
    setMessageMenuOpen(null);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setNewMessage("");
  };

  const toggleMessageMenu = (messageId: string) => {
    setMessageMenuOpen(prev => prev === messageId ? null : messageId);
  };

  const handleClearChatHistory = () => {
    if (!selectedConversation || !user?._id) return;

    // Confirm before clearing
    if (window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      // Clear messages from state
      setMessages([]);

      // Clear from localStorage
      const conversationKey = getNormalizedConversationKey(user._id, selectedConversation.freelancerId);
      const legacyConversationKey = `conversation_${user._id}_${selectedConversation.freelancerId}`;
      localStorage.removeItem(conversationKey);
      localStorage.removeItem(legacyConversationKey);

      // Persist a cleared timestamp so old messages don't return
      const clearedKey = getConversationClearedKey(user._id, selectedConversation.freelancerId);
      localStorage.setItem(clearedKey, new Date().toISOString());

      // Update conversation list to remove last message
      setConversations((prev) => {
        return prev.map((conv) =>
          getConversationKey(conv) === conversationKey
            ? {
              ...conv,
              lastMessage: "",
              lastMessageTime: new Date().toISOString(),
            }
            : conv
        );
      });

      setChatHeaderMenuOpen(false);
    }
  };

  // Close message menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messageMenuRef.current && !messageMenuRef.current.contains(event.target as Node)) {
        setMessageMenuOpen(null);
      }
      if (chatHeaderMenuRef.current && !chatHeaderMenuRef.current.contains(event.target as Node)) {
        setChatHeaderMenuOpen(false);
      }
    };

    if (messageMenuOpen || chatHeaderMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [messageMenuOpen, chatHeaderMenuOpen]);

  // Cleanup video call on unmount or modal close
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [localStream]);

  // Update video element when stream changes
  useEffect(() => {
    const attachStream = () => {
      if (localVideoRef.current && localStream) {
        console.log('Attaching stream to video element');
        localVideoRef.current.srcObject = localStream;
        // Ensure video plays
        localVideoRef.current.play().catch(err => {
          console.log('Video autoplay was prevented:', err);
        });
      }
    };

    // Try immediately
    attachStream();

    // Also try after a short delay to handle race conditions
    const timeoutId = setTimeout(attachStream, 200);

    return () => clearTimeout(timeoutId);
  }, [localStream, showVideoCallModal, callStatus]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);


  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3 border-b backdrop-blur-xl ${darkMode
          ? "bg-black/40 border-cyan-500/30"
          : "bg-white/60 border-cyan-200"
          }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.div
              className={`p-2 rounded-lg ${darkMode
                ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
                : "bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200"
                }`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <MessageSquare className={`w-4 h-4 ${darkMode ? "text-cyan-400" : "text-cyan-600"
                }`} />
            </motion.div>
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"
                }`}>
                Messages
              </h2>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                {displayConversations.length} {displayConversations.length === 1 ? "conversation" : "conversations"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div
          className={`w-full md:w-96 border-r-2 overflow-y-auto custom-scrollbar ${darkMode
            ? "border-cyan-500/30 bg-black/20 backdrop-blur-xl"
            : "border-cyan-200 bg-gray-50/50 backdrop-blur-xl"
            } ${selectedConversation ? "hidden md:block" : ""}`}
        >
          {displayConversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center h-full flex items-center justify-center"
            >
              <div>
                <motion.div
                  className={`w-24 h-24 rounded-full mx-auto mb-6 ${darkMode
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-cyan-500/30"
                    : "bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-cyan-200"
                    } flex items-center justify-center`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <MessageSquare className={`w-12 h-12 ${darkMode ? "text-gray-600" : "text-gray-400"
                    }`} />
                </motion.div>
                <p className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                  No messages yet
                </p>
                <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-500"
                  }`}>
                  Start a conversation by messaging a freelancer
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="divide-y-2 divide-cyan-500/10 dark:divide-cyan-500/20">
              {displayConversations.map((conv, index) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-3 cursor-pointer transition-all relative group ${selectedConversation?.id === conv.id
                    ? darkMode
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-l-2 border-cyan-500 shadow-md"
                      : "bg-gradient-to-r from-cyan-50 to-blue-50 border-l-2 border-cyan-500 shadow-sm"
                    : darkMode
                      ? "hover:bg-white/5 hover:border-l hover:border-cyan-500/50"
                      : "hover:bg-gray-100/50 hover:border-l hover:border-cyan-300"
                    }`}
                  whileHover={{ x: 2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start gap-2">
                    <motion.div
                      className={`w-10 h-10 rounded-lg ${darkMode
                        ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/50"
                        : "bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200"
                        } flex items-center justify-center flex-shrink-0 shadow-sm`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <span className={`text-base font-bold ${darkMode ? "text-cyan-300" : "text-cyan-700"
                        }`}>
                        {conv.freelancerName.charAt(0).toUpperCase()}
                      </span>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-bold text-sm truncate ${darkMode ? "text-white" : "text-gray-900"
                          }`}>
                          {conv.freelancerName}
                        </h3>
                        <motion.span
                          className={`text-[10px] font-medium flex-shrink-0 ml-2 px-1.5 py-0.5 rounded ${darkMode
                            ? "bg-white/10 text-gray-400"
                            : "bg-gray-200 text-gray-600"
                            }`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {formatTime(conv.lastMessageTime)}
                        </motion.span>
                      </div>
                      <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>
                        {conv.lastMessage || "Start a conversation..."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <AnimatePresence>
          {selectedConversation ? (
            <motion.div
              key={selectedConversation.id}
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col relative"
            >
              {/* Chat Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 border-b backdrop-blur-xl flex items-center justify-between relative z-30 ${darkMode
                  ? "bg-black/40 border-cyan-500/30"
                  : "bg-white/60 border-cyan-200"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className={`w-10 h-10 rounded-lg ${darkMode
                      ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/50"
                      : "bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200"
                      } flex items-center justify-center shadow-sm cursor-pointer`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    onClick={() => setShowProfileModal(true)}
                  >
                    <span className={`text-base font-bold ${darkMode ? "text-cyan-300" : "text-cyan-700"
                      }`}>
                      {selectedConversation.freelancerName.charAt(0).toUpperCase()}
                    </span>
                  </motion.div>
                  <div
                    className="cursor-pointer"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <h3 className={`font-bold text-base mb-0.5 hover:underline ${darkMode ? "text-white" : "text-gray-900"
                      }`}>
                      {selectedConversation.freelancerName}
                    </h3>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                      {selectedConversation.freelancerEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 relative">
                  {/* Video Call Button */}
                  <motion.button
                    onClick={initiateVideoCall}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg transition-all ${darkMode
                      ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-400 border border-green-500/30"
                      : "bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-600 border border-green-200"
                      }`}
                    title="Start Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </motion.button>

                  {/* 3-Dot Menu Button */}
                  <div className="relative z-50">
                    <motion.button
                      onClick={() => setChatHeaderMenuOpen(!chatHeaderMenuOpen)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2 rounded-lg transition-all ${darkMode
                        ? "bg-white/10 hover:bg-white/20 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        }`}
                      title="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </motion.button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {chatHeaderMenuOpen && (
                        <motion.div
                          ref={chatHeaderMenuRef}
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className={`absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg shadow-xl overflow-hidden ${darkMode
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-white border border-gray-200"
                            }`}
                        >

                          {/* View Profile Option */}
                          <button
                            onClick={() => {
                              setShowProfileModal(true);
                              setChatHeaderMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${darkMode
                              ? "text-gray-300 hover:bg-white/10"
                              : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            <User className="w-4 h-4" />
                            View Profile
                          </button>

                          {/* Clear Chat History Option */}
                          <button
                            onClick={handleClearChatHistory}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${darkMode
                              ? "text-red-400 hover:bg-red-500/20"
                              : "text-red-500 hover:bg-red-50"
                              }`}
                          >
                            <Trash2 className="w-4 h-4" />
                            Clear Chat History
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    onClick={() => setSelectedConversation(null)}
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    className={`md:hidden p-2 rounded-lg transition-all ${darkMode
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-black"
                      }`}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Messages */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-visible p-4 pb-12 space-y-3 custom-scrollbar bg-gradient-to-b from-transparent via-transparent to-transparent">
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center h-full"
                  >
                    <div className="text-center">
                      <motion.div
                        className={`w-20 h-20 rounded-full mx-auto mb-4 ${darkMode
                          ? "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-cyan-500/30"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-cyan-200"
                          } flex items-center justify-center`}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <MessageSquare className={`w-10 h-10 ${darkMode ? "text-gray-600" : "text-gray-400"
                          }`} />
                      </motion.div>
                      <p className={`text-lg font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>
                        No messages yet
                      </p>
                      <p className={`text-sm mt-2 ${darkMode ? "text-gray-500" : "text-gray-500"
                        }`}>
                        Start the conversation!
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwnMessage = getUserId(msg.senderId) === user?._id;
                    const messageId = msg._id || msg.id || `msg_${msg.createdAt}_${msg.senderId}`;
                    // Show edited text in real-time if this message is being edited
                    const messageText = editingMessageId === messageId ? newMessage : msg.message;
                    const timestamp = msg.createdAt || msg.timestamp || new Date().toISOString();
                    const hasVoice = msg.voiceData;
                    const hasFiles = msg.files && msg.files.length > 0;
                    const voiceDuration = msg.voiceDuration || 0;
                    const isPinned = pinnedMessageIds.includes(messageId);

                    return (
                      <motion.div
                        key={messageId}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} items-end gap-1.5`}
                      >
                        {!isOwnMessage && (
                          <motion.div
                            className={`w-6 h-6 rounded-full ${darkMode
                              ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30"
                              : "bg-gradient-to-br from-cyan-100 to-blue-100"
                              } flex items-center justify-center flex-shrink-0`}
                            whileHover={{ scale: 1.05 }}
                          >
                            <span className={`text-[10px] font-bold ${darkMode ? "text-cyan-300" : "text-cyan-700"
                              }`}>
                              {selectedConversation.freelancerName.charAt(0).toUpperCase()}
                            </span>
                          </motion.div>
                        )}
                        {/* Message Container with Options Menu */}
                        <div className="relative group">
                          {/* 3-Dot Options Menu Button */}
                          <div className={`absolute ${isOwnMessage ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                            <motion.button
                              onClick={() => toggleMessageMenu(messageId)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`p-1.5 rounded-full ${darkMode
                                ? "bg-gray-700/80 hover:bg-gray-600 text-gray-300"
                                : "bg-gray-200/80 hover:bg-gray-300 text-gray-600"
                                }`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </motion.button>
                          </div>

                          {/* Options Dropdown Menu */}
                          <AnimatePresence>
                            {messageMenuOpen === messageId && (
                              <motion.div
                                ref={messageMenuRef}
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} top-full mt-1 z-20 min-w-[160px] rounded-xl shadow-xl overflow-hidden ${darkMode
                                  ? "bg-gray-800 border border-gray-700"
                                  : "bg-white border border-gray-200"
                                  }`}
                              >
                                {/* Reply Option */}
                                {messageText && (
                                  <button
                                    onClick={() => handleReplyToMessage(messageId, messageText || '')}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${darkMode
                                      ? "text-gray-300 hover:bg-gray-700"
                                      : "text-gray-700 hover:bg-gray-100"
                                      }`}
                                  >
                                    <Reply className="w-4 h-4" />
                                    Reply
                                  </button>
                                )}

                                {/* Forward Option */}
                                {messageText && (
                                  <button
                                    onClick={() => handleForwardMessage(messageText || '')}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${darkMode
                                      ? "text-gray-300 hover:bg-gray-700"
                                      : "text-gray-700 hover:bg-gray-100"
                                      }`}
                                  >
                                    <Forward className="w-4 h-4" />
                                    Forward
                                  </button>
                                )}

                                {/* Pin / Unpin Option */}
                                <button
                                  onClick={() => togglePinMessage(messageId)}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${darkMode
                                    ? "text-yellow-300 hover:bg-yellow-500/10"
                                    : "text-yellow-700 hover:bg-yellow-50"
                                    }`}
                                >
                                  <Pin className="w-4 h-4" />
                                  {pinnedMessageIds.includes(messageId) ? "Unpin" : "Pin"}
                                </button>

                                {/* Copy Option */}
                                <button
                                  onClick={() => handleCopyMessage(messageText || '')}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${darkMode
                                    ? "text-gray-300 hover:bg-gray-700"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                  <Copy className="w-4 h-4" />
                                  Copy
                                </button>

                                {/* Edit Option - Only for own messages */}
                                {isOwnMessage && messageText && !hasVoice && !hasFiles && (
                                  <button
                                    onClick={() => handleEditMessage(messageId, messageText)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${darkMode
                                      ? "text-cyan-400 hover:bg-cyan-500/20"
                                      : "text-cyan-600 hover:bg-cyan-50"
                                      }`}
                                  >
                                    <Pencil className="w-4 h-4" />
                                    Edit
                                  </button>
                                )}

                                {/* Delete Option */}
                                <button
                                  onClick={() => handleDeleteMessage(messageId)}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${darkMode
                                    ? "text-red-400 hover:bg-red-500/20"
                                    : "text-red-500 hover:bg-red-50"
                                    }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <motion.div
                            className={`max-w-[75%] rounded-xl pl-12 pr-4 py-3 shadow-sm ${isOwnMessage
                              ? darkMode
                                ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white"
                                : "bg-gradient-to-br from-cyan-500 to-blue-500 text-white"
                              : darkMode
                                ? "bg-gray-800/80 backdrop-blur-xl text-white border border-white/10"
                                : "bg-white text-black border border-gray-200"
                              } ${isPinned ? (isOwnMessage ? "ring-2 ring-yellow-300/80" : "ring-2 ring-yellow-400/80") : ""}`}
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            style={{ minHeight: 'min-content' }}
                          >
                            {isPinned && (
                              <div className="flex items-center gap-1 mb-1 text-[10px] text-yellow-100/90 dark:text-yellow-200/90">
                                <Pin className="w-3 h-3" />
                                <span>Pinned message</span>
                              </div>
                            )}
                            {/* Voice Message Player */}
                            {hasVoice && (
                              <div className={`mb-1.5 p-2.5 rounded-xl border ${isOwnMessage
                                ? "bg-white/20 border-white/20"
                                : darkMode
                                  ? "bg-white/10 border-white/10"
                                  : "bg-gray-100 border-gray-200"
                                }`}>
                                <div className="flex items-center gap-2">
                                  <div className={`p-2 rounded-full ${isOwnMessage ? "bg-white/30" : darkMode ? "bg-cyan-500/30" : "bg-cyan-100"
                                    }`}>
                                    <Mic className={`w-3.5 h-3.5 ${isOwnMessage ? "text-white" : darkMode ? "text-cyan-400" : "text-cyan-600"
                                      }`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <audio
                                        controls
                                        src={msg.voiceData ?? undefined}
                                        className="w-full h-8"
                                        style={{
                                          filter: isOwnMessage ? 'invert(1) brightness(2)' : 'none',
                                          maxWidth: '220px'
                                        }}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className={`text-[10px] uppercase tracking-wide ${isOwnMessage ? "text-white/70" : darkMode ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                        Voice message
                                      </span>
                                      <span className={`text-[10px] font-medium ${isOwnMessage ? "text-white/70" : darkMode ? "text-gray-400" : "text-gray-500"
                                        }`}>
                                        {Math.floor(voiceDuration / 60)}:{(voiceDuration % 60).toString().padStart(2, '0')}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!msg.voiceData) return;
                                      try {
                                        const link = document.createElement('a');
                                        link.href = msg.voiceData;
                                        link.download = `voice-message-${messageId}.webm`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      } catch (e) {
                                        console.error("Failed to download voice message:", e);
                                      }
                                    }}
                                    className={`p-1.5 rounded-full ${isOwnMessage
                                      ? "bg-white/30 hover:bg-white/40"
                                      : darkMode
                                        ? "bg-cyan-500/20 hover:bg-cyan-500/30"
                                        : "bg-cyan-100 hover:bg-cyan-200"
                                      }`}
                                    title="Download voice message"
                                  >
                                    <Download className={`w-3 h-3 ${isOwnMessage ? "text-white" : darkMode ? "text-cyan-300" : "text-cyan-700"
                                      }`} />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* File Attachments */}
                            {hasFiles && (
                              <div className="mb-1.5 space-y-1.5">
                                {(msg.files ?? []).map((file, fileIndex) => {
                                  const FileIcon = (() => {
                                    const type = file.type?.toLowerCase() || '';
                                    const name = file.name?.toLowerCase() || '';
                                    if (type.startsWith('image/')) return Image;
                                    if (type.startsWith('video/')) return Film;
                                    if (type.startsWith('audio/')) return Music;
                                    if (type.includes('pdf')) return FileText;
                                    if (type.includes('zip') || type.includes('rar')) return Archive;
                                    if (['.js', '.ts', '.py', '.java', '.html', '.css'].some(ext => name.endsWith(ext))) return Code;
                                    return File;
                                  })();

                                  return (
                                    <div
                                      key={fileIndex}
                                      className={`flex items-center gap-1.5 p-1.5 rounded ${isOwnMessage
                                        ? "bg-white/20 hover:bg-white/30"
                                        : darkMode
                                          ? "bg-white/10 hover:bg-white/20"
                                          : "bg-gray-100 hover:bg-gray-200"
                                        } cursor-pointer transition-all`}
                                      onClick={() => {
                                        // Download file
                                        const link = document.createElement('a');
                                        link.href = file.dataUrl;
                                        link.download = file.name;
                                        link.click();
                                      }}
                                    >
                                      <FileIcon className={`w-3 h-3 flex-shrink-0 ${isOwnMessage ? "text-white" : darkMode ? "text-cyan-400" : "text-cyan-600"
                                        }`} />
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-[10px] font-medium truncate ${isOwnMessage ? "text-white" : darkMode ? "text-white" : "text-gray-900"
                                          }`}>
                                          {file.name}
                                        </p>
                                        <p className={`text-[10px] ${isOwnMessage ? "text-white/70" : darkMode ? "text-gray-400" : "text-gray-500"
                                          }`}>
                                          {formatFileSize(file.size)}
                                        </p>
                                      </div>
                                      <span className={`text-[10px] ${isOwnMessage ? "text-white/70" : darkMode ? "text-cyan-400" : "text-cyan-600"
                                        }`}>
                                        Download
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Text Message */}
                            {messageText && !messageText.startsWith('🎤') && !messageText.startsWith('📎') && (
                              <div className="flex items-start gap-1">
                                <p className="text-xs whitespace-pre-wrap break-words font-medium leading-snug flex-1">
                                  {messageText}
                                </p>
                                {msg.isEdited && (
                                  <span className={`text-[9px] flex-shrink-0 ${isOwnMessage ? "text-cyan-100/60" : darkMode ? "text-gray-500" : "text-gray-400"}`} title="Edited">
                                    (edited)
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-end gap-1.5 mt-2 pt-1 w-full">
                              <p className={`text-[10px] whitespace-nowrap flex-shrink-0 px-2 py-0.5 rounded-full ${isOwnMessage
                                ? "text-cyan-100/90 bg-white/15"
                                : darkMode
                                  ? "text-gray-300 bg-white/10"
                                  : "text-gray-600 bg-gray-100"
                                }`}>
                                {formatTime(timestamp)}
                              </p>
                              {isOwnMessage && (
                                <CheckCircle2 className={`w-2.5 h-2.5 flex-shrink-0 ${darkMode ? "text-cyan-200/80" : "text-cyan-100/80"
                                  }`} />
                              )}
                            </div>
                          </motion.div>
                        </div>
                        {isOwnMessage && (
                          <motion.div
                            className={`w-6 h-6 rounded-full ${darkMode
                              ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30"
                              : "bg-gradient-to-br from-cyan-100 to-blue-100"
                              } flex items-center justify-center flex-shrink-0`}
                            whileHover={{ scale: 1.05 }}
                          >
                            <span className={`text-[10px] font-bold ${darkMode ? "text-cyan-300" : "text-cyan-700"
                              }`}>
                              {user?.profile?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 border-t backdrop-blur-xl ${darkMode
                  ? "bg-black/40 border-cyan-500/30"
                  : "bg-white/60 border-cyan-200"
                  }`}
              >
                {/* Edit Mode Indicator */}
                {editingMessageId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mb-2 flex items-center justify-between px-3 py-2 rounded-lg ${darkMode
                      ? "bg-cyan-500/20 border border-cyan-500/30"
                      : "bg-cyan-50 border border-cyan-200"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Pencil className={`w-4 h-4 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                      <span className={`text-sm font-medium ${darkMode ? "text-cyan-300" : "text-cyan-700"}`}>
                        Editing message
                      </span>
                    </div>
                    <motion.button
                      onClick={handleCancelEdit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-1 rounded-lg ${darkMode ? "hover:bg-cyan-500/30 text-cyan-400" : "hover:bg-cyan-100 text-cyan-600"}`}
                      title="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}
                {replyToMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mb-2 flex items-center justify-between px-3 py-2 rounded-lg ${darkMode
                      ? "bg-purple-500/15 border border-purple-500/40"
                      : "bg-purple-50 border border-purple-300"
                      }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Reply className={`w-4 h-4 ${darkMode ? "text-purple-300" : "text-purple-600"}`} />
                      <div className="min-w-0">
                        <span className={`text-xs font-semibold block ${darkMode ? "text-purple-200" : "text-purple-700"}`}>
                          Replying to
                        </span>
                        <span className={`text-xs truncate block ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                          {replyToMessage.text}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleCancelReply}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-1 rounded-lg ${darkMode ? "hover:bg-purple-500/25 text-purple-200" : "hover:bg-purple-100 text-purple-700"}`}
                      title="Cancel reply"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}
                {/* Attached Files Preview */}
                <AnimatePresence>
                  {attachedFiles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-2"
                    >
                      {/* Files Header with Count and Clear All */}
                      <div className={`flex items-center justify-between mb-2 px-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {attachedFiles.length} {attachedFiles.length === 1 ? 'file' : 'files'} attached
                          </span>
                          <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                            ({formatFileSize(attachedFiles.reduce((acc, f) => acc + f.size, 0))} total)
                          </span>
                        </div>
                        <motion.button
                          onClick={() => setAttachedFiles([])}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`text-xs font-medium px-2 py-1 rounded-lg ${darkMode
                            ? "text-red-400 hover:bg-red-500/20"
                            : "text-red-500 hover:bg-red-50"
                            }`}
                        >
                          Clear All
                        </motion.button>
                      </div>

                      {/* Scrollable Files Container */}
                      <div className={`flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1 rounded-xl ${darkMode ? "bg-white/5" : "bg-gray-50"
                        }`}>
                        {attachedFiles.map((file, index) => {
                          const FileIcon = getFileIcon(file);
                          return (
                            <motion.div
                              key={`${file.name}-${index}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl ${darkMode
                                ? "bg-white/10 border border-white/20"
                                : "bg-white border border-gray-200 shadow-sm"
                                }`}
                            >
                              <FileIcon className={`w-4 h-4 flex-shrink-0 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                              <div className="flex flex-col min-w-0">
                                <span className={`text-xs font-medium truncate max-w-[100px] ${darkMode ? "text-white" : "text-gray-900"
                                  }`} title={file.name}>
                                  {file.name}
                                </span>
                                <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  {formatFileSize(file.size)}
                                </span>
                              </div>
                              <motion.button
                                onClick={() => removeAttachedFile(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-1 rounded-full flex-shrink-0 ${darkMode ? "hover:bg-red-500/30 text-gray-400 hover:text-red-400" : "hover:bg-red-100 text-gray-500 hover:text-red-500"
                                  }`}
                              >
                                <X className="w-3 h-3" />


                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Voice Recording Preview */}
                <AnimatePresence>
                  {(isRecording || audioBlob) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-2"
                    >
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isRecording
                        ? darkMode
                          ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30"
                          : "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200"
                        : darkMode
                          ? "bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30"
                          : "bg-gradient-to-r from-green-50 to-cyan-50 border border-green-200"
                        }`}>
                        {isRecording ? (
                          <>
                            <motion.div
                              className="w-2 h-2 rounded-full bg-red-500"
                              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                            <span className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                              Recording... {formatRecordingTime(recordingTime)}
                            </span>
                            <div className="flex-1" />
                            <motion.button
                              onClick={stopRecording}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`p-1.5 rounded-lg ${darkMode
                                ? "bg-red-500/30 hover:bg-red-500/50 text-red-400"
                                : "bg-red-100 hover:bg-red-200 text-red-600"
                                }`}
                              title="Stop Recording"
                            >
                              <Square className="w-3.5 h-3.5" />
                            </motion.button>
                            <motion.button
                              onClick={cancelRecording}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`p-1.5 rounded-lg ${darkMode
                                ? "bg-gray-500/30 hover:bg-gray-500/50 text-gray-400"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                                }`}
                              title="Cancel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          </>
                        ) : (
                          <>
                            <motion.div
                              className={`p-1.5 rounded-full ${darkMode ? "bg-green-500/30" : "bg-green-100"
                                }`}
                            >
                              <Mic className={`w-3.5 h-3.5 ${darkMode ? "text-green-400" : "text-green-600"}`} />
                            </motion.div>
                            <span className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                              Voice • {formatRecordingTime(recordingTime)}
                            </span>
                            <div className="flex-1" />
                            <motion.button
                              onClick={isPlayingRecording ? pauseRecording : playRecording}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`p-1.5 rounded-lg ${darkMode
                                ? "bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-400"
                                : "bg-cyan-100 hover:bg-cyan-200 text-cyan-600"
                                }`}
                              title={isPlayingRecording ? "Pause" : "Play"}
                            >
                              {isPlayingRecording ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </motion.button>
                            <motion.button
                              onClick={cancelRecording}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`p-1.5 rounded-lg ${darkMode
                                ? "bg-red-500/30 hover:bg-red-500/50 text-red-400"
                                : "bg-red-100 hover:bg-red-200 text-red-600"
                                }`}
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                            {/* Send Voice Message Button */}
                            <motion.button
                              onClick={handleSendMessage}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={sending}
                              className={`p-1.5 rounded-lg ${darkMode
                                ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-sm"
                                : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-sm"
                                }`}
                              title="Send Voice Message"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2 relative">
                  {/* Hidden File Input - Accepts ALL file types with no limits */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Emoji Picker Button */}
                  <motion.button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 rounded-lg transition-all ${showEmojiPicker
                      ? darkMode
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                      : darkMode
                        ? "bg-white/10 hover:bg-white/20 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Add Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </motion.button>

                  {/* File Attachment Button */}
                  <div className="relative">
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 rounded-lg transition-all ${attachedFiles.length > 0
                        ? darkMode
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                        : darkMode
                          ? "bg-white/10 hover:bg-white/20 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={`Attach Files (${attachedFiles.length} attached)`}
                    >
                      <Paperclip className="w-4 h-4" />
                    </motion.button>
                    {/* File Count Badge */}
                    {attachedFiles.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md"
                      >
                        {attachedFiles.length > 99 ? '99+' : attachedFiles.length}
                      </motion.div>
                    )}
                  </div>

                  {/* Voice Recording Button */}
                  <motion.button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-2 rounded-lg transition-all ${isRecording
                      ? darkMode
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                        : "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                      : audioBlob
                        ? darkMode
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                        : darkMode
                          ? "bg-white/10 hover:bg-white/20 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={isRecording ? "Stop Recording" : "Start Voice Recording"}
                  >
                    {isRecording ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <MicOff className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </motion.button>

                  {/* Emoji Picker */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        ref={emojiPickerRef}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-full left-0 mb-3 z-50 max-w-[calc(100vw-2rem)]"
                      >
                        <div className={`rounded-2xl overflow-hidden shadow-2xl ${darkMode ? "bg-gray-900 border-2 border-cyan-500/30" : "bg-white border-2 border-cyan-200"
                          }`}>
                          <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            theme={darkMode ? Theme.DARK : Theme.LIGHT}
                            width="100%"
                            height={350}
                            style={{ width: '100%', maxWidth: '350px', maxHeight: '400px' }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className={`flex-1 px-4 py-2.5 rounded-lg border text-sm backdrop-blur-xl transition-all ${darkMode
                      ? "bg-white/5 border-cyan-500/30 text-white placeholder-gray-500 focus:border-cyan-500 focus:bg-white/10"
                      : "bg-white/80 border-cyan-200 text-black placeholder-gray-500 focus:border-cyan-500 focus:bg-white"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && attachedFiles.length === 0 && !audioBlob) || sending}
                    className={`p-2.5 rounded-lg transition-all ${(newMessage.trim() || attachedFiles.length > 0 || audioBlob) && !sending
                      ? darkMode
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-md"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md"
                      : darkMode
                        ? "bg-white/10 text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    whileHover={(newMessage.trim() || attachedFiles.length > 0 || audioBlob) && !sending ? { scale: 1.05 } : {}}
                    whileTap={(newMessage.trim() || attachedFiles.length > 0 || audioBlob) && !sending ? { scale: 0.95 } : {}}
                    title={editingMessageId ? "Save changes" : "Send message"}
                  >
                    {sending ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  className={`w-32 h-32 rounded-full mx-auto mb-6 ${darkMode
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-cyan-500/30"
                    : "bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-cyan-200"
                    } flex items-center justify-center shadow-2xl`}
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <MessageSquare className={`w-16 h-16 ${darkMode ? "text-gray-600" : "text-gray-400"
                    }`} />
                </motion.div>
                <p className={`text-xl font-bold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                  Select a conversation
                </p>
                <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-500"
                  }`}>
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Video Call Modal */}
      <AnimatePresence>
        {showVideoCallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* Full Screen Video Call Interface */}
            <div className="absolute inset-0 bg-gray-900">
              {/* Remote Video (placeholder - shows avatar) */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                {callStatus === 'connected' ? (
                  <div className="text-center">
                    <motion.div
                      className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-4 border-cyan-500/50 flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-5xl font-bold text-cyan-300">
                        {selectedConversation?.freelancerName?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedConversation?.freelancerName}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Waiting for {selectedConversation?.freelancerName} to join...
                    </p>
                  </div>
                ) : callStatus === 'calling' ? (
                  <div className="text-center">
                    <motion.div
                      className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-4 border-cyan-500/50 flex items-center justify-center"
                      animate={{
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(6, 182, 212, 0.4)",
                          "0 0 0 30px rgba(6, 182, 212, 0)",
                          "0 0 0 0 rgba(6, 182, 212, 0)"
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="text-5xl font-bold text-cyan-300">
                        {selectedConversation?.freelancerName?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedConversation?.freelancerName}
                    </h3>
                    <motion.p
                      className="text-cyan-400 text-lg font-medium"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Calling...
                    </motion.p>
                  </div>
                ) : callStatus === 'ended' ? (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-32 h-32 rounded-full mx-auto mb-4 bg-red-500/20 border-4 border-red-500/50 flex items-center justify-center"
                    >
                      <X className="w-16 h-16 text-red-400" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Call Ended
                    </h3>
                    <p className="text-gray-400">
                      Duration: {formatCallDuration(callDuration)}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Local Video Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                className="absolute bottom-32 right-6 w-48 h-36 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl bg-gray-800"
              >
                {/* Always render video element so ref is available */}
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover transform scale-x-[-1] ${isVideoEnabled && localStream ? 'block' : 'hidden'
                    }`}
                />
                {/* Show avatar when video is off */}
                {(!isVideoEnabled || !localStream) && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                        <span className="text-lg font-bold text-gray-400">
                          {user?.profile?.firstName?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Camera Off</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/50 text-xs text-white">
                  You
                </div>
              </motion.div>

              {/* Call Duration */}
              {callStatus === 'connected' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-green-400 font-mono font-medium">
                      {formatCallDuration(callDuration)}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Video Call</span>
                </div>
                <motion.button
                  onClick={endVideoCall}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Bottom Controls */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
              >
                <div className="flex items-center justify-center gap-4">
                  {/* Mute Audio Button */}
                  <motion.button
                    onClick={toggleAudio}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-4 rounded-full transition-all ${isAudioEnabled
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-red-500 hover:bg-red-400 text-white"
                      }`}
                    title={isAudioEnabled ? "Mute" : "Unmute"}
                  >
                    {isAudioEnabled ? (
                      <Mic className="w-6 h-6" />
                    ) : (
                      <MicOff className="w-6 h-6" />
                    )}
                  </motion.button>

                  {/* Toggle Video Button */}
                  <motion.button
                    onClick={toggleVideo}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-4 rounded-full transition-all ${isVideoEnabled
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-red-500 hover:bg-red-400 text-white"
                      }`}
                    title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
                  >
                    {isVideoEnabled ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <X className="w-6 h-6" />
                    )}
                  </motion.button>

                  {/* End Call Button */}
                  <motion.button
                    onClick={endVideoCall}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-5 rounded-full bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/50"
                    title="End Call"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                      <line x1="23" y1="1" x2="1" y2="23" />
                    </svg>
                  </motion.button>
                </div>

                {/* Call Info */}
                <div className="mt-4 text-center">
                  <p className="text-white font-medium">{selectedConversation?.freelancerName}</p>
                  <p className="text-gray-400 text-sm">
                    {callStatus === 'calling' ? 'Ringing...' :
                      callStatus === 'connected' ? 'Connected' :
                        callStatus === 'ended' ? 'Call Ended' : ''}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Profile Modal */}
      {showProfileModal && selectedConversation && selectedConversation.freelancer && (
        <FreelancerProfileModal
          freelancer={selectedConversation.freelancer}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};

export default MessagesTab;
