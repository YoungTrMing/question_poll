import { motion } from "framer-motion";
import { RotateCcw, Home } from "lucide-react";

interface QuizResult {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
}

interface ResultsScreenProps {
  results: QuizResult[];
  totalQuestions: number;
  quizTitle: string;
  onRestart?: () => void;
}

export default function ResultsScreen({
  results,
  totalQuestions,
  quizTitle,
  onRestart,
}: ResultsScreenProps) {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  const getPerformanceMessage = (score: number) => {
    if (score === 100) return "Excellent! You did perfectly!";
    if (score >= 80) return "Outstanding! You did very well!";
    if (score >= 60) return "Good! You're making progress.";
    if (score >= 40) return "You're on the right track.";
    return "Keep trying, you'll succeed!";
  };

  const getPerformanceEmoji = (score: number) => {
    if (score === 100) return "🏆";
    if (score >= 80) return "⭐";
    if (score >= 60) return "👍";
    if (score >= 40) return "💪";
    return "🎯";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
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
          <div className="px-6 py-8 text-center">
            <h1 className="text-white text-2xl font-bold mb-2">
              {quizTitle}
            </h1>
            <p className="text-purple-200 text-sm">Quiz Completed</p>
          </div>

          {/* Score Display */}
          <div className="px-6 py-8 space-y-6">
            {/* Performance Circle */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
            >
              <div
                className="w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl"
                style={{
                  background:
                    percentage >= 60
                      ? "linear-gradient(135deg, rgb(34, 197, 94), rgb(16, 185, 129))"
                      : "linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))",
                }}
              >
                <motion.div
                  className="text-5xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {percentage}%
                </motion.div>
                <motion.div
                  className="text-3xl mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {getPerformanceEmoji(percentage)}
                </motion.div>
              </div>
            </motion.div>

            {/* Performance Message */}
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl px-5 py-4 text-center text-white shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="font-semibold text-lg">
                {getPerformanceMessage(percentage)}
              </p>
            </motion.div>

            {/* Score Breakdown */}
            <motion.div
              className="bg-white rounded-xl px-5 py-5 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-semibold">
                  Correct Answers
                </span>
                <span className="text-green-600 font-bold text-xl">
                  {correctCount}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
              </div>
              <p className="text-gray-600 text-sm mt-3 text-center">
                {correctCount} / {totalQuestions} questions
              </p>
            </motion.div>

            {/* Results List */}
            <motion.div
              className="bg-white rounded-xl px-4 py-4 shadow-md max-h-48 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-gray-700 font-semibold mb-3 text-sm">
                Details:
              </p>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={`${result.questionId}-${index}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                      result.isCorrect
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span className="font-bold">Question {index + 1}:</span>
                    <span className="flex-1">
                      {result.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="space-y-3 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <button
                onClick={onRestart}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
              >
                <RotateCcw size={20} />
                Retake Quiz
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 font-bold py-3 rounded-xl hover:shadow-md transition-all"
              >
                <Home size={20} />
                Home
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
