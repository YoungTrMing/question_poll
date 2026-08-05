import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Speaker } from "lucide-react";
import { motion } from "framer-motion";
import type { Question } from "@shared/types";
import { useAudio } from "@/hooks/useAudio";

const CORRECT_ANSWER_SFX = "https://cdn.builder.io/o/assets%2F2ce37a7c12ec46698eaf81cb74a09ee3%2Fe3747e7f6d3e4e948c5702aa63445231?alt=media&token=f0e72b36-51ab-4f9b-bbc9-f534a83aa0f5&apiKey=2ce37a7c12ec46698eaf81cb74a09ee3";
const NEXT_BUTTON_SFX = "https://cdn.builder.io/o/assets%2F2ce37a7c12ec46698eaf81cb74a09ee3%2Fd91c083582af48d1867923deecc61fb4?alt=media&token=be87d929-8569-4a5d-9744-6733b5ff9cc6&apiKey=2ce37a7c12ec46698eaf81cb74a09ee3";
const OPTION_HOVER_SFX = "https://cdn.builder.io/o/assets%2F2ce37a7c12ec46698eaf81cb74a09ee3%2Fcef735b4fc354b22af0ec3faf71180a8?alt=media&token=b842c79f-d014-4d4f-8909-d96ae573a231&apiKey=2ce37a7c12ec46698eaf81cb74a09ee3";

interface ListeningQuestionProps {
  question: Question & {
    audioUrl?: string;
  };
  onBack?: () => void;
  onSubmit?: (answer: string) => void;
  onNext?: () => void;
  isAnswered?: boolean;
}

export default function ListeningQuestion({
  question,
  onBack,
  onSubmit,
  onNext,
  isAnswered = false,
}: ListeningQuestionProps) {
  const { playAudio } = useAudio(CORRECT_ANSWER_SFX);
  const { playAudio: playNextButtonSound } = useAudio(NEXT_BUTTON_SFX);
  const { playAudio: playOptionHoverSound } = useAudio(OPTION_HOVER_SFX);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nextButtonHovered, setNextButtonHovered] = useState(false);
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isCorrect === true) {
      playAudio();
    }
  }, [isCorrect, playAudio]);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (answered) return;

    setSelectedOption(optionId);
    setAnswered(true);

    const correct = optionId === question.correctAnswer;
    setIsCorrect(correct);

    if (onSubmit) {
      onSubmit(optionId);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6"
      style={{
        background: "rgb(0, 177, 64)",
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          boxShadow:
            "0 15px 40px rgba(0, 0, 0, 0.35), 0 0 30px rgba(50, 40, 100, 0.2)",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(to bottom, hsl(257, 58%, 24%), hsl(257, 58%, 23%))",
          }}
          className=""
        >
          {/* Header */}
          <div className="px-6 py-6">
            <div
              className="flex items-center gap-3 rounded-lg px-4 py-2 mx-auto"
              style={{ backgroundColor: "hsl(260, 82%, 19%)" }}
            >
              <button
                onClick={onBack}
                className="text-white hover:text-purple-100 transition-colors flex-shrink-0"
              >
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>
              <h1 className="text-white text-lg font-bold flex-1 text-center">
                {"Listening Practice"}
              </h1>
              <div className="w-7" />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 space-y-6">
            {/* Speaker Icon & Play Button */}
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.button
                onClick={handlePlayAudio}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <Speaker
                  size={40}
                  className="text-black"
                  strokeWidth={1.5}
                />
              </motion.button>

              {/* Hidden Audio Element */}
              <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
                src={question.audioUrl || ""}
              />
            </motion.div>

            {/* Question Text */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl px-5 py-4 text-white shadow-lg">
              <p
                style={{
                  fontSize: "17px",
                  fontWeight: "500",
                  lineHeight: "23px",
                  whiteSpace: "pre-wrap",
                }}
                className="leading-relaxed text-center"
              >
                {question.title ||
                  "Listen to the audio and select the correct option"}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mt-10">
              {question.options.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={answered}
                  onMouseEnter={() => {
                    setHoveredOptionId(option.id);
                    if (!answered && selectedOption !== option.id) {
                      playOptionHoverSound();
                    }
                  }}
                  onMouseLeave={() => setHoveredOptionId(null)}
                  whileHover={!answered && selectedOption !== option.id ? { scale: 1.02, boxShadow: "0 8px 16px rgba(59, 130, 246, 0.2)" } : {}}
                  className={`w-full flex items-center gap-4 px-7 py-4 rounded-xl font-bold text-base transition-all duration-200 ${
                    selectedOption === option.id
                      ? isCorrect
                        ? "bg-green-400 text-white shadow-lg scale-105"
                        : "bg-red-400 text-white shadow-lg scale-105"
                      : answered &&
                          option.id === question.correctAnswer &&
                          !isCorrect
                        ? "bg-green-400 text-white shadow-lg"
                        : "bg-white text-gray-900 hover:shadow-md disabled:opacity-50"
                  }`}
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-all"
                    style={{
                      border:
                        selectedOption === option.id
                          ? "1.6px solid rgba(255, 255, 255, 1)"
                          : "1.6px solid rgba(179, 226, 255, 1)",
                      backgroundColor:
                        selectedOption === option.id
                          ? isCorrect
                            ? "rgb(34, 197, 94)"
                            : "rgb(239, 68, 68)"
                          : answered &&
                              option.id === question.correctAnswer &&
                              !isCorrect
                            ? "rgb(34, 197, 94)"
                            : "rgb(255, 255, 255)",
                    }}
                  >
                    {(selectedOption === option.id ||
                      (answered &&
                        option.id === question.correctAnswer &&
                        !isCorrect)) && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span style={{ whiteSpace: "pre-wrap" }}>{option.text}</span>
                </motion.button>
              ))}
            </div>

            {/* Next Button */}
            {answered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onNext}
                onMouseEnter={() => {
                  setNextButtonHovered(true);
                  playNextButtonSound();
                }}
                onMouseLeave={() => setNextButtonHovered(false)}
                whileHover={{ scale: 1.05, transition: { duration: 0.05 } }}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all mt-8"
              >
                Next →
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
