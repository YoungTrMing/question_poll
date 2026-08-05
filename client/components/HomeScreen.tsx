import { useState } from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

interface HomeScreenProps {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  const { language, setLanguage } = useLanguage();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const languages: Array<{ code: Language; label: string; flag: string }> = [
    { code: "english", label: "English", flag: "🇬🇧" },
    { code: "spanish", label: "Español", flag: "🇪🇸" },
    { code: "indonesian", label: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "thai", label: "ไทย", flag: "🇹🇭" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: "rgb(0, 177, 64)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Card Container */}
        <div
          className="rounded-3xl overflow-hidden"
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
            className="px-8 py-12 space-y-8"
          >
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-3"
            >
              <h1 className="text-4xl font-bold text-white">
                English Test
              </h1>
              <p className="text-purple-200 text-lg">
                Complete English Proficiency Test
              </p>
            </motion.div>

            {/* Language Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <label className="block text-white text-sm font-semibold flex items-center gap-2">
                <Globe size={18} />
                Select Language for Explanations
              </label>

              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 font-medium flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{currentLanguage?.flag}</span>
                    {currentLanguage?.label}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      isLanguageOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {/* Language Dropdown */}
                {isLanguageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-10 overflow-hidden"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left font-medium flex items-center gap-2 transition-colors ${
                          language === lang.code
                            ? "bg-blue-100 text-blue-900"
                            : "text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span>{lang.label}</span>
                        {language === lang.code && (
                          <svg
                            className="w-5 h-5 ml-auto text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Start Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={onStart}
              className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:shadow-lg"
              style={{
                background: "linear-gradient(to right, rgb(59, 130, 246), rgb(37, 99, 235))",
              }}
            >
              Start Quiz →
            </motion.button>

            {/* Test Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-6 border-t border-purple-400 space-y-2 text-sm text-purple-200"
            >
              <p>✓ 29 questions total</p>
              <p>✓ 4 different question types</p>
              <p>✓ Get instant feedback</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
