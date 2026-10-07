import { useState, useCallback, useRef } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    transcript: "",
    confidence: 0,
    error: null,
  });

  const resolveRef = useRef<((transcript: string) => void) | null>(null);

  useSpeechRecognitionEvent("result", (event) => {
    const best = event.results[0];
    if (!best) return;

    setState((prev) => ({
      ...prev,
      transcript: best.transcript,
      confidence: best.confidence,
    }));

    if (event.isFinal) {
      setState((prev) => ({ ...prev, isListening: false }));
      resolveRef.current?.(best.transcript);
      resolveRef.current = null;
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    setState((prev) => ({
      ...prev,
      isListening: false,
      error: event.error,
    }));
    resolveRef.current?.("");
    resolveRef.current = null;
  });

  useSpeechRecognitionEvent("end", () => {
    setState((prev) => {
      if (!prev.isListening) return prev;
      resolveRef.current?.(prev.transcript);
      resolveRef.current = null;
      return { ...prev, isListening: false };
    });
  });

  const startListening = useCallback(async (): Promise<string> => {
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      setState((prev) => ({ ...prev, error: "permission_denied" }));
      return "";
    }

    setState({ isListening: true, transcript: "", confidence: 0, error: null });

    return new Promise<string>((resolve) => {
      resolveRef.current = resolve;

      ExpoSpeechRecognitionModule.start({
        lang: "pt-PT",
        interimResults: true,
        maxAlternatives: 1,
      });
    });
  }, []);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return {
    isListening: state.isListening,
    transcript: state.transcript,
    confidence: state.confidence,
    error: state.error,
    startListening,
    stopListening,
  };
}
