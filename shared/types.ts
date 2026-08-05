export type QuestionType =
  | "conversa"
  | "fillgap"
  | "multiple-choice"
  | "matching"
  | "ordering"
  | "headlining"
  | "comprehen"
  | "listening";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface HighlightSentence {
  id: string;
  text: string;
}

export interface QuestionContent {
  part1?: string;
  part2?: string;
  text?: string;
  instruction?: string;
  highlightSentences?: HighlightSentence[];
}

export interface OrderableOption extends QuestionOption {
  order: number;
}

export interface VocabularyItem {
  word: string;
  definition: string;
}

export interface Question {
  id: string;
  number: number;
  type: QuestionType;
  icon1_path?: string;
  icon2_path?: string;
  question_emoji_path?: string;
  response_emoji_path?: string;
  content: QuestionContent;
  options: QuestionOption[];
  correctAnswer: string | string[];
  title?: string;
  explanation?: string;
  spanish?: string;
  indonesian?: string;
  thai?: string;
  vocab?: VocabularyItem[];
}

export interface QuestionState {
  currentQuestion: Question;
  selectedAnswer: string | string[] | null;
  isAnswered: boolean;
}
