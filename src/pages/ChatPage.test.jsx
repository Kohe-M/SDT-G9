import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ChatPage from "./ChatPage";
import { auth } from "../firebase";
import { sendMessage, subscribeToGroup, subscribeToMessages } from "../services/chatService";

vi.mock("../firebase", () => ({ auth: { currentUser: { uid: "user-1" } } }));
vi.mock("../services/chatService", () => ({
  subscribeToGroup: vi.fn(),
  subscribeToMessages: vi.fn(),
  sendMessage: vi.fn(),
  validateMessage: vi.fn((text) => {
    const trimmed = String(text ?? "").trim();
    return { ok: trimmed.length > 0 && trimmed.length <= 200, message: "", text: trimmed };
  }),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/chat/group-1"]}>
      <LocationProbe />
      <Routes>
        <Route path="/chat/:groupId" element={<ChatPage />} />
        <Route path="/chats" element={<div>chat list</div>} />
      </Routes>
    </MemoryRouter>
  );
}

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  auth.currentUser = { uid: "user-1" };
  subscribeToGroup.mockImplementation(({ onGroup }) => {
    onGroup({ id: "group-1", classCode: "53382", members: ["user-1", "user-2"] });
    return vi.fn();
  });
  subscribeToMessages.mockImplementation(({ onMessages }) => {
    onMessages([]);
    return vi.fn();
  });
  sendMessage.mockResolvedValue("message-1");
});

describe("ChatPage", () => {
  test("shows the class name and code in the header", async () => {
    renderPage();

    expect(await screen.findByText("ソフトウェア開発論（53382）")).toBeTruthy();
  });

  test("falls back when class data is missing", async () => {
    subscribeToGroup.mockImplementationOnce(({ onGroup }) => {
      onGroup({ id: "group-1", classCode: "99999", members: ["user-1", "user-2"] });
      return vi.fn();
    });

    renderPage();

    expect(await screen.findByText("授業コード: 99999")).toBeTruthy();
  });

  test("shows an error when the group subscription fails", async () => {
    subscribeToGroup.mockImplementationOnce(({ onError }) => {
      onError(new Error("permission denied"));
      return vi.fn();
    });

    renderPage();

    expect(await screen.findByText("permission denied")).toBeTruthy();
  });

  test("shows an error when the target group does not exist", async () => {
    subscribeToGroup.mockImplementationOnce(({ onGroup }) => {
      onGroup(null);
      return vi.fn();
    });

    renderPage();

    expect(await screen.findByText("対象のチャットが見つかりません。")).toBeTruthy();
    expect(screen.getByPlaceholderText("メッセージ").disabled).toBe(true);
    expect(screen.getByRole("button", { name: "送信" }).disabled).toBe(true);
  });

  test("clears the input after a successful send", async () => {
    renderPage();
    const input = screen.getByPlaceholderText("メッセージ");

    fireEvent.change(input, { target: { value: "こんにちは" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(input.value).toBe("");
    });
    expect(sendMessage).toHaveBeenCalledWith({
      groupId: "group-1",
      senderId: "user-1",
      text: "こんにちは",
    });
  });

  test("keeps the input when sending fails", async () => {
    sendMessage.mockRejectedValueOnce(new Error("送信できません"));
    renderPage();
    const input = screen.getByPlaceholderText("メッセージ");

    fireEvent.change(input, { target: { value: "残す本文" } });
    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    await screen.findByText("送信できません");
    expect(input.value).toBe("残す本文");
  });

  test("does not send on Enter while Japanese IME conversion is active", () => {
    renderPage();
    const input = screen.getByPlaceholderText("メッセージ");

    fireEvent.change(input, { target: { value: "変換中" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });

    expect(sendMessage).not.toHaveBeenCalled();
  });

  test("returns to /chats from the back button", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "チャット一覧に戻る" }));

    expect(screen.getByTestId("location").textContent).toBe("/chats");
  });
});
