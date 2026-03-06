import React from "react";
import { motion } from "framer-motion";

interface StatusIndicatorProps {
  status: "online" | "offline" | "available" | "busy";
  lastActive?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  lastActive,
  size = "md",
  showLabel = false,
}) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const statusConfig = {
    online: {
      color: "bg-green-500",
      pulse: "bg-green-400",
      label: "Online",
    },
    offline: {
      color: "bg-gray-500",
      pulse: "",
      label: "Offline",
    },
    available: {
      color: "bg-blue-500",
      pulse: "bg-blue-400",
      label: "Available",
    },
    busy: {
      color: "bg-orange-500",
      pulse: "bg-orange-400",
      label: "Busy",
    },
  };

  const config = statusConfig[status];
  const isAnimated = status === "online" || status === "available";

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} ${config.color} rounded-full`}
          animate={isAnimated ? { scale: [1, 1.2, 1] } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {isAnimated && config.pulse && (
          <motion.div
            className={`absolute inset-0 ${sizeClasses[size]} ${config.pulse} rounded-full`}
            animate={{ scale: [1, 2, 2], opacity: [0.5, 0, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-sm font-medium">{config.label}</span>
      )}
      {lastActive && (
        <span className="text-xs opacity-70">
          {lastActive}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
