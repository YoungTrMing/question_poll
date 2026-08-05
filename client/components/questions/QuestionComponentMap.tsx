import type { QuestionType } from "@shared/types";
import ConversaQuestion from "./ConversaQuestion";
import FillgapQuestion from "./FillgapQuestion";
import OrderingQuestion from "./OrderingQuestion";
import HeadliningQuestion from "./HeadliningQuestion";
import ComprehensionQuestion from "./ComprehensionQuestion";
import ListeningQuestion from "./ListeningQuestion";

export const QuestionComponentMap: Record<
  QuestionType,
  React.ComponentType<any>
> = {
  conversa: ConversaQuestion,
  fillgap: FillgapQuestion,
  ordering: OrderingQuestion,
  headlining: HeadliningQuestion,
  comprehen: ComprehensionQuestion,
  listening: ListeningQuestion,
  "multiple-choice": ConversaQuestion, // Placeholder - will be replaced with actual component
  matching: ConversaQuestion, // Placeholder
};
