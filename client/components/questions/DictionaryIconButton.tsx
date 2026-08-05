import { Book } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DictionaryIconButtonProps {
  onClick: () => void;
  isVisible: boolean;
  position?: "top-left" | "bottom-left" | "bottom-center";
}

export default function DictionaryIconButton({
  onClick,
  isVisible,
  position = "top-left",
}: DictionaryIconButtonProps) {
  const positionStyle =
    position === "bottom-center"
      ? { left: "0px", top: "calc(100% + 16px)" }
      : position === "bottom-left"
        ? { left: "-80px", bottom: "0px" }
        : { left: "-80px", top: "0px" };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
          className="absolute bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          style={{
            ...positionStyle,
            width: "64px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(229, 231, 235, 0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Book size={32} className="text-purple-600" strokeWidth={1.8} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
