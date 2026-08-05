import { useCallback } from "react";

export function useAudio(audioUrl: string) {
  const playAudio = useCallback(() => {
    try {
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.warn("Failed to play audio:", error);
      });
    } catch (error) {
      console.warn("Error creating audio:", error);
    }
  }, [audioUrl]);

  return { playAudio };
}
