import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@shared/types";
import ConversaQuestion from "../questions/ConversaQuestion";
import FillgapQuestion from "../questions/FillgapQuestion";
import OrderingQuestion from "../questions/OrderingQuestion";
import HeadliningQuestion from "../questions/HeadliningQuestion";
import ComprehensionQuestion from "../questions/ComprehensionQuestion";
import ListeningQuestion from "../questions/ListeningQuestion";
import ProgressBar, { type SegmentProgressData } from "./ProgressBar";
import ResultsScreen from "./ResultsScreen";
import FeedbackBadge from "./FeedbackBadge";
import { useAudio } from "@/hooks/useAudio";

const NEW_QUESTION_SFX = "https://cdn.builder.io/o/assets%2F2ce37a7c12ec46698eaf81cb74a09ee3%2F483028a6852f48fdb389b7e61dfce166?alt=media&token=edd10ecf-1253-4b7b-8583-3a0edb614c87&apiKey=2ce37a7c12ec46698eaf81cb74a09ee3";

interface QuizPart {
  id: string;
  name: string;
  startQuestion: number;
  endQuestion: number;
}

interface QuizContainerProps {
  questions: Question[];
  quizParts: QuizPart[];
  quizTitle?: string;
}

interface QuizResult {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
}

interface FeedbackState {
  isShowing: boolean;
  isCorrect: boolean;
  correctAnswer?: string;
}

export default function QuizContainer({
  questions,
  quizParts,
  quizTitle = "Quiz",
}: QuizContainerProps) {
  const { playAudio } = useAudio(NEW_QUESTION_SFX);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    isShowing: false,
    isCorrect: false,
  });

  // Play notification sound when a new question appears (but not on initial load)
  useEffect(() => {
    if (currentQuestionIndex > 0) {
      playAudio();
    }
  }, [currentQuestionIndex, playAudio]);

  // Use quiz parts as segments, dynamically filtering based on questions present
  const segments = useMemo(() => {
    return quizParts.filter((part) => {
      return questions.some(
        (q) => q.number >= part.startQuestion && q.number <= part.endQuestion
      );
    });
  }, [quizParts, questions]);

  // Function to get which part a question belongs to
  const getPartForQuestion = (question: Question) => {
    return segments.find(
      (part) =>
        question.number >= part.startQuestion &&
        question.number <= part.endQuestion,
    );
  };

  // Calculate segment progress data
  const segmentProgressData = useMemo((): SegmentProgressData[] => {
    return segments.map((part) => {
      const questionsInSegment = questions.filter(
        (q) =>
          q.number >= part.startQuestion &&
          q.number <= part.endQuestion,
      );

      // For tracking completed questions, deduplicate by main question ID
      // (this handles comprehension questions that may have multiple sub-answers)
      const completedQuestionIds = new Set<string>();
      results.forEach((r) => {
        const question = questions.find((q) => q.id === r.questionId);
        if (
          question &&
          question.number >= part.startQuestion &&
          question.number <= part.endQuestion
        ) {
          // Use the main question ID (e.g., q30 instead of q30-1)
          completedQuestionIds.add(question.id);
        }
      });

      const currentQuestion = questions[currentQuestionIndex];
      const isCurrent =
        currentQuestion.number >= part.startQuestion &&
        currentQuestion.number <= part.endQuestion;

      return {
        id: part.id,
        name: part.name,
        totalTasks: questionsInSegment.length,
        completedTasks: completedQuestionIds.size,
        isCurrent,
      };
    });
  }, [currentQuestionIndex, results, questions, segments]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmitAnswer = (answer: string | string[] | { answer: string; isCorrect: boolean }) => {
    let isCorrect = false;
    let answerValue: string | string[];

    // Handle comprehension questions that pass {answer, isCorrect}
    if (typeof answer === "object" && "answer" in answer && "isCorrect" in answer) {
      isCorrect = answer.isCorrect;
      answerValue = answer.answer;
    } else {
      answerValue = answer;
      isCorrect =
        typeof answer === "string"
          ? answer === currentQuestion.correctAnswer
          : JSON.stringify(answer) ===
            JSON.stringify(currentQuestion.correctAnswer);
    }

    setResults((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        userAnswer: answerValue,
        isCorrect,
      },
    ]);

    // Show feedback
    let correctAnswerText: string | undefined;
    if (!isCorrect && currentQuestion.options && currentQuestion.options.length > 0) {
      const correctOpt = currentQuestion.options.find(
        (opt) => opt.id === currentQuestion.correctAnswer,
      );
      correctAnswerText = correctOpt?.text;
    }

    setFeedback({
      isShowing: true,
      isCorrect,
      correctAnswer: correctAnswerText,
    });
  };

  const handleNextQuestion = () => {
    setFeedback({
      isShowing: false,
      isCorrect: false,
    });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setResults([]);
    setIsQuizComplete(false);
    setFeedback({
      isShowing: false,
      isCorrect: false,
    });
  };

  if (isQuizComplete) {
    return (
      <ResultsScreen
        results={results}
        totalQuestions={questions.length}
        quizTitle={quizTitle}
        onRestart={handleRestart}
      />
    );
  }

  const getQuestionComponent = (question: Question) => {
    const onBackHandler = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
        setFeedback({
          isShowing: false,
          isCorrect: false,
        });
      }
    };

    const onClearFeedbackHandler = () => {
      setFeedback({
        isShowing: false,
        isCorrect: false,
      });
    };

    const commonProps = {
      question,
      onSubmit: handleSubmitAnswer,
      onBack: onBackHandler,
      onNext: handleNextQuestion,
      isAnswered: feedback.isShowing,
    };

    switch (question.type) {
      case "conversa":
        return <ConversaQuestion {...commonProps} />;
      case "fillgap":
        return <FillgapQuestion {...commonProps} />;
      case "ordering":
        return <OrderingQuestion {...commonProps} />;
      case "headlining":
        return <HeadliningQuestion {...commonProps} />;
      case "comprehen":
        return (
          <ComprehensionQuestion
            {...(commonProps as any)}
            onClearFeedback={onClearFeedbackHandler}
          />
        );
      case "listening":
        return <ListeningQuestion {...(commonProps as any)} />;
      default:
        return <div>Unknown question type</div>;
    }
  };

  const showBackgroundLayer = currentQuestion.number >= 28;

  return (
    <>
      {/* White background layer with gradient fade - appears from q32 (Headlining) onwards */}
      <AnimatePresence mode="wait">
        {showBackgroundLayer && (
          <motion.div
            key="background-layer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed inset-0 pointer-events-none"
            style={{
              background: "white",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15), inset 0 0 40px rgba(0, 0, 0, 0.05)",
              maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0.3))",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0.3))",
              zIndex: 5,
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <ProgressBar segmentProgressData={segmentProgressData} />

        {/* Feedback message - positioned in center of space between progress bar and main content */}
        <AnimatePresence>
          {feedback.isShowing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed top-8 left-0 right-0 flex justify-center z-40 pointer-events-none"
            >
              <FeedbackBadge
                type={feedback.isCorrect ? "success" : "error"}
                message={
                  feedback.isCorrect
                    ? "Correct! 🎉"
                    : "Incorrect, try again."
                }
                correctAnswer={feedback.correctAnswer}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main question content */}
        <div key={currentQuestion.id}>
          {getQuestionComponent(currentQuestion)}
        </div>
      </div>
    </>
  );
}
