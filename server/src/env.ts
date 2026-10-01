import { z } from "zod";

const isDev = process.env["NODE_ENV"] !== "production";

const optionalInDev = () =>
  isDev ? z.string().default("") : z.string().min(1);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  CLERK_SECRET_KEY: optionalInDev(),

  ANTHROPIC_API_KEY: optionalInDev(),
  OPENAI_API_KEY: optionalInDev(),

  AZURE_SPEECH_KEY: optionalInDev(),
  AZURE_SPEECH_REGION: z.string().default("westeurope"),

  R2_ACCOUNT_ID: optionalInDev(),
  R2_ACCESS_KEY_ID: optionalInDev(),
  R2_SECRET_ACCESS_KEY: optionalInDev(),
  R2_BUCKET_NAME: z.string().default("falatorio-audio"),

  FCM_PROJECT_ID: z.string().min(1).optional(),
  FCM_CLIENT_EMAIL: z.string().email().optional(),
  FCM_PRIVATE_KEY: z.string().min(1).optional(),

  REVENUECAT_API_KEY: z.string().min(1).optional(),
  REVENUECAT_WEBHOOK_SECRET: z.string().min(1).optional(),
  APPLE_SHARED_SECRET: z.string().min(1).optional(),
  GOOGLE_SERVICE_ACCOUNT_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return result.data;
}

export const env = parseEnv();
