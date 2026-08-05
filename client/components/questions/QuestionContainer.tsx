import { useState } from "react";
import type { Question, QuestionState } from "@shared/types";
import { QuestionComponentMap } from "./QuestionComponentMap";

interface QuestionContainerProps {
  initialQuestion: Question;
  onBack?: () => void;
  onAnswerSubmit?: (question: Question, answer: string | string[]) => void;
}

export default function QuestionContainer({
  initialQuestion,
  onBack,
  onAnswerSubmit,
}: QuestionContainerProps) {
  const [questionState, setQuestionState] = useState<QuestionState>({
    currentQuestion: initialQuestion,
    selectedAnswer: null,
    isAnswered: false,
  });

  const handleAnswerSubmit = (answer: string | string[]) => {
    setQuestionState((prev) => ({
      ...prev,
      selectedAnswer: answer,
      isAnswered: true,
    }));

    if (onAnswerSubmit) {
      onAnswerSubmit(questionState.currentQuestion, answer);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Get the appropriate component based on question type
  const QuestionComponent =
    QuestionComponentMap[questionState.currentQuestion.type];

  if (!QuestionComponent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">
          Unknown question type: {questionState.currentQuestion.type}
        </p>
      </div>
    );
  }

  return (
    <QuestionComponent
      question={questionState.currentQuestion}
      onBack={handleBack}
      onSubmit={handleAnswerSubmit}
    />
  );
}
