import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import ChatPage from "./ChatPage";
import { auth } from "../firebase";
import { sendMessage, subscribeToMessages } from "../services/chatService";

vi.mock("../firebase", () => ({ auth: { currentUser: { uid: "user-1" } } }));
vi.mock("../services/chatService", () => ({
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
  subscribeToMessages.mockImplementation(({ onMessages }) => {
    onMessages([]);
    return vi.fn();
  });
  sendMessage.mockResolvedValue("message-1");
});

describe("ChatPage", () => {
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
