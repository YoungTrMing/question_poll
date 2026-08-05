import { useState, useEffect, useRef } from "react";
import { X, Book } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { VocabularyItem } from "@shared/types";

interface VocabularyDialogProps {
  vocab: VocabularyItem[];
  isOpen: boolean;
  onClose: () => void;
  onDictIconShow: () => void;
  onPageChange?: (page: number) => void;
  variant?: "vertical" | "horizontal";
  position?: "top-left" | "bottom-center";
}

const ITEMS_PER_PAGE_VERTICAL = 4;
const ITEMS_PER_PAGE_HORIZONTAL = 3; // 3 columns × 1 word per column
const AUTO_ADVANCE_DELAY = 4000; // 4 seconds
const EXIT_ANIMATION_DURATION = 300; // 300ms

export default function VocabularyDialog({
  vocab,
  isOpen,
  onClose,
  onDictIconShow,
  onPageChange,
  variant = "vertical",
  position = "top-left",
}: VocabularyDialogProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = variant === "horizontal" ? ITEMS_PER_PAGE_HORIZONTAL : ITEMS_PER_PAGE_VERTICAL;
  const totalPages = Math.ceil(vocab.length / itemsPerPage);
  const currentItems = vocab.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCurrentPage((prev) => {
        if (prev + 1 >= totalPages) {
          // Last page reached, close dialog
          onClose();
          // Delay icon reappearance until exit animation completes
          setTimeout(() => {
            onDictIconShow();
          }, EXIT_ANIMATION_DURATION);
          return 0;
        }
        return prev + 1;
      });
    }, AUTO_ADVANCE_DELAY);

    return () => clearInterval(timer);
  }, [isOpen, totalPages, onClose, onDictIconShow]);

  const handleClose = () => {
    onClose();
    // Delay icon reappearance until exit animation completes
    setTimeout(() => {
      onDictIconShow();
    }, EXIT_ANIMATION_DURATION);
  };

  const dialogWidth = variant === "horizontal" ? "w-[900px]" : "w-80";
  const dialogPositionStyle =
    position === "bottom-center"
      ? { left: "0px", top: "calc(100% + 16px)" }
      : variant === "horizontal"
        ? { left: "-950px", top: "0px" }
        : { left: "-340px", top: "0px" };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          layout
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1, height: "auto" }}
          exit={{ opacity: 0, x: 10, scale: 0.95 }}
          transition={{ duration: 0.3, height: { duration: 0.5, ease: "easeInOut" } }}
          className={`absolute ${dialogWidth} bg-white rounded-2xl shadow-2xl overflow-hidden`}
          style={{
            ...dialogPositionStyle,
            zIndex: 50,
            maxHeight: "90vh",
          }}
        >
          {/* Content Wrapper - Notifies Framer Motion of content changes */}
          <div
            key={currentPage}
            className="w-full p-5 flex flex-col justify-start"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Book size={28} className="text-purple-600" strokeWidth={1.8} />
                <h2 className="text-base font-bold text-gray-900">VOCAB KEYWORDS</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Vocabulary Content Area */}
            <div
              className={`w-full ${
                variant === "horizontal" ? "px-0 py-6" : "py-4"
              }`}
            >
              <AnimatePresence mode="wait">
                {variant === "horizontal" ? (
                  <div
                    key={currentPage}
                    className="w-full grid grid-cols-3 gap-8"
                  >
                    <AnimatePresence mode="wait">
                      {currentItems.map((item, index) => (
                        <motion.div
                          key={`${currentPage}-${index}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.55, delay: index * 0.12 }}
                          className="min-h-[80px] flex flex-col justify-start"
                        >
                          <p className="font-bold text-gray-900 text-sm mb-3">
                            {item.word}
                          </p>
                          <p className="text-gray-600 text-xs italic leading-relaxed">
                            {item.definition}
                          </p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 w-full"
                  >
                    {currentItems.map((item, index) => (
                      <motion.div
                        key={`${currentPage}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className={`${
                          index < currentItems.length - 1
                            ? "pb-4 border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <p className="font-bold text-gray-900 text-sm mb-1">
                          {item.word}
                        </p>
                        <p className="text-gray-600 text-xs italic leading-relaxed">
                          {item.definition}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 py-3 border-t border-gray-200 flex-shrink-0 mt-auto">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <motion.div
                    key={index}
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        currentPage === index ? "rgb(147, 51, 234)" : "rgb(229, 231, 235)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
