import { useState, useEffect } from "react";
import type { Question } from "@shared/types";
import QuizContainer from "@/components/quiz/QuizContainer";
import HomeScreen from "@/components/HomeScreen";

interface QuizPart {
  id: string;
  name: string;
  startQuestion: number;
  endQuestion: number;
}

export default function Index() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizParts, setQuizParts] = useState<QuizPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/questions.json");
        if (!response.ok) {
          throw new Error("Failed to load questions");
        }
        const data = await response.json();
        // Get the first quiz from the questions.json file
        const quiz = data.quizzes[0];
        // Sort questions by number to ensure correct order
        const sortedQuestions = [...quiz.questions].sort((a, b) => a.number - b.number);
        setQuestions(sortedQuestions);
        setQuizParts(quiz.parts);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load questions",
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "rgb(0, 177, 64)",
        }}
      >
        <div className="text-white text-xl font-semibold">
          Loading questions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background: "rgb(0, 177, 64)",
        }}
      >
        <div className="text-white text-xl font-semibold">
          Lỗi: {error}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background: "rgb(0, 177, 64)",
        }}
      >
        <div className="text-white text-xl font-semibold">
          No questions to display
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return <HomeScreen onStart={() => setQuizStarted(true)} />;
  }

  return (
    <QuizContainer
      questions={questions}
      quizParts={quizParts}
      quizTitle="Grammar and Vocabulary"
    />
  );
}
