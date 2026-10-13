"use client";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string;
  type?: "error" | "success";
  onClose: () => void;
}

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50"
      >
        <div
          className={`rounded-lg shadow-lg p-4 ${
            type === "error"
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-green-50 text-green-600 border border-green-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-pre-line">{message}</span>
            <button
              onClick={onClose}
              className="ml-2 text-current opacity-50 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 