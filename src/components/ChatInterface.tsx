import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import MessagesTab from "./MessagesTab";
import { FreelancerWithStatus } from "../types";
import { fetchFreelancerDirectory } from "../utils/freelancerDirectory";
import { useAuth } from "../store/hooks";
import apiService from "../services/api";
import { isClientMode } from "../utils/activeRole";
import { Sparkles, MessageCircle } from "lucide-react";

const ChatInterface: React.FC = () => {
  const darkMode = useAppSelector((s) => s.theme.darkMode);
  const { user } = useAuth();
  const [sharedFreelancers, setSharedFreelancers] = useState<FreelancerWithStatus[]>([]);
  const [freelancersLoading, setFreelancersLoading] = useState(true);

  const isClient = isClientMode(user);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFreelancersLoading(true);
      try {
        if (isClient) {
          const list = await fetchFreelancerDirectory();
          if (!cancelled) setSharedFreelancers(list);
        } else {
          const clients = await apiService.getClients();
          if (!cancelled) {
            setSharedFreelancers(
              clients.map((c) => ({
                ...c,
                status: "offline" as const,
                lastActive: undefined,
              })) as unknown as FreelancerWithStatus[]
            );
          }
        }
      } catch (e) {
        console.error("Failed to preload user directory:", e);
      } finally {
        if (!cancelled) setFreelancersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isClient, user?._id, user?.currentRole]);

  return (
    <div className="h-screen w-full flex flex-col">
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        :root {
          --cyan: #06f2f2;
          --cyan-dark: #05b8b8;
          --cyan-glow: 0 0 20px rgba(6, 242, 242, 0.3), 0 0 60px rgba(6, 242, 242, 0.1);
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(6, 242, 242, 0.15);
        }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
        }
        .cyan-gradient-text {
          background: linear-gradient(135deg, #06f2f2 0%, #0af 50%, #06f2f2 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dark .glass-card { background: rgba(0, 0, 0, 0.4); }
      `}</style>

      {freelancersLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className={`w-20 h-20 rounded-2xl mx-auto mb-6 ${darkMode
                ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
                : "bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200"
                } flex items-center justify-center`}
              animate={{ rotate: [0, 360], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <MessageCircle className={`w-10 h-10 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
            </motion.div>
            <motion.p
              className={`text-lg font-display font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading conversations...
            </motion.p>
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-cyan-500"
                  animate={{ y: [-4, 4, -4], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <MessagesTab
            availableFreelancers={sharedFreelancers}
            freelancersLoading={freelancersLoading}
            isClient={isClient}
            onFreelancersLoaded={setSharedFreelancers}
          />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
