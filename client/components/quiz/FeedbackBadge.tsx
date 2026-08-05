import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface FeedbackBadgeProps {
  type: "success" | "error";
  message: string;
  correctAnswer?: string;
}

export default function FeedbackBadge({
  type,
  message,
  correctAnswer,
}: FeedbackBadgeProps) {
  const isSuccess = type === "success";

  useEffect(() => {
    if (isSuccess) {
      // Confetti animation on success
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isSuccess]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className="mb-6"
    >
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-xl font-semibold text-base transition-all ${
          isSuccess
            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300 shadow-lg shadow-green-200"
            : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300 shadow-lg shadow-red-200"
        }`}
      >
        <motion.div
          animate={
            isSuccess
              ? { rotate: [0, -10, 10, -5, 5, 0] }
              : { x: [0, -5, 5, -5, 5, 0] }
          }
          transition={{ duration: 0.5 }}
        >
          {isSuccess ? (
            <Check size={24} className="text-green-600" />
          ) : (
            <X size={24} className="text-red-600" />
          )}
        </motion.div>
        <div className="flex-1">
          <p>{message}</p>
          {!isSuccess && correctAnswer && (
            <p className="text-sm mt-1 font-normal">
              Correct: <span className="font-semibold">{correctAnswer}</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
