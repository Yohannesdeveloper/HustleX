import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import { useLocation } from "react-router-dom";
import { Users, MessageSquare, Sparkles, Zap } from "lucide-react";
import FindFreelancersTab from "./FindFreelancersTab";
import MessagesTab from "./MessagesTab";
import { FreelancerWithStatus } from "../types";

const ChatInterface: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"find" | "messages">("find");
  // Shared state to prevent freelancers from disappearing on tab switch
  const [sharedFreelancers, setSharedFreelancers] = useState<FreelancerWithStatus[]>([]);

  // Check if we have a freelancer ID in location state (from message button click)
  useEffect(() => {
    const state = location.state as any;
    if (state?.freelancerId) {
      // Switch to messages tab when navigating with a freelancer
      setActiveTab("messages");
    }
  }, [location.state]);

  const tabs = [
    {
      id: "find" as const,
      label: "Find Freelancers",
      icon: Users,
    },
    {
      id: "messages" as const,
      label: "Messages",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className={`absolute inset-0 ${darkMode
          ? "bg-gradient-to-br from-gray-900 via-black to-gray-900"
          : "bg-gradient-to-br from-cyan-50 via-white to-blue-50"
          }`} />
        <motion.div
          className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 ${darkMode ? "bg-cyan-500" : "bg-cyan-400"
            }`}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={`absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 ${darkMode ? "bg-blue-500" : "bg-blue-400"
            }`}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 py-8">
        <div className="w-full px-0">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`flex gap-3 mb-8 backdrop-blur-xl rounded-2xl p-2 ${darkMode
              ? "bg-black/40 border border-white/10"
              : "bg-white/60 border border-gray-200/50"
              }`}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-4 font-bold flex items-center gap-3 transition-all rounded-xl z-10 ${isActive
                    ? darkMode
                      ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                    : darkMode
                      ? "text-gray-300 hover:text-white hover:bg-white/10"
                      : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={`w-5 h-5 relative z-20 ${isActive
                    ? "text-white"
                    : darkMode
                      ? "text-gray-300"
                      : "text-gray-800"
                    }`} />
                  <span className={`relative z-20 ${isActive
                    ? "text-white"
                    : darkMode
                      ? "text-gray-300"
                      : "text-gray-800"
                    }`}>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      className={`absolute inset-0 rounded-xl z-0 ${darkMode
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500"
                        }`}
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`rounded-3xl border-2 overflow-hidden backdrop-blur-xl shadow-2xl ${darkMode
                ? "bg-black/40 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]"
                : "bg-white/80 border-cyan-200 shadow-xl"
                }`}
              style={{ height: "calc(100vh - 280px)", minHeight: "600px" }}
            >
              {activeTab === "find" && (
                <FindFreelancersTab
                  sharedFreelancers={sharedFreelancers}
                  setSharedFreelancers={setSharedFreelancers}
                />
              )}
              {activeTab === "messages" && <MessagesTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
