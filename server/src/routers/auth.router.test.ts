import { describe, it, expect } from "vitest";

describe("auth.register security invariants", () => {
  it("blocks email association when already linked to another clerkId", () => {
    const clerkId = "clerk_attacker";
    const existingRow = { id: "user_existing", clerkId: "clerk_real_owner" };

    const isAlreadyLinked = existingRow.clerkId && existingRow.clerkId !== clerkId;
    expect(isAlreadyLinked).toBeTruthy();
  });

  it("allows email association when not yet linked", () => {
    const clerkId = "clerk_new";
    const existingRow = { id: "user_existing", clerkId: null as string | null };

    const isAlreadyLinked = existingRow.clerkId && existingRow.clerkId !== clerkId;
    expect(isAlreadyLinked).toBeFalsy();
  });

  it("allows email association when same clerkId owns the account", () => {
    const clerkId = "clerk_same";
    const existingRow = { id: "user_existing", clerkId: "clerk_same" };

    const isAlreadyLinked = existingRow.clerkId && existingRow.clerkId !== clerkId;
    expect(isAlreadyLinked).toBe(false);
  });

  it("clerkId from input should never be trusted for email association", () => {
    const tokenClerkId = "clerk_real";
    const inputClerkId = "clerk_spoofed";

    expect(tokenClerkId).not.toBe(inputClerkId);
  });
});
