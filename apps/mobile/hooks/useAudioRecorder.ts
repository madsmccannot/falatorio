import { useState, useRef, useCallback } from "react";
import { Audio } from "expo-av";
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

  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets["HIGH_QUALITY"],
    );
    await recording.startAsync();

    recordingRef.current = recording;
    setState({ isRecording: true, duration: 0, audioBase64: null });

    intervalRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, duration: prev.duration + 100 }));
    }, 100);
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const recording = recordingRef.current;
    if (!recording) return null;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recordingRef.current = null;

    if (!uri) {
      setState({ isRecording: false, duration: 0, audioBase64: null });
      return null;
    }

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    setState({ isRecording: false, duration: 0, audioBase64: base64 });

    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

    return base64;
  }, []);

  const cancelRecording = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const recording = recordingRef.current;
    if (recording) {
      await recording.stopAndUnloadAsync();
      recordingRef.current = null;
    }

    setState({ isRecording: false, duration: 0, audioBase64: null });
  }, []);

  return {
    isRecording: state.isRecording,
    duration: state.duration,
    audioBase64: state.audioBase64,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
