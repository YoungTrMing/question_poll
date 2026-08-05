import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { Question, QuestionOption } from "@shared/types";
import { useAudio } from "@/hooks/useAudio";
import VocabularyDialog from "./VocabularyDialog";
import DictionaryIconButton from "./DictionaryIconButton";
import HighlightText from "./HighlightText";
import AircraftSentenceOrderDialog from "./AircraftSentenceOrderDialog";

const ITEMS_PER_PAGE_VERTICAL = 4;

const CORRECT_ANSWER_SFX = "https://cdn.builder.io/o/assets%2F2ce37a7c12ec46698eaf81cb74a09ee3%2Fe3747e7f6d3e4e948c5702aa63445231?alt=media&token=f0e72b36-51ab-4f9b-bbc9-f534a83aa0f5&apiKey=2ce37a7c12ec46698eaf81cb74a09ee3";
const POP_SFX = "https://cdn.builder.io/o/assets%2F2ce37a7c12ec46698eaf81cb74a09ee3%2F1a62ef73957b4703bcb3d13b81d8ae56?alt=media&token=004caec4-1b3c-4978-95e2-fb826637c25b&apiKey=2ce37a7c12ec46698eaf81cb74a09ee3";
const PLACE_SFX = "https://cdn.builder.io/o/assets%2F2ce37a7c12ec46698eaf81cb74a09ee3%2F89d85c16f37140629d1ee53af3af0ae3?alt=media&token=169bd82b-ffcf-4c8b-89ef-6d6ffdca24ec&apiKey=2ce37a7c12ec46698eaf81cb74a09ee3";
const NEXT_BUTTON_SFX = "https://cdn.builder.io/o/assets%2F2ce37a7c12ec46698eaf81cb74a09ee3%2Fd91c083582af48d1867923deecc61fb4?alt=media&token=be87d929-8569-4a5d-9744-6733b5ff9cc6&apiKey=2ce37a7c12ec46698eaf81cb74a09ee3";

interface OrderingQuestionProps {
  question: Question;
  onBack?: () => void;
  onSubmit?: (answer: string[]) => void;
  onNext?: () => void;
  isAnswered?: boolean;
}

export default function OrderingQuestion({
  question,
  onBack,
  onSubmit,
  onNext,
  isAnswered = false,
}: OrderingQuestionProps) {
  const { playAudio: playCorrectSound } = useAudio(CORRECT_ANSWER_SFX);
  const { playAudio: playPopSound } = useAudio(POP_SFX);
  const { playAudio: playPlaceSound } = useAudio(PLACE_SFX);
  const { playAudio: playNextButtonSound } = useAudio(NEXT_BUTTON_SFX);
  const [orderedOptions, setOrderedOptions] = useState<QuestionOption[]>(
    question.options.length > 0
      ? [...question.options]
      : [],
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [nextButtonHovered, setNextButtonHovered] = useState(false);
  const [isVocabDialogOpen, setIsVocabDialogOpen] = useState(false);
  const [isDictIconVisible, setIsDictIconVisible] = useState(true);
  const [currentVocabPage, setCurrentVocabPage] = useState(0);
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);

  // placedSentences / userValidatedSlots chỉ chứa những ô ĐÃ ĐƯỢC "TIẾT LỘ" (revealed) cho
  // hộp thoại Aircraft — nghĩa là ô đó đã từng được xác nhận đúng qua một thao tác kéo cụ thể.
  // Một khi đã revealed thì giữ nguyên vĩnh viễn cho tới khi đổi câu hỏi, kể cả khi người dùng
  // kéo lại làm xáo trộn thứ tự sau đó (không "thu hồi" lại kết quả đã đúng).
  const [placedSentences, setPlacedSentences] = useState<(string | null)[]>([null, null, null]);
  const [userValidatedSlots, setUserValidatedSlots] = useState<boolean[]>([false, false, false]);

  // Dialog Aircraft chỉ được phép xuất hiện sau khi người dùng đã thực hiện thao tác kéo đầu tiên.
  const [hasDragged, setHasDragged] = useState(false);

  const hasVocab = question.vocab && question.vocab.length > 0;

  // Reset toàn bộ trạng thái khi chuyển sang câu hỏi mới
  useEffect(() => {
    setOrderedOptions(question.options.length > 0 ? [...question.options] : []);
    setPlacedSentences([null, null, null]);
    setUserValidatedSlots([false, false, false]);
    setHasDragged(false);
    setAnswered(false);
    setIsCorrect(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setHighlightedWords([]);
  }, [question.id]);

  useEffect(() => {
    if (isCorrect === true) {
      playCorrectSound();
    }
  }, [isCorrect, playCorrectSound]);

  useEffect(() => {
    if (isVocabDialogOpen && question.vocab) {
      const startIndex = 0;
      const endIndex = (currentVocabPage + 1) * ITEMS_PER_PAGE_VERTICAL;
      const currentWindowWords = question.vocab.slice(startIndex, endIndex).map(v => v.word);
      setHighlightedWords(prev => Array.from(new Set([...prev, ...currentWindowWords])));
    }
  }, [currentVocabPage, isVocabDialogOpen, question.vocab]);

  const handleDragStart = (index: number) => {
    if (!answered) {
      setDraggedIndex(index);
      playPopSound();
      // Dialog xuất hiện ngay khi người dùng bắt đầu thao tác kéo đầu tiên
      if (!hasDragged) {
        setHasDragged(true);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index || answered)
      return;

    setDragOverIndex(index);
    const newOptions = [...orderedOptions];
    const draggedItem = newOptions[draggedIndex];
    newOptions.splice(draggedIndex, 1);
    newOptions.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setOrderedOptions(newOptions);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    playPlaceSound();

    // So sánh thứ tự hiện tại với đáp án đúng, theo TỪNG Ô một
    const correctAnswer = question.correctAnswer;
    const correctnessNow = orderedOptions.map(
      (opt, i) => opt?.id === correctAnswer[i]
    );

    const nextRevealed = [...userValidatedSlots];
    const nextTexts = [...placedSentences];

    // Mỗi thao tác kéo chỉ được "tiết lộ" TỐI ĐA MỘT ô mới đúng — chọn ô có index nhỏ nhất
    // trong số các ô vừa đúng mà chưa từng được tiết lộ trước đó.
    const candidateIndex = correctnessNow.findIndex(
      (isCorrectSlot, i) => isCorrectSlot && !nextRevealed[i]
    );

    if (candidateIndex !== -1) {
      nextRevealed[candidateIndex] = true;
      const revealedOption = question.options.find(o => o.id === correctAnswer[candidateIndex]);
      nextTexts[candidateIndex] = revealedOption?.text ?? null;
    }

    // Nếu sau bước trên chỉ còn đúng 1 ô chưa được tiết lộ, và ô đó đang đúng vị trí (điều này
    // luôn đúng về mặt toán học khi 2/3 ô đã khớp đáp án — ô còn lại bị "ép buộc" đúng theo),
    // thì tự động tiết lộ luôn ô cuối cùng mà không cần chờ thêm thao tác kéo nào nữa.
    const revealedCount = nextRevealed.filter(Boolean).length;
    if (revealedCount === nextRevealed.length - 1) {
      nextRevealed.forEach((isRevealed, i) => {
        if (!isRevealed && correctnessNow[i]) {
          nextRevealed[i] = true;
          const forcedOption = question.options.find(o => o.id === correctAnswer[i]);
          nextTexts[i] = forcedOption?.text ?? null;
        }
      });
    }

    setUserValidatedSlots(nextRevealed);
    setPlacedSentences(nextTexts);
  };

  const handleSubmit = () => {
    const answer = orderedOptions.map((opt) => opt.id);
    const correct =
      JSON.stringify(answer) ===
      JSON.stringify(question.correctAnswer);

    setAnswered(true);
    setIsCorrect(correct);

    if (onSubmit) {
      onSubmit(answer);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 relative"
      style={{
        background: "rgb(0, 177, 64)",
      }}
    >
      {/* Aircraft Sentence Order Dialog — chỉ hiện sau khi người dùng đã kéo lần đầu */}
      <AircraftSentenceOrderDialog
        isVisible={hasDragged}
        questionText={question.content.text || question.content.instruction || "Arrange the sentences in the correct order."}
        placedSentences={placedSentences}
        userValidatedSlots={userValidatedSlots}
      />
      <div
        style={{
          position: "relative",
          display: "inline-block",
        }}
      >
        {hasVocab && (
          <>
            <DictionaryIconButton
              onClick={() => {
                setIsVocabDialogOpen(true);
                setIsDictIconVisible(false);
              }}
              isVisible={isDictIconVisible}
            />
            <VocabularyDialog
              vocab={question.vocab!}
              isOpen={isVocabDialogOpen}
              onClose={() => setIsVocabDialogOpen(false)}
              onDictIconShow={() => setIsDictIconVisible(true)}
              onPageChange={(page) => setCurrentVocabPage(page)}
            />
          </>
        )}

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
                {question.title || "Sentence Ordering"}
              </h1>
              <div className="w-7" />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 space-y-6">
            {/* Question Text */}
            <div className="bg-white rounded-xl px-5 py-4 text-gray-900 shadow-md">
              <p
                style={{
                  fontSize: "17px",
                  fontWeight: "500",
                  lineHeight: "23px",
                  whiteSpace: "pre-wrap",
                }}
                className="leading-relaxed"
              >
                {hasVocab && highlightedWords.length > 0 ? (
                  <HighlightText
                    text={question.content.text ||
                      question.content.instruction ||
                      "Arrange the sentences in the correct order."}
                    activeWords={highlightedWords}
                  />
                ) : (
                  question.content.text ||
                  question.content.instruction ||
                  "Arrange the sentences in the correct order."
                )}
              </p>
            </div>

            {/* Draggable Options */}
            <div className="space-y-3 mt-10">
              <p className="text-white text-xs font-semibold px-2 mb-3">
                Drag to reorder:
              </p>
              {orderedOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    y: answered ? 0 : 0,
                    scale: draggedIndex === index ? 1.05 : 1,
                    opacity: draggedIndex === index ? 0.8 : 1,
                    boxShadow: draggedIndex === index
                      ? "0 20px 40px rgba(0, 0, 0, 0.4)"
                      : dragOverIndex === index
                        ? "0 10px 20px rgba(59, 130, 246, 0.3)"
                        : "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                  transition={
                    draggedIndex === index
                      ? { type: "spring", stiffness: 300, damping: 30, mass: 0.5 }
                      : { delay: index * 0.1 }
                  }
                  draggable={!answered}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDragEnd={handleDragEnd}
                  className={`w-full px-5 py-4 rounded-xl font-medium text-base cursor-move border-2 ${
                    draggedIndex === index
                      ? "bg-white text-gray-900 border-blue-500"
                      : dragOverIndex === index
                        ? "bg-blue-50 text-gray-900 border-blue-400"
                        : "bg-white text-gray-900 border-transparent hover:border-blue-200 hover:shadow-md"
                  } ${answered ? "cursor-not-allowed opacity-75 border-gray-300" : ""}`}
                  style={{
                    touchAction: "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold transition-all ${
                        draggedIndex === index ? "scale-90" : ""
                      }`}
                      style={{
                        backgroundColor:
                          draggedIndex === index
                            ? "rgb(96, 165, 250)"
                            : dragOverIndex === index
                              ? "rgb(147, 197, 253)"
                              : "rgb(59, 130, 246)",
                        color: "white",
                        fontSize: "12px",
                      }}
                    >
                      {index + 1}
                    </div>
                    <span className="flex-1" style={{ whiteSpace: "pre-wrap" }}>
                      {hasVocab && highlightedWords.length > 0 ? (
                        <HighlightText text={option.text} activeWords={highlightedWords} />
                      ) : (
                        option.text
                      )}
                    </span>
                    {!answered && (
                      <motion.div
                        className="text-gray-400 text-lg"
                        style={{ cursor: "grab" }}
                        animate={{
                          scale: draggedIndex === index ? 0.8 : 1,
                          opacity: draggedIndex === index ? 0.3 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        ⋮⋮
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Check Order / Next Button */}
            {!answered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleSubmit}
                className="w-full font-bold py-3 rounded-xl transition-all bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg"
                style={{ marginTop: "37px" }}
              >
                Check ✓&nbsp;
              </motion.button>
            )}

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
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
                style={{ marginTop: "36px" }}
              >
                Next →
              </motion.button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
