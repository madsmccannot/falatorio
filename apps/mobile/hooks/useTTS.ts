import { useState, useCallback, useRef } from "react";
import * as Speech from "expo-speech";

interface TTSOptions {
  speed?: "slow" | "normal";
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<string | null>(null);

  const speak = useCallback(async (text: string, options?: TTSOptions) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      if (utteranceRef.current === text) {
        utteranceRef.current = null;
        return;
      }
    }

    utteranceRef.current = text;
    setIsSpeaking(true);

    const rate = options?.speed === "slow" ? 0.6 : 0.85;

    Speech.speak(text, {
      language: "pt-PT",
      rate,
      onDone: () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      },
      onStopped: () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      },
      onError: () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      },
    });
  }, [isSpeaking]);

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, []);

  return { speak, stop, isSpeaking };
}
