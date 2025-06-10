import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { AddInsight } from "./add-insight.tsx";

// ────────────────────────────────────────────────────────────────────────────
//  Test doubles / mocks
// ────────────────────────────────────────────────────────────────────────────
vi.mock("../../lib/consts.ts", () => ({
  BRANDS: [
    { id: 1, name: "Alpha" },
    { id: 2, name: "Beta" },
  ],
}));

// keep a fresh fetch mock per test
let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchSpy = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    }),
  );
  // @ts-ignore  override global
  globalThis.fetch = fetchSpy;
});

afterEach(() => {
  vi.resetAllMocks();
  cleanup();
});

// helpers
function renderDialog(props = {}) {
  return render(
    <AddInsight
      open
      onAdd={vi.fn()}
      onClose={vi.fn()}
      {...props}
    />,
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Tests
// ────────────────────────────────────────────────────────────────────────────
describe("<AddInsight />", () => {
  it("posts payload and calls onAdd/onClose on success", async () => {
    const onAdd   = vi.fn();
    const onClose = vi.fn();

    renderDialog({ onAdd, onClose });

    // type text
    fireEvent.change(screen.getByPlaceholderText(/insightful/i), {
      target: { value: "Great product idea" },
    });

    // submit form
    fireEvent.submit(await screen.getByRole("form", { name: /add insight form/i }));

    // wait until fetch called
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("/api/insights/create");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    // callbacks fired
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call fetch when textarea is empty", async () => {
    renderDialog();

    const form = await screen.getByRole("form", { name: /add insight form/i });
    fireEvent.submit(form);

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
