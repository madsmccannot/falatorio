import { env } from "../env.js";

const VOICES = ["pt-PT-FernandaNeural", "pt-PT-DuarteNeural", "pt-PT-RaquelNeural"] as const;
type Voice = (typeof VOICES)[number];

function pickVoice(voice?: Voice): Voice {
  if (voice) return voice;
  return VOICES[Math.floor(Math.random() * VOICES.length)]!;
}

export async function synthesizeSpeech(
  text: string,
  speed: "slow" | "normal" = "normal",
  voice?: Voice,
): Promise<string> {
  const rate = speed === "slow" ? "-30%" : "0%";
  const selectedVoice = pickVoice(voice);

  const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-PT">
  <voice name="${selectedVoice}">
    <prosody rate="${rate}">${escapeXml(text)}</prosody>
  </voice>
</speak>`.trim();

  const response = await fetch(
    `https://${env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": env.AZURE_SPEECH_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      },
      body: ssml,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure TTS error ${response.status}: ${errorText}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());

  const { uploadAudio } = await import("./storage.service.js");
  const key = `tts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`;
  const url = await uploadAudio(key, audioBuffer, "audio/mpeg");

  return url;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
