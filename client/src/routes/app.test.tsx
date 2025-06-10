// app.test.tsx
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { App } from "./app.tsx";

/* --------------------------------------------------------------------- */
/*  1. Mock children so we can drive callbacks programmatically          */
/* --------------------------------------------------------------------- */
vi.mock("../components/header/header.tsx", () => ({
  Header: ({ onAdd }: { onAdd: () => void }) => (
    <button onClick={onAdd}>add-btn</button>
  ),
}));

vi.mock("../components/insights/insights.tsx", () => ({
  Insights: ({
    insights,
    onRemove,
  }: {
    insights: any[];
    onRemove: (id: number) => void;
  }) => (
    <ul>
      {insights.map(({ id, text }) => (
        <li key={id}>
          {text}
          <button aria-label={`del-${id}`} onClick={() => onRemove(id)}>
            ❌
          </button>
        </li>
      ))}
    </ul>
  ),
}));

/* --------------------------------------------------------------------- */
/*  2. Test helpers                                                      */
/* --------------------------------------------------------------------- */
const FIRST_BATCH = [
  { id: 1, brand: 0, createdAt: new Date(), text: "alpha" },
  { id: 2, brand: 1, createdAt: new Date(), text: "beta" },
];
const SECOND_BATCH = [
  ...FIRST_BATCH,
  { id: 3, brand: 2, createdAt: new Date(), text: "gamma" },
];

let fetchSpy: ReturnType<typeof vi.fn>;

function mockFetchSequence() {
  // first call → FIRST_BATCH, second call → SECOND_BATCH, else FIRST_BATCH
  fetchSpy = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(FIRST_BATCH),
    } as Response)
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(SECOND_BATCH),
    } as Response)
    .mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(FIRST_BATCH),
    } as Response);

  // @ts-ignore  override global
  globalThis.fetch = fetchSpy;
}

beforeEach(() => mockFetchSequence());
afterEach(() => {
  vi.resetAllMocks();
  cleanup();
});

/* --------------------------------------------------------------------- */
/*  3. Tests                                                             */
/* --------------------------------------------------------------------- */
describe("<App /> integration", () => {
  it("renders insights from initial fetch", async () => {
    render(<App />);

    // wait for first fetch + render
    await screen.findByText("alpha");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText("beta")).toBeInTheDocument();
  });

  it("refreshes list after 'add' flow", async () => {
    render(<App />);

    // ensure first list in DOM
    await screen.findByText("alpha");

    // click the mocked Header button
    fireEvent.click(screen.getByText("add-btn"));

    // wait until the new item appears
    await screen.findByText("gamma");

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("removes an insight locally when delete clicked", async () => {
    render(<App />);

    await screen.findByText("alpha");

    // click delete button for id 1
    fireEvent.click(screen.getByLabelText("del-1"));

    // 'alpha' should be gone, 'beta' remains
    await waitFor(() =>
      expect(screen.queryByText("alpha")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("beta")).toBeInTheDocument();

    // no extra fetch
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
