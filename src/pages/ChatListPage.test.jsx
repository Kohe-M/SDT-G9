import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ChatListPage from "./ChatListPage";
import { auth } from "../firebase";
import {
  archiveChat,
  restoreChat,
  subscribeToUserChatStates,
  subscribeToUserGroups,
} from "../services/chatService";

vi.mock("../firebase", () => ({ auth: { currentUser: { uid: "user-1" } } }));
vi.mock("../services/chatService", () => ({
  archiveChat: vi.fn(() => Promise.resolve()),
  restoreChat: vi.fn(() => Promise.resolve()),
  subscribeToUserChatStates: vi.fn(),
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
  subscribeToUserChatStates.mockImplementation(({ onStates }) => {
    onStates({});
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

  test("hides archived chats from the normal list", async () => {
    subscribeToUserGroups.mockImplementationOnce(({ onGroups }) => {
      onGroups([
        {
          id: "group-1",
          classCode: "53382",
          lastMessageText: "アーカイブ済み",
          updatedAt: { toDate: () => new Date("2026-06-22T10:00:00+09:00") },
        },
        {
          id: "group-2",
          classCode: "53364",
          lastMessageText: "表示する",
          updatedAt: { toDate: () => new Date("2026-06-22T11:00:00+09:00") },
        },
      ]);
      return vi.fn();
    });
    subscribeToUserChatStates.mockImplementationOnce(({ onStates }) => {
      onStates({ "group-1": { groupId: "group-1", archivedAt: "server-time" } });
      return vi.fn();
    });

    renderPage();

    expect(await screen.findByText("データ構造とアルゴリズム（53364）")).toBeTruthy();
    expect(screen.queryByText("ソフトウェア開発論（53382）")).toBeNull();
  });

  test("archives a chat only for the current user", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "チャットを終了して一覧から非表示" }));
    expect(screen.getByText(/グループとメッセージは削除されず/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "非表示にする" }));

    await waitFor(() => {
      expect(archiveChat).toHaveBeenCalledWith({
        userId: "user-1",
        groupId: "group-1",
      });
    });
  });

  test("restores an archived chat to the normal list", async () => {
    let emitStates = () => {};
    subscribeToUserChatStates.mockImplementationOnce(({ onStates }) => {
      emitStates = onStates;
      onStates({ "group-1": { groupId: "group-1", archivedAt: "server-time" } });
      return vi.fn();
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "アーカイブ済み" }));
    expect(await screen.findByText("ソフトウェア開発論（53382）")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "通常一覧へ戻す" }));
    await waitFor(() => {
      expect(restoreChat).toHaveBeenCalledWith({
        userId: "user-1",
        groupId: "group-1",
      });
    });

    emitStates({});
    fireEvent.click(screen.getByRole("button", { name: "通常" }));

    expect(await screen.findByText("ソフトウェア開発論（53382）")).toBeTruthy();
  });
});
