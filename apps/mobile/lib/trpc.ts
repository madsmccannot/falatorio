import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@falatorio/api/client";
import superjson from "superjson";
import { getApiUrl } from "./storage";

const HAS_CLERK = !!process.env["EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"];

export function useTRPCClient() {
  let getToken: () => Promise<string | null> = () => Promise.resolve(null);

  if (HAS_CLERK) {
    const { useAuth } = require("@clerk/clerk-expo");
    const auth = useAuth();
    getToken = auth.getToken;
  }

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 2,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getApiUrl()}/trpc`,
          transformer: superjson,
          async headers() {
            const token = await getToken();
            return token ? { authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    }),
  );

  return { trpc, trpcClient, queryClient, QueryClientProvider };
}

export { trpc };
