import { vi } from "vitest";
import type { Context, UserContext } from "../trpc/context.js";

export function createMockUser(overrides: Partial<UserContext> = {}): UserContext {
  return {
    userId: "00000000-0000-0000-0000-000000000001",
    clerkId: "clerk_test_001",
    tier: "free",
    l1: "hi",
    ...overrides,
  };
}

export function createMockRedis(store: Map<string, string> = new Map()) {
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (_key: string, _val: string) => "OK"),
    del: vi.fn(async () => 1),
    incr: vi.fn(async (key: string) => {
      const cur = parseInt(store.get(key) ?? "0", 10) + 1;
      store.set(key, String(cur));
      return cur;
    }),
    pexpire: vi.fn(async () => 1),
    expire: vi.fn(async () => 1),
  } as any;
}

function chainable(resolved: unknown = []) {
  const obj: Record<string, unknown> = {};
  const proxy = new Proxy(obj, {
    get(_target, prop: string) {
      if (prop === "then") {
        return (resolve: (v: unknown) => void) => resolve(resolved);
      }
      if (prop === Symbol.iterator as unknown) {
        return function* () { yield* resolved as any[]; };
      }
      if (!obj[prop]) {
        obj[prop] = vi.fn().mockReturnValue(proxy);
      }
      return obj[prop];
    },
  });
  return proxy;
}

export type MockDb = ReturnType<typeof createMockDb>;

export function createMockDb() {
  const selectResults: unknown[][] = [];
  let selectIdx = 0;

  function makeSelectChain() {
    const result = selectResults[selectIdx] ?? [];
    selectIdx++;
    return chainable(result);
  }

  const db = {
    _pushResults(...results: unknown[][]) {
      selectResults.push(...results);
      selectIdx = 0;
    },
    select: vi.fn().mockImplementation(() => makeSelectChain()),
    selectDistinct: vi.fn().mockImplementation(() => makeSelectChain()),
    insert: vi.fn().mockReturnValue(chainable([])),
    update: vi.fn().mockReturnValue(chainable([])),
    delete: vi.fn().mockReturnValue(chainable([])),
  };

  return db as any;
}

export function createMockContext(overrides: Partial<Context> = {}): Context {
  return {
    db: createMockDb(),
    redis: createMockRedis(),
    user: createMockUser(),
    clerkId: "clerk_test_001",
    clientIp: "127.0.0.1",
    ...overrides,
  };
}
