import { useState, useCallback, useRef, useEffect } from "react";
import {
  useAudioRecorder as useExpoAudioRecorder,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import * as FileSystem from "expo-file-system";

interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioBase64: string | null;
}

export function useAudioRecorder() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    audioBase64: null,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = useCallback(async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) return;

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setState({ isRecording: true, duration: 0, audioBase64: null });

    timerRef.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        duration: recorder.currentTime,
      }));
    }, 250);
  }, [recorder]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });

    const uri = recorder.uri;
    if (!uri) {
      setState({ isRecording: false, duration: 0, audioBase64: null });
      return null;
    }

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    setState({ isRecording: false, duration: recorder.currentTime, audioBase64: base64 });
    return base64;
  }, [recorder]);

  const cancelRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });
    setState({ isRecording: false, duration: 0, audioBase64: null });
  }, [recorder]);

  return {
    isRecording: state.isRecording,
    duration: state.duration,
    audioBase64: state.audioBase64,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
