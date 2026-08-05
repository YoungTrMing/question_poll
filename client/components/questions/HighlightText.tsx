import React from "react";

interface HighlightTextProps {
  text: string;
  activeWords: string[];
}

export default function HighlightText({ text, activeWords }: HighlightTextProps) {
  if (!activeWords || activeWords.length === 0) {
    return <>{text}</>;
  }

  // Create regex pattern from activeWords, escaping special characters
  const escapedWords = activeWords.map((word) =>
    word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const pattern = new RegExp(`\\b(${escapedWords.join("|")})\\b`, "gi");

  const fragments: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      fragments.push(text.substring(lastIndex, match.index));
    }

    // Add highlighted match
    fragments.push(
      <span
        key={`highlight-${match.index}`}
        className="bg-yellow-200 text-black font-bold px-1 rounded animate-fade-in"
      >
        {match[0]}
      </span>
    );

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    fragments.push(text.substring(lastIndex));
  }

  return <>{fragments}</>;
}
