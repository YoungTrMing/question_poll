import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface LensIconButtonProps {
  onClick: () => void;
}

export default function LensIconButton({ onClick }: LensIconButtonProps) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      aria-label="Activate cinematic highlight mode"
      className="absolute bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
      style={{
        left: "80px",
        top: "calc(100% + 16px)",
        width: "64px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(229, 231, 235, 0.5)",
        backdropFilter: "blur(4px)",
      }}
    >
      <Search size={32} className="text-purple-600" strokeWidth={1.8} />
    </motion.button>
  );
}
