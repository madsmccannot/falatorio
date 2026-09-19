import { env } from "../env.js";

export async function transcribeAudio(audioBase64: string): Promise<string> {
  const audioBuffer = Buffer.from(audioBase64, "base64");

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([audioBuffer], { type: "audio/webm" }),
    "audio.webm",
  );
  formData.append("model", "whisper-1");
  formData.append("language", "pt");
  formData.append("response_format", "json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Whisper API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as { text: string };
  return data.text.trim();
}
