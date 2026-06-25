import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ChatListPage from "./ChatListPage";
import { auth } from "../firebase";
import { subscribeToUserGroups } from "../services/chatService";

vi.mock("../firebase", () => ({ auth: { currentUser: { uid: "user-1" } } }));
vi.mock("../services/chatService", () => ({
  subscribeToUserGroups: vi.fn(),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/chats"]}>
      <LocationProbe />
      <Routes>
        <Route path="/chats" element={<ChatListPage />} />
        <Route path="/chat/:groupId" element={<div>chat detail</div>} />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  auth.currentUser = { uid: "user-1" };
  subscribeToUserGroups.mockImplementation(({ onGroups }) => {
    onGroups([
      {
        id: "group-1",
        classCode: "53382",
        lastMessageText: "こんにちは",
        updatedAt: { toDate: () => new Date("2026-06-22T10:00:00+09:00") },
      },
    ]);
    return vi.fn();
  });
});

describe("ChatListPage", () => {
  test("shows groups the current user participates in", async () => {
    renderPage();

    expect(await screen.findByText("ソフトウェア開発論（53382）")).toBeTruthy();
    expect(screen.getByText("こんにちは")).toBeTruthy();
  });

  test("navigates to the selected group chat", async () => {
    renderPage();

    fireEvent.click(await screen.findByText("ソフトウェア開発論（53382）"));

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe("/chat/group-1");
    });
  });

  test("falls back when class data is missing", async () => {
    subscribeToUserGroups.mockImplementationOnce(({ onGroups }) => {
      onGroups([
        {
          id: "group-unknown",
          classCode: "99999",
          lastMessageText: "",
          updatedAt: { toDate: () => new Date("2026-06-22T10:00:00+09:00") },
        },
      ]);
      return vi.fn();
    });

    renderPage();

    expect(await screen.findByText("授業コード: 99999")).toBeTruthy();
    expect(screen.getByText("まだメッセージはありません。")).toBeTruthy();
  });
});
