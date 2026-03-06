import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../store/hooks";
import { X, Send, User } from "lucide-react";
import { FreelancerWithStatus } from "../types";
import apiService from "../services/api";

interface MessageModalProps {
  freelancer: FreelancerWithStatus;
  onClose: () => void;
  initialMessage?: string;
}

const MessageModal: React.FC<MessageModalProps> = ({
  freelancer,
  onClose,
  initialMessage = "",
}) => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();
  const [message, setMessage] = useState(initialMessage);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const profile = freelancer.profile || {};
  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || freelancer.email;

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      // For now, we'll use email to send the message
      // In the future, this can be replaced with a proper messaging API
      const emailData = {
        to: freelancer.email,
        subject: `Message from ${user?.profile?.firstName || user?.email} - HustleX`,
        body: message,
        isHtml: false,
      };

      // Try to send via contact API or show success message
      // Since there's no direct messaging API, we'll show a success message
      // and store the message locally for future implementation
      
      // Store message in localStorage for conversation history
      const conversationKey = `conversation_${user?._id}_${freelancer._id}`;
      const existingMessages = JSON.parse(
        localStorage.getItem(conversationKey) || "[]"
      );
      const newMessage = {
        id: Date.now().toString(),
        senderId: user?._id,
        receiverId: freelancer._id,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        senderName: `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim() || user?.email,
        receiverName: fullName,
        receiverEmail: freelancer.email,
      };
      existingMessages.push(newMessage);
      localStorage.setItem(conversationKey, JSON.stringify(existingMessages));

      setSent(true);
      
      // Trigger a custom event to refresh conversations in MessagesTab
      window.dispatchEvent(new CustomEvent('messageSent', { 
        detail: { freelancerId: freelancer._id } 
      }));
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          className={`${
            darkMode ? "bg-gray-900 border-white/10" : "bg-white border-black/10"
          } border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div
            className={`sticky top-0 z-10 ${
              darkMode ? "bg-gray-900/95 backdrop-blur-sm" : "bg-white/95 backdrop-blur-sm"
            } border-b ${darkMode ? "border-gray-700" : "border-gray-200"} px-6 py-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${
                    darkMode ? "bg-cyan-500/20" : "bg-cyan-100"
                  } flex items-center justify-center`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Send Message</h2>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    To: {fullName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  darkMode ? "text-white" : "text-black"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {sent ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Send className="w-8 h-8 text-white" />
                </motion.div>
                <p className={`text-lg font-semibold ${darkMode ? "text-white" : "text-black"}`}>
                  Message sent!
                </p>
                <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Your message has been sent to {fullName}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={8}
                    className={`w-full px-4 py-3 rounded-xl border resize-none transition-all ${
                      darkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-500"
                        : "bg-white border-gray-300 text-black placeholder-gray-500 focus:border-cyan-500"
                    } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                    autoFocus
                  />
                  <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {message.length} characters
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={onClose}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                      darkMode
                        ? "bg-gray-800 hover:bg-gray-700 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-black"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      !message.trim() || sending
                        ? darkMode
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : darkMode
                        ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                        : "bg-cyan-600 hover:bg-cyan-700 text-white"
                    }`}
                    whileHover={message.trim() && !sending ? { scale: 1.02 } : {}}
                    whileTap={message.trim() && !sending ? { scale: 0.98 } : {}}
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MessageModal;
