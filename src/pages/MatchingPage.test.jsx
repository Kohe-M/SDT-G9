import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import MatchingPage from "./MatchingPage";
import { auth } from "../firebase";
import {
  cancelMatching,
  getExistingGroupId,
  startMatching,
  subscribeMatchingCandidates,
  subscribeUserClassGroups,
} from "../services/matchingService";

vi.mock("../firebase", () => ({ auth: { currentUser: { uid: "user-1" } } }));
vi.mock("../services/matchingService", () => ({
  cancelMatching: vi.fn(() => Promise.resolve()),
  getExistingGroupId: vi.fn(() => Promise.resolve(null)),
  startMatching: vi.fn(() => Promise.resolve({ status: "waiting" })),
  subscribeMatchingCandidates: vi.fn(() => vi.fn()),
  subscribeUserClassGroups: vi.fn(() => vi.fn()),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderPage(path = "/matching/53382") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocationProbe />
      <Routes>
        <Route path="/matching/:classCode" element={<MatchingPage />} />
        <Route path="/chat/:groupId" element={<div>chat detail</div>} />
        <Route path="/timetable" element={<div>timetable page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  auth.currentUser = { uid: "user-1" };
  getExistingGroupId.mockResolvedValue(null);
  startMatching.mockResolvedValue({ status: "waiting" });
  subscribeMatchingCandidates.mockReturnValue(vi.fn());
  subscribeUserClassGroups.mockReturnValue(vi.fn());
});

describe("MatchingPage", () => {
  test("shows the class name and class code for a valid class", () => {
    renderPage();

    expect(screen.getByText("ソフトウェア開発論")).toBeTruthy();
    expect(screen.getByText("授業コード: 53382")).toBeTruthy();
  });

  test("disables the start button while waiting", async () => {
    renderPage();
    const startButton = screen.getByRole("button", { name: "マッチング開始" });

    fireEvent.click(startButton);

    await screen.findByRole("button", { name: "待機をキャンセル" });
    fireEvent.click(startButton);

    expect(startMatching).toHaveBeenCalledTimes(1);
    expect(startButton.disabled).toBe(true);
  });

  test("navigates to the chat when matching succeeds", async () => {
    subscribeMatchingCandidates.mockImplementationOnce(({ onMatched }) => {
      onMatched("group-1");
      return vi.fn();
    });

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "マッチング開始" }));

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe("/chat/group-1");
    });
    expect(cancelMatching).toHaveBeenCalledWith({ userId: "user-1" });
    expect(cancelMatching).not.toHaveBeenCalledWith({ userId: "user-2" });
  });

  test("detects a matched group from the group subscription without queue deletion", async () => {
    subscribeUserClassGroups.mockImplementationOnce(({ onMatched }) => {
      onMatched("group-1");
      return vi.fn();
    });

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "マッチング開始" }));

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe("/chat/group-1");
    });
    expect(cancelMatching).toHaveBeenCalledTimes(1);
    expect(cancelMatching).toHaveBeenCalledWith({ userId: "user-1" });
  });

  test("settles only once when queue and group subscriptions both report a match", async () => {
    let groupMatched;
    let queueMatched;
    subscribeUserClassGroups.mockImplementationOnce(({ onMatched }) => {
      groupMatched = onMatched;
      return vi.fn();
    });
    subscribeMatchingCandidates.mockImplementationOnce(({ onMatched }) => {
      queueMatched = onMatched;
      return vi.fn();
    });

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "マッチング開始" }));
    await waitFor(() => {
      expect(groupMatched).toBeTypeOf("function");
      expect(queueMatched).toBeTypeOf("function");
    });

    groupMatched("group-1");
    queueMatched("group-1");

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe("/chat/group-1");
    });
    expect(cancelMatching).toHaveBeenCalledTimes(1);
  });

  test("navigates to the matched chat even when queue cleanup fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    cancelMatching.mockRejectedValueOnce(new Error("cleanup failed"));
    subscribeUserClassGroups.mockImplementationOnce(({ onMatched }) => {
      onMatched("group-1");
      return vi.fn();
    });

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "マッチング開始" }));

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe("/chat/group-1");
    });
    expect(cancelMatching).toHaveBeenCalledWith({ userId: "user-1" });
    consoleError.mockRestore();
  });

  test("cleans up only the current user's queue when an existing group is found", async () => {
    getExistingGroupId.mockResolvedValueOnce("group-1");

    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "マッチング開始" }));

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe("/chat/group-1");
    });
    expect(startMatching).not.toHaveBeenCalled();
    expect(cancelMatching).toHaveBeenCalledWith({ userId: "user-1" });
    expect(cancelMatching).not.toHaveBeenCalledWith({ userId: "user-2" });
  });

  test("cancels only the current user's queue", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "マッチング開始" }));
    fireEvent.click(await screen.findByRole("button", { name: "待機をキャンセル" }));

    await waitFor(() => {
      expect(cancelMatching).toHaveBeenCalledWith({ userId: "user-1" });
    });
    expect(cancelMatching).not.toHaveBeenCalledWith({ userId: "user-2" });
  });

  test("cleans up only the current user's queue on unmount while waiting", async () => {
    const queueUnsubscribe = vi.fn();
    const groupUnsubscribe = vi.fn();
    subscribeMatchingCandidates.mockReturnValueOnce(queueUnsubscribe);
    subscribeUserClassGroups.mockReturnValueOnce(groupUnsubscribe);
    const { unmount } = renderPage();

    fireEvent.click(screen.getByRole("button", { name: "マッチング開始" }));
    await screen.findByRole("button", { name: "待機をキャンセル" });
    unmount();

    await waitFor(() => {
      expect(cancelMatching).toHaveBeenCalledWith({ userId: "user-1" });
    });
    expect(cancelMatching).not.toHaveBeenCalledWith({ userId: "user-2" });
    expect(queueUnsubscribe).toHaveBeenCalledTimes(1);
    expect(groupUnsubscribe).toHaveBeenCalledTimes(1);
  });

  test("does not start matching for an unknown class code", () => {
    renderPage("/matching/UNKNOWN999");

    expect(screen.getByText("UNKNOWN999")).toBeTruthy();
    expect(screen.getByText("授業コード: UNKNOWN999")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain("授業データに存在しない授業コードです");
    expect(screen.getByRole("button", { name: "マッチング開始" }).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "マッチング開始" }));

    expect(startMatching).not.toHaveBeenCalled();
  });

  test("unknown class codes can return to the timetable", () => {
    renderPage("/matching/UNKNOWN999");

    fireEvent.click(screen.getByRole("button", { name: "時間割へ戻る" }));

    expect(screen.getByTestId("location").textContent).toBe("/timetable");
  });
});
