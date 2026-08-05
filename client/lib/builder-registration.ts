// This module registers quiz components with Builder.io
// To use in your Builder.io project, import and call registerBuilderComponents()

// Note: Builder.io SDK needs to be added via their integration
// This is a template for registering components once Builder SDK is available

declare global {
  interface Window {
    builder?: any;
  }
}

export function registerBuilderComponents() {
  const builder = window.builder;

  if (!builder) {
    console.warn(
      "Builder SDK not found. Please ensure @builder.io/react is installed and initialized.",
    );
    return;
  }

  // Register ConversaQuestion component
  builder.registerComponent(
    () => import("../components/questions/ConversaQuestion").then(m => m.default),
    {
      name: "ConversaQuestion",
      displayName: "Conversa Question (Multiple Choice)",
      description: "Multiple choice conversation question with animated emoji support. Renders WebM videos from question_emoji_path and response_emoji_path fields.",
      inputs: [
        {
          name: "question",
          type: "object",
          required: true,
          description: "Question object including: id, type, content, options, correctAnswer, question_emoji_path, response_emoji_path, vocab, and localized explanations",
        },
        {
          name: "onBack",
          type: "function",
          description: "Callback when back button is clicked",
        },
        {
          name: "onSubmit",
          type: "function",
          description: "Callback when answer is submitted with selected option ID",
        },
        {
          name: "onNext",
          type: "function",
          description: "Callback when next button is clicked to move to next question",
        },
        {
          name: "isAnswered",
          type: "boolean",
          description: "Whether the question has been answered",
        },
      ],
    },
  );

  // Register FillgapQuestion component
  builder.registerComponent(
    () => import("../components/questions/FillgapQuestion").then(m => m.default),
    {
      name: "FillgapQuestion",
      displayName: "Fill Gap Question",
      description: "Fill in the blank question with dropdown options",
      inputs: [
        {
          name: "question",
          type: "object",
          required: true,
          description: "Question object with id, type, content, options, and correctAnswer",
        },
        {
          name: "onBack",
          type: "function",
          description: "Callback when back button is clicked",
        },
        {
          name: "onSubmit",
          type: "function",
          description: "Callback when answer is submitted",
        },
        {
          name: "onCorrect",
          type: "function",
          description: "Callback when correct answer is selected",
        },
      ],
    },
  );

  // Register OrderingQuestion component
  builder.registerComponent(
    () => import("../components/questions/OrderingQuestion").then(m => m.default),
    {
      name: "OrderingQuestion",
      displayName: "Ordering Question",
      description: "Drag and drop question to order items correctly",
      inputs: [
        {
          name: "question",
          type: "object",
          required: true,
          description: "Question object with id, type, content, options, and correctAnswer",
        },
        {
          name: "onBack",
          type: "function",
          description: "Callback when back button is clicked",
        },
        {
          name: "onSubmit",
          type: "function",
          description: "Callback when answer is submitted",
        },
        {
          name: "onCorrect",
          type: "function",
          description: "Callback when correct answer order is submitted",
        },
      ],
    },
  );

  // Register QuizContainer component
  builder.registerComponent(
    () => import("../components/quiz/QuizContainer").then(m => m.default),
    {
      name: "QuizContainer",
      displayName: "Quiz Container",
      description: "Full quiz container with multiple questions, progress bar, and results screen",
      inputs: [
        {
          name: "questions",
          type: "array",
          required: true,
          description: "Array of question objects",
        },
        {
          name: "quizTitle",
          type: "string",
          description: "Title of the quiz",
        },
      ],
    },
  );

  // Register ProgressBar component
  builder.registerComponent(
    () => import("../components/quiz/ProgressBar").then(m => m.default),
    {
      name: "ProgressBar",
      displayName: "Quiz Progress Bar",
      description: "Animated progress bar for quiz progress",
      inputs: [
        {
          name: "currentQuestion",
          type: "number",
          required: true,
          description: "Current question number (1-indexed)",
        },
        {
          name: "totalQuestions",
          type: "number",
          required: true,
          description: "Total number of questions",
        },
      ],
    },
  );

  // Register ResultsScreen component
  builder.registerComponent(
    () => import("../components/quiz/ResultsScreen").then(m => m.default),
    {
      name: "ResultsScreen",
      displayName: "Quiz Results Screen",
      description: "Results screen showing final score and breakdown",
      inputs: [
        {
          name: "results",
          type: "array",
          required: true,
          description: "Array of quiz results",
        },
        {
          name: "totalQuestions",
          type: "number",
          required: true,
          description: "Total number of questions",
        },
        {
          name: "quizTitle",
          type: "string",
          description: "Title of the quiz",
        },
        {
          name: "onRestart",
          type: "function",
          description: "Callback when restart button is clicked",
        },
      ],
    },
  );

  // Register HeadliningQuestion component
  builder.registerComponent(
    () => import("../components/questions/HeadliningQuestion").then(m => m.default),
    {
      name: "HeadliningQuestion",
      displayName: "Headlining Question",
      description: "Select the best headline for a paragraph (2-column layout)",
      inputs: [
        {
          name: "question",
          type: "object",
          required: true,
          description: "Question object with paragraph and 3 headline options",
        },
        {
          name: "onBack",
          type: "function",
          description: "Callback when back button is clicked",
        },
        {
          name: "onSubmit",
          type: "function",
          description: "Callback when answer is submitted",
        },
        {
          name: "onCorrect",
          type: "function",
          description: "Callback when correct answer is selected",
        },
      ],
    },
  );

  // Register ComprehensionQuestion component
  builder.registerComponent(
    () => import("../components/questions/ComprehensionQuestion").then(m => m.default),
    {
      name: "ComprehensionQuestion",
      displayName: "Comprehension Question",
      description: "Reading comprehension with multiple questions sharing same paragraph",
      inputs: [
        {
          name: "question",
          type: "object",
          required: true,
          description: "Question object with paragraph and array of questions",
        },
        {
          name: "onBack",
          type: "function",
          description: "Callback when back button is clicked",
        },
        {
          name: "onSubmit",
          type: "function",
          description: "Callback when answer is submitted",
        },
        {
          name: "onCorrect",
          type: "function",
          description: "Callback when correct answer is selected",
        },
      ],
    },
  );

  // Register ListeningQuestion component
  builder.registerComponent(
    () => import("../components/questions/ListeningQuestion").then(m => m.default),
    {
      name: "ListeningQuestion",
      displayName: "Listening Question",
      description: "Listening comprehension with audio playback",
      inputs: [
        {
          name: "question",
          type: "object",
          required: true,
          description: "Question object with audioUrl and 3 options",
        },
        {
          name: "onBack",
          type: "function",
          description: "Callback when back button is clicked",
        },
        {
          name: "onSubmit",
          type: "function",
          description: "Callback when answer is submitted",
        },
        {
          name: "onCorrect",
          type: "function",
          description: "Callback when correct answer is selected",
        },
      ],
    },
  );

  console.log("Quiz components registered with Builder.io successfully!");
}
