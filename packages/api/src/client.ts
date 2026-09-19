import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./types.js";

export const trpc = createTRPCReact<AppRouter>();
