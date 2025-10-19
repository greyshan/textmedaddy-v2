import React from "react";
import { FaRobot } from "react-icons/fa";
import { motion } from "framer-motion";

export default function AIBotButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white py-3 rounded-2xl shadow-lg hover:shadow-2xl transition"
    >
      <div className="p-2 rounded-full bg-gradient-to-tr from-pink-500 to-fuchsia-500 text-white">
        <FaRobot />
      </div>
      <span className="font-semibold">Chat with AI</span>
    </motion.button>
  );
}
