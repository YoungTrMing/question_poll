import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Question } from "@shared/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAudio } from "@/hooks/useAudio";
import VocabularyDialog from "./VocabularyDialog";
import DictionaryIconButton from "./DictionaryIconButton";
import LensIconButton from "./LensIconButton";
import HighlightText from "./HighlightText";

const ITEMS_PER_PAGE_HORIZONTAL = 3;

const CORRECT_ANSWER_SFX = "https://cdn.builder.io/o/assets%2F2ce37a7c12ec46698eaf81cb74a09ee3%2Fe3747e7f6d3e4e948c5702aa63445231?alt=media&token=f0e72b36-51ab-4f9b-bbc9-f534a83aa0f5&apiKey=2ce37a7c12ec46698eaf81cb74a09ee3";
const NEXT_BUTTON_SFX = "https://cdn.builder.io/o/assets%2F2ce37a7c12ec46698eaf81cb74a09ee3%2Fd91c083582af48d1867923deecc61fb4?alt=media&token=be87d929-8569-4a5d-9744-6733b5ff9cc6&apiKey=2ce37a7c12ec46698eaf81cb74a09ee3";
const OPTION_HOVER_SFX = "https://cdn.builder.io/o/assets%2F2ce37a7c12ec46698eaf81cb74a09ee3%2Fcef735b4fc354b22af0ec3faf71180a8?alt=media&token=b842c79f-d014-4d4f-8909-d96ae573a231&apiKey=2ce37a7c12ec46698eaf81cb74a09ee3";
const LENS_OPEN_SFX = "/sounds/turn-page.mp3";
const LENS_DIRECTION_SFX = "/sounds/skip.mp3";
const LENS_CLOSE_SWEEP_SFX = "/sounds/highlight.mp3";

// Pattern nét đứt dạng SVG dùng cho background
const REASON_DASHED_PATTERN = `url("data:image/svg+xml,%3Csvg width='100%25' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='31' x2='100%25' y2='31' stroke='%23cbd5e1' stroke-width='1.5' stroke-dasharray='6 4'/%3E%3C/svg%3E")`;
const REASON_EMPTY_PATTERN = `url("data:image/svg+xml,%3Csvg width='100%25' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='31' x2='100%25' y2='31' stroke='%23e5e7eb' stroke-width='1.5' stroke-dasharray='6 4'/%3E%3C/svg%3E")`;

interface ResolvedHighlight {
  id: string;
  text: string;
  start: number;
  end: number;
}

function normalizeForMatch(value: string): string {
  return value
    .replace(/[\u2018\u2019\u02BC\u201B]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00A0/g, " ");
}

function locateSentence(
  articleText: string,
  rawSentence: string,
  fromIndex: number,
): { start: number; end: number } | null {
  const sentence = rawSentence.trim();
  if (!sentence) return null;

  let idx = articleText.indexOf(sentence, fromIndex);
  if (idx !== -1) return { start: idx, end: idx + sentence.length };

  const normArticle = normalizeForMatch(articleText);
  const normSentence = normalizeForMatch(sentence);
  idx = normArticle.indexOf(normSentence, fromIndex);
  if (idx !== -1) return { start: idx, end: idx + normSentence.length };

  idx = normArticle.toLowerCase().indexOf(normSentence.toLowerCase(), fromIndex);
  if (idx !== -1) return { start: idx, end: idx + normSentence.length };

  return null;
}

function resolveHighlights(
  articleText: string,
  rawHighlights: NonNullable<Question["content"]["highlightSentences"]>,
): ResolvedHighlight[] {
  const resolved: ResolvedHighlight[] = [];
  let cursor = 0;
  for (const sentence of rawHighlights) {
    const loc = locateSentence(articleText, sentence.text, cursor);
    if (!loc) continue;
    resolved.push({
      id: sentence.id,
      text: articleText.slice(loc.start, loc.end),
      start: loc.start,
      end: loc.end,
    });
    cursor = loc.end;
  }
  return resolved;
}

const FOCUSED_FONT_STACK = "'Bodoni Moda', 'Times New Roman', Georgia, serif";
const SCENE_BLUR_FILTER = "blur(1px) brightness(0.68) contrast(0.9) saturate(0.8)";
const FOCUS_TRANSITION =
  "filter 1.3s cubic-bezier(0.22, 1, 0.36, 1), background 1.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 1.3s cubic-bezier(0.22, 1, 0.36, 1), color 1.3s cubic-bezier(0.22, 1, 0.36, 1), padding 1.3s cubic-bezier(0.22, 1, 0.36, 1), font-size 1s cubic-bezier(0.22, 1, 0.36, 1)";
const HIGHLIGHT_PADDING = "2px 5px";
const HIGHLIGHT_MARGIN = "0 -5px";

function useEditorialFontLoader() {
  useEffect(() => {
    if (document.getElementById("headlining-question-font")) return;
    const link = document.createElement("link");
    link.id = "headlining-question-font";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,700;0,800;1,700&display=swap";
    document.head.appendChild(link);
  }, []);
}

const FOCUSED_TEXT_COLOR = "rgb(76, 29, 149)";
const GLASS_BACKGROUND =
  "linear-gradient(135deg, rgba(216,180,254,0.45) 0%, rgba(191,169,255,0.28) 55%, rgba(165,180,252,0.22) 100%)";
const GLASS_SHADOW =
  "inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(124,58,237,0.15), 0 1px 8px rgba(124,58,237,0.22)";
const GLASS_CHAR_BACKGROUND = "rgba(191, 169, 255, 0.38)";
const GLASS_CHAR_SHADOW = "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(124,58,237,0.22)";

function SweepingGlassText({
  text,
  targetFont,
  targetColor,
  durationMs,
}: {
  text: string;
  targetFont: string;
  targetColor: string;
  durationMs: number;
}) {
  const chars = useMemo(() => Array.from(text), [text]);

  const groups = useMemo(() => {
    const list: { startIndex: number; chars: string[]; isSpace: boolean }[] = [];
    let i = 0;
    while (i < chars.length) {
      const isSpace = chars[i] === " ";
      let j = i + 1;
      while (j < chars.length && (chars[j] === " ") === isSpace) j++;
      list.push({ startIndex: i, chars: chars.slice(i, j), isSpace });
      i = j;
    }
    return list;
  }, [chars]);

  const [revealCount, setRevealCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min(1, (ts - start) / durationMs);
      setRevealCount(Math.round(progress * chars.length));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [chars.length, durationMs]);

  return (
    <span style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease" }}>
      {groups.map((group, gi) => {
        const content = group.chars.map((ch, k) => {
          const i = group.startIndex + k;
          const revealed = i < revealCount;
          return (
            <span
              key={i}
              style={{
                fontFamily: revealed ? targetFont : "inherit",
                fontWeight: revealed ? 800 : "inherit",
                color: revealed ? targetColor : "inherit",
                background: revealed ? GLASS_CHAR_BACKGROUND : "transparent",
                boxShadow: revealed ? GLASS_CHAR_SHADOW : "none",
                padding: "3px 0",
                transition: "color 0.5s ease, background 0.5s ease, box-shadow 0.5s ease",
              }}
            >
              {ch}
            </span>
          );
        });
        return group.isSpace ? (
          <span key={`g-${gi}`}>{content}</span>
        ) : (
          <span key={`g-${gi}`} style={{ whiteSpace: "nowrap" }}>
            {content}
          </span>
        );
      })}
    </span>
  );
}

const sweepDurationFor = (text: string) => Math.min(1600, Math.max(700, text.length * 14));

interface HighlightedParagraphProps {
  text: string;
  resolved: ResolvedHighlight[];
  activeWords: string[];
  lensActive: boolean;
  focusedId: string | null;
  revealedIds: Set<string>;
  finalizedIds: Set<string>;
  isFirst: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

function HighlightedParagraph({
  text,
  resolved,
  activeWords,
  lensActive,
  focusedId,
  revealedIds,
  finalizedIds,
  isFirst,
  onPrevious,
  onNext,
  onClose,
}: HighlightedParagraphProps) {
  useEditorialFontLoader();

  const sceneStyle: React.CSSProperties = {
    filter: lensActive ? SCENE_BLUR_FILTER : "none",
    transition: FOCUS_TRANSITION,
  };

  if (!resolved.length) {
    const content = activeWords.length > 0 ? <HighlightText text={text} activeWords={activeWords} /> : text;
    return <span style={sceneStyle}>{content}</span>;
  }

  const fragments: React.ReactNode[] = [];
  let cursor = 0;

  for (const item of resolved) {
    if (item.start > cursor) {
      fragments.push(
        <span key={`plain-${item.id}`} style={sceneStyle}>
          {text.slice(cursor, item.start)}
        </span>,
      );
    }

    const isFocused = lensActive && focusedId === item.id;
    const isRevealed = revealedIds.has(item.id);
    const isFinalized = finalizedIds.has(item.id);
    const sentenceNode =
      activeWords.length > 0 ? <HighlightText text={item.text} activeWords={activeWords} /> : item.text;

    if (isFocused || isFinalized) {
      const glassBoxStyle: React.CSSProperties = {
        fontFamily: FOCUSED_FONT_STACK,
        fontWeight: 800,
        letterSpacing: "0.01em",
        fontSize: "1.08em",
        lineHeight: 1.75,
        color: FOCUSED_TEXT_COLOR,
        padding: HIGHLIGHT_PADDING,
        margin: HIGHLIGHT_MARGIN,
        WebkitBoxDecorationBreak: "clone",
        boxDecorationBreak: "clone",
        borderRadius: 8,
        background: GLASS_BACKGROUND,
        boxShadow: GLASS_SHADOW,
        textShadow: "0 0 1px rgba(255,255,255,0.6)",
        filter: "none",
        transition: FOCUS_TRANSITION,
      };

      if (isFocused) {
        fragments.push(
          <span key={item.id} className="relative">
            <span
              role="button"
              tabIndex={0}
              onClick={onClose}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onClose();
              }}
              aria-label="In-focus sentence — activate to close the lens"
              className="cursor-pointer"
              style={glassBoxStyle}
            >
              {sentenceNode}
            </span>

            <span
              onClick={(e) => e.stopPropagation()}
              className="absolute inline-flex items-center"
              style={{ bottom: -22, right: -6, zIndex: 20, pointerEvents: "auto" }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevious();
                }}
                disabled={isFirst}
                aria-label="Previous highlight"
                className="flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110 disabled:opacity-30"
                style={{
                  border: "1px solid rgba(255,255,255,0.55)",
                  background: "rgba(255,255,255,0.5)",
                  color: "rgb(88,28,135)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                }}
              >
                <ChevronLeft size={14} strokeWidth={3} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                aria-label="Next highlight"
                className="flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110"
                style={{
                  border: "1px solid rgba(255,255,255,0.55)",
                  background: "rgba(255,255,255,0.5)",
                  color: "rgb(88,28,135)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                }}
              >
                <ChevronRight size={14} strokeWidth={3} />
              </button>
            </span>
          </span>,
        );
      } else if (activeWords.length > 0) {
        fragments.push(
          <span key={item.id} className="relative">
            <span style={glassBoxStyle}>{sentenceNode}</span>
          </span>,
        );
      } else {
        fragments.push(
          <span key={item.id} className="relative">
            <span style={{ fontSize: "1.08em", lineHeight: 1.75 }}>
              <SweepingGlassText
                text={item.text}
                targetFont={FOCUSED_FONT_STACK}
                targetColor={FOCUSED_TEXT_COLOR}
                durationMs={sweepDurationFor(item.text)}
              />
            </span>
          </span>,
        );
      }
    } else {
      fragments.push(
        <span key={item.id} className="relative">
          <span
            style={{
              fontWeight: isRevealed ? 700 : 400,
              padding: HIGHLIGHT_PADDING,
              margin: HIGHLIGHT_MARGIN,
              ...sceneStyle,
            }}
          >
            {sentenceNode}
          </span>
        </span>,
      );
    }

    cursor = item.end;
  }

  if (cursor < text.length) {
    fragments.push(
      <span key="plain-tail" style={sceneStyle}>
        {text.slice(cursor)}
      </span>,
    );
  }

  return <>{fragments}</>;
}

interface HeadliningQuestionProps {
  question: Question;
  onBack?: () => void;
  onSubmit?: (answer: string) => void;
  onNext?: () => void;
  isAnswered?: boolean;
}

export default function HeadliningQuestion({
  question,
  onBack,
  onSubmit,
  onNext,
  isAnswered = false,
}: HeadliningQuestionProps) {
  const { language } = useLanguage();
  const { playAudio } = useAudio(CORRECT_ANSWER_SFX);
  const { playAudio: playNextButtonSound } = useAudio(NEXT_BUTTON_SFX);
  const { playAudio: playOptionHoverSound } = useAudio(OPTION_HOVER_SFX);
  const { playAudio: playLensOpenSound } = useAudio(LENS_OPEN_SFX);
  const { playAudio: playLensDirectionSound } = useAudio(LENS_DIRECTION_SFX);
  const { playAudio: playLensCloseSweepSound } = useAudio(LENS_CLOSE_SWEEP_SFX);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [nextButtonHovered, setNextButtonHovered] = useState(false);
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);
  const [isVocabDialogOpen, setIsVocabDialogOpen] = useState(false);
  const [isDictIconVisible, setIsDictIconVisible] = useState(true);
  const [currentVocabPage, setCurrentVocabPage] = useState(0);
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
  const [isLensModeActive, setIsLensModeActive] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [revealedHighlightIds, setRevealedHighlightIds] = useState<Set<string>>(new Set());
  const [finalizedHighlightIds, setFinalizedHighlightIds] = useState<Set<string>>(new Set());
  const [sweepStep, setSweepStep] = useState<number | null>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sweepIdsRef = useRef<string[]>([]);
  const hasVocab = question.vocab && question.vocab.length > 0;

  const articleText = question.content.text || question.content.part1 || "";
  const rawHighlights = question.content.highlightSentences;

  const resolvedHighlights = useMemo(
    () => (rawHighlights?.length ? resolveHighlights(articleText, rawHighlights) : []),
    [articleText, rawHighlights],
  );
  const hasHighlights = resolvedHighlights.length > 0;
  const focusedId = focusedIndex !== null ? resolvedHighlights[focusedIndex]?.id ?? null : null;

  useEffect(() => {
    if (isCorrect === true) {
      playAudio();
    }
  }, [isCorrect, playAudio]);

  useEffect(() => {
    if (isVocabDialogOpen && question.vocab) {
      const startIndex = 0;
      const endIndex = (currentVocabPage + 1) * ITEMS_PER_PAGE_HORIZONTAL;
      const currentWindowWords = question.vocab.slice(startIndex, endIndex).map((v) => v.word);
      setHighlightedWords((prev) => Array.from(new Set([...prev, ...currentWindowWords])));
    }
  }, [currentVocabPage, isVocabDialogOpen, question.vocab]);

  useEffect(() => {
    setHighlightedWords([]);
    setIsLensModeActive(false);
    setFocusedIndex(null);
    setRevealedHighlightIds(new Set());
    setFinalizedHighlightIds(new Set());
    setSweepStep(null);
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
  }, [question.id]);

  useEffect(() => {
    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isLensModeActive) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLens();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLensModeActive]);

  useEffect(() => {
    if (sweepStep === null) return;
    const ids = sweepIdsRef.current;
    if (sweepStep >= ids.length) {
      setSweepStep(null);
      return;
    }

    playLensCloseSweepSound();
    const currentId = ids[sweepStep];
    setFinalizedHighlightIds((prev) => new Set(prev).add(currentId));

    const currentItem = resolvedHighlights.find((h) => h.id === currentId);
    const sweepDuration = currentItem ? sweepDurationFor(currentItem.text) : 1200;
    const totalWaitTime = sweepDuration + 4000;

    const timer = setTimeout(() => {
      setSweepStep((step) => (step === null ? null : step + 1));
    }, totalWaitTime);

    return () => clearTimeout(timer);
  }, [sweepStep, resolvedHighlights, playLensCloseSweepSound]);

  const clearFocusTimer = () => {
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    }
  };

  const closeLensThenSweep = (revealedSnapshot: Set<string>) => {
    focusTimerRef.current = setTimeout(() => {
      setIsLensModeActive(false);
      focusTimerRef.current = setTimeout(() => {
        sweepIdsRef.current = resolvedHighlights.filter((h) => revealedSnapshot.has(h.id)).map((h) => h.id);
        setSweepStep(sweepIdsRef.current.length > 0 ? 0 : null);
      }, 1000);
    }, 1000);
  };

  const closeLens = () => {
    clearFocusTimer();
    setFocusedIndex(null);
    closeLensThenSweep(revealedHighlightIds);
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

  const openLens = () => {
    if (!hasHighlights) return;
    clearFocusTimer();
    setSweepStep(null);
    setFinalizedHighlightIds(new Set());
    setRevealedHighlightIds(new Set());
    setFocusedIndex(null);
    setIsLensModeActive(true);
    focusTimerRef.current = setTimeout(() => {
      playLensOpenSound();
      setFocusedIndex(0);
      setRevealedHighlightIds(new Set([resolvedHighlights[0].id]));
    }, 2000);
  };

  const toggleLens = () => {
    if (isLensModeActive) {
      closeLens();
    } else {
      openLens();
    }
  };

  const goToPreviousHighlight = () => {
    if (focusedIndex === null) return;
    playLensDirectionSound();
    clearFocusTimer();
    const prevIndex = Math.max(0, focusedIndex - 1);
    setFocusedIndex(null);
    focusTimerRef.current = setTimeout(() => {
      playLensOpenSound();
      setFocusedIndex(prevIndex);
      setRevealedHighlightIds((ids) => new Set(ids).add(resolvedHighlights[prevIndex].id));
    }, 1000);
  };

  const goToNextHighlight = () => {
    if (focusedIndex === null) return;
    playLensDirectionSound();
    clearFocusTimer();
    const nextIndex = focusedIndex + 1;
    setFocusedIndex(null);
    if (nextIndex >= resolvedHighlights.length) {
      closeLensThenSweep(revealedHighlightIds);
      return;
    }
    focusTimerRef.current = setTimeout(() => {
      playLensOpenSound();
      setFocusedIndex(nextIndex);
      setRevealedHighlightIds((ids) => new Set(ids).add(resolvedHighlights[nextIndex].id));
    }, 1000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-8"
      style={{
        background: "rgb(0, 177, 64)",
      }}
    >
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "rgba(8, 4, 20, 0.5)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: isLensModeActive ? 1 : 0,
          transition: "opacity 1s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "inline-block",
        }}
      >
        {(hasVocab || hasHighlights) && (
          <>
            {hasVocab && (
              <DictionaryIconButton
                onClick={() => {
                  setIsVocabDialogOpen(true);
                  setIsDictIconVisible(false);
                }}
                isVisible={isDictIconVisible}
                position="bottom-center"
              />
            )}
            {hasHighlights && <LensIconButton onClick={toggleLens} />}
            {hasVocab && (
              <VocabularyDialog
                vocab={question.vocab!}
                isOpen={isVocabDialogOpen}
                onClose={() => setIsVocabDialogOpen(false)}
                onDictIconShow={() => setIsDictIconVisible(true)}
                onPageChange={(page) => setCurrentVocabPage(page)}
                variant="horizontal"
                position="bottom-center"
              />
            )}
          </>
        )}

        <div
          className="w-full max-w-7xl rounded-3xl overflow-hidden"
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
          >
            {/* Header */}
            <div
              className="px-6 py-6"
              style={
                isLensModeActive
                  ? {
                      filter:
                        "blur(2.5px) brightness(0.68) contrast(0.9) saturate(0.8)",
                      transition: "filter 1s cubic-bezier(0.22,1,0.36,1)",
                      pointerEvents: "none",
                    }
                  : { filter: "none", transition: "filter 1s cubic-bezier(0.22,1,0.36,1)" }
              }
            >
              <div
                className="flex items-center gap-3 rounded-lg px-4 py-2 mx-auto w-fit"
                style={{ backgroundColor: "hsl(260, 82%, 19%)" }}
              >
                <button
                  onClick={onBack}
                  className="text-white hover:text-purple-100 transition-colors flex-shrink-0"
                >
                  <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
                <h1 className="text-white text-lg font-bold">
                  {question.title || "Headlining Question"}
                </h1>
                <div className="w-6" />
              </div>
            </div>

            {/* Main Content - 2 Column Grid */}
            <div className="px-6 py-8 grid grid-cols-12 gap-8">
              {/* Left Column - Article & Reason (70%) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="col-span-8"
              >
                <div className="rounded-2xl p-8 shadow-lg bg-white">
                  {/* Headline Section */}
                  <div
                    className="mb-6"
                    style={
                      isLensModeActive
                        ? {
                            filter:
                              "blur(2.5px) brightness(0.68) contrast(0.9) saturate(0.8)",
                            transition: "filter 1s cubic-bezier(0.22,1,0.36,1)",
                          }
                        : { filter: "none", transition: "filter 1s cubic-bezier(0.22,1,0.36,1)" }
                    }
                  >
                    <p className="text-gray-600 font-normal text-sm mb-2">Headline:</p>
                    {selectedOption && answered ? (
                      <div className="inline-flex w-fit max-w-full min-h-[44px] px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-lg font-bold items-center">
                        {question.options.find((opt) => opt.id === selectedOption)?.text}
                      </div>
                    ) : (
                      <div className="w-48 h-11 rounded-xl bg-gray-100 border border-dashed border-gray-300" />
                    )}
                  </div>

                  <div
                    className="border-t border-gray-300 my-6"
                    style={
                      isLensModeActive
                        ? {
                            filter:
                              "blur(2.5px) brightness(0.68) contrast(0.9) saturate(0.8)",
                            transition: "filter 1s cubic-bezier(0.22,1,0.36,1)",
                          }
                        : { filter: "none", transition: "filter 1s cubic-bezier(0.22,1,0.36,1)" }
                    }
                  ></div>

                  {/* Article Paragraph */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                      <HighlightedParagraph
                        text={articleText}
                        resolved={resolvedHighlights}
                        activeWords={highlightedWords}
                        lensActive={isLensModeActive}
                        focusedId={focusedId}
                        revealedIds={revealedHighlightIds}
                        finalizedIds={finalizedHighlightIds}
                        isFirst={focusedIndex === 0}
                        onPrevious={goToPreviousHighlight}
                        onNext={goToNextHighlight}
                        onClose={closeLens}
                      />
                    </p>
                  </div>

                  {/* Reason Section (Kẻ nét đứt linh hoạt động theo từng dòng chữ) */}
                  <div
                    className="mt-10"
                    style={
                      isLensModeActive
                        ? {
                            filter:
                              "blur(2.5px) brightness(0.68) contrast(0.9) saturate(0.8)",
                            transition: "filter 1s cubic-bezier(0.22,1,0.36,1)",
                          }
                        : { filter: "none", transition: "filter 1s cubic-bezier(0.22,1,0.36,1)" }
                    }
                  >
                    <p className="text-gray-600 font-normal text-sm mb-2">Reason:</p>
                    <div className="w-full">
                      {answered || isAnswered ? (
                        <motion.p
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="text-gray-800 text-base font-normal"
                          style={{
                            lineHeight: "32px",
                            backgroundImage: REASON_DASHED_PATTERN,
                            backgroundSize: "100% 32px",
                            backgroundRepeat: "repeat-y",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {language === "spanish"
                            ? question.spanish || question.explanation
                            : language === "indonesian"
                              ? question.indonesian || question.explanation
                              : language === "thai"
                                ? question.thai || question.explanation
                                : question.explanation}
                        </motion.p>
                      ) : (
                        <div
                          className="w-full min-h-[64px]"
                          style={{
                            backgroundImage: REASON_EMPTY_PATTERN,
                            backgroundSize: "100% 32px",
                            backgroundRepeat: "repeat-y",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Options (30%) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="col-span-4 flex flex-col gap-4"
                style={
                  isLensModeActive
                    ? {
                        filter:
                          "blur(2.5px) brightness(0.68) contrast(0.9) saturate(0.8)",
                        transition: "filter 1s cubic-bezier(0.22,1,0.36,1)",
                        pointerEvents: "none",
                      }
                    : { filter: "none", transition: "filter 1s cubic-bezier(0.22,1,0.36,1)" }
                }
              >
                <h2 className="text-white font-bold text-base mb-2">
                  Choose the best headline:
                </h2>

                <div className="rounded-2xl p-6 shadow-lg bg-white">
                  <div className="space-y-3">
                    {question.options.map((option, index) => (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        onClick={() => handleSelectOption(option.id)}
                        disabled={answered}
                        onMouseEnter={() => {
                          setHoveredOptionId(option.id);
                          if (!answered && selectedOption !== option.id) {
                            playOptionHoverSound();
                          }
                        }}
                        onMouseLeave={() => setHoveredOptionId(null)}
                        whileHover={
                          !answered && selectedOption !== option.id
                            ? { scale: 1.02, boxShadow: "0 8px 16px rgba(59, 130, 246, 0.2)" }
                            : {}
                        }
                        className={`w-full flex items-center gap-3 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                          selectedOption === option.id
                            ? isCorrect
                              ? "bg-green-400 text-white shadow-lg"
                              : "bg-red-400 text-white shadow-lg"
                            : answered &&
                                option.id === question.correctAnswer &&
                                !isCorrect
                              ? "bg-green-400 text-white shadow-lg"
                              : "bg-gray-100 text-gray-900 hover:shadow-md hover:bg-gray-200 disabled:opacity-50"
                        }`}
                      >
                        <div
                          className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all"
                          style={{
                            border:
                              selectedOption === option.id
                                ? "1.5px solid rgba(255, 255, 255, 1)"
                                : "1.5px solid rgba(100, 100, 100, 1)",
                            backgroundColor:
                              selectedOption === option.id
                                ? isCorrect
                                  ? "rgb(34, 197, 94)"
                                  : "rgb(239, 68, 68)"
                                : answered &&
                                    option.id === question.correctAnswer &&
                                    !isCorrect
                                  ? "rgb(34, 197, 94)"
                                  : "rgb(243, 244, 246)",
                          }}
                        >
                          {(selectedOption === option.id ||
                            (answered &&
                              option.id === question.correctAnswer &&
                              !isCorrect)) && (
                            <svg
                              className="w-3 h-3 text-white"
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
                        <span className="flex-1 text-left" style={{ whiteSpace: "pre-wrap" }}>
                          {hasVocab && highlightedWords.length > 0 ? (
                            <HighlightText text={option.text} activeWords={highlightedWords} />
                          ) : (
                            option.text
                          )}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  {(answered || isAnswered) && (
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
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all mt-6"
                    >
                      Next →
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}