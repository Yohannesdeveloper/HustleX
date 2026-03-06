import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Send } from "lucide-react";

interface ApplicationSuccessAnimationProps {
    isVisible: boolean;
    onComplete: () => void;
    darkMode: boolean;
}

const ApplicationSuccessAnimation: React.FC<ApplicationSuccessAnimationProps> = ({
    isVisible,
    onComplete,
    darkMode,
}) => {
    return (
        <AnimatePresence onExitComplete={onComplete}>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={`relative w-full max-w-sm rounded-3xl p-8 shadow-2xl border text-center ${darkMode
                                ? "bg-gray-900/90 border-cyan-500/30 text-white"
                                : "bg-white/90 border-cyan-500/20 text-black"
                            }`}
                        initial={{ scale: 0.8, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, y: -20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <div className="relative h-32 w-32 mx-auto mb-6 flex items-center justify-center">
                            {/* Animated background rings */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-cyan-500/20"
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ duration: 0.5 }}
                            />
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.5, 1], opacity: [1, 0] }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            />

                            {/* Icon sequence */}
                            <div className="relative z-10">
                                <motion.div
                                    initial={{ x: -100, y: 100, scale: 0.5, rotate: -45, opacity: 0 }}
                                    animate={{
                                        x: [-100, 0, 50, 0],
                                        y: [100, 0, -50, 0],
                                        scale: [0.5, 1.2, 1.5, 0],
                                        rotate: [-45, 0, 45, 90],
                                        opacity: [0, 1, 1, 0]
                                    }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                >
                                    <Send className="w-16 h-16 text-cyan-400" />
                                </motion.div>

                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 1.2, type: "spring", stiffness: 500, damping: 15 }}
                                >
                                    <CheckCircle className="w-20 h-20 text-green-500" />
                                </motion.div>
                            </div>
                        </div>

                        <motion.h2
                            className="text-2xl font-bold mb-2 font-inter"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4 }}
                        >
                            Application Sent!
                        </motion.h2>
                        <motion.p
                            className={`text-sm font-inter ${darkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.6 }}
                        >
                            Your application has been successfully submitted to the employer.
                        </motion.p>

                        {/* Countdown bar */}
                        <div className="mt-8 h-1 w-full bg-gray-200/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-cyan-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 1.8, duration: 1.5 }}
                            />
                        </div>
                    </motion.div>

                    {/* Particle fragments */}
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-cyan-400"
                            initial={{ x: 0, y: 0, opacity: 0 }}
                            animate={{
                                x: (Math.random() - 0.5) * 400,
                                y: (Math.random() - 0.5) * 400,
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0]
                            }}
                            transition={{ delay: 1.2, duration: 1 }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ApplicationSuccessAnimation;
