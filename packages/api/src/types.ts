import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// Re-exported from server — provides end-to-end type safety
// The actual AppRouter type comes from the server package at build time
export type { AppRouter } from "../../../server/src/trpc/router.js";

// These will be available once AppRouter is properly imported
// export type RouterInput = inferRouterInputs<AppRouter>;
// export type RouterOutput = inferRouterOutputs<AppRouter>;
