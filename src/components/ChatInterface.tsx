import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import MessagesTab from "./MessagesTab";
import { FreelancerWithStatus } from "../types";
import { fetchFreelancerDirectory } from "../utils/freelancerDirectory";
import { useAuth } from "../store/hooks";

const ChatInterface: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();
  const [sharedFreelancers, setSharedFreelancers] = useState<FreelancerWithStatus[]>([]);
  const [freelancersLoading, setFreelancersLoading] = useState(true);

  const isClient = Boolean(user?.roles?.includes("client") || user?.roles?.includes("admin"));

  // Preload freelancers so Messages tab can start chats
  useEffect(() => {
    if (!isClient) {
      setFreelancersLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setFreelancersLoading(true);
      try {
        const list = await fetchFreelancerDirectory();
        if (!cancelled) setSharedFreelancers(list);
      } catch (e) {
        console.error("Failed to preload freelancers:", e);
      } finally {
        if (!cancelled) setFreelancersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isClient, user?._id]);

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
          {/* Main Content Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-3xl border-2 overflow-hidden backdrop-blur-xl shadow-2xl ${darkMode
              ? "bg-black/40 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]"
              : "bg-white/80 border-cyan-200 shadow-xl"
              }`}
            style={{ height: "calc(100vh - 180px)", minHeight: "600px" }}
          >
            {/* MessagesTab container */}
            <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
              <MessagesTab
                availableFreelancers={sharedFreelancers}
                freelancersLoading={freelancersLoading}
                isClient={isClient}
                onFreelancersLoaded={setSharedFreelancers}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
