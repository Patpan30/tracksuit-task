import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { Insights } from "./insights.tsx";

const TEST_INSIGHTS = [
  {
    id: 1,
    brand: 1,
    createdAt: new Date(),
    text: "Test insight",
  },
  { id: 2, brand: 2, createdAt: new Date(), text: "Another test insight" },
];

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

describe("<Insights />", () => {
  it("shows empty-state text when list is empty", () => {
    render(<Insights insights={[]} onRemove={vi.fn()} />);

    expect(screen.getByText(/we have no insight/i)).toBeInTheDocument();
  });

  it("renders", () => {
    const { getByText } = render(<Insights insights={TEST_INSIGHTS} onRemove={() => {}}/>);
    expect(getByText(TEST_INSIGHTS[0].text)).toBeTruthy();
  });

  it("deletes an item and calls onRemove", async () => {
    const onRemove = vi.fn();
    render(<Insights insights={[...TEST_INSIGHTS]} onRemove={onRemove} />);

    // Pick the trash icon for the item with id=1.
    // The component renders exactly one <svg> per insight, in the same order.
    const trashButtons = screen.getAllByLabelText(/insight delete button/i);     // lucide icons get role="img"
    expect(trashButtons).toHaveLength(2);        // one per sample insight

    fireEvent.click(trashButtons[0]);                    // click first insight's icon

    // fetch should be called once with correct URL/verb
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe("/api/insights/delete/1");
      expect(init).toMatchObject({ method: "DELETE" });

      // parent callback receives the deleted id
      expect(onRemove).toHaveBeenCalledWith(1);
    });

  });
});
