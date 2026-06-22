import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AppRoutesContent } from "./AppRoutes";
import { loginUser, observeAuthState, registerUser } from "../services/authService";

vi.mock("../firebase", () => ({ auth: {}, db: {} }));
vi.mock("../services/authService", () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  logoutUser: vi.fn(),
  observeAuthState: vi.fn(),
}));
vi.mock("../services/userService", () => ({
  getUserProfile: vi.fn(() => Promise.resolve(null)),
  saveUserProfile: vi.fn(() => Promise.resolve()),
}));

const authUser = { uid: "user-1", email: "test@example.com" };
let currentAuthUser = null;

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocationProbe />
      <AppRoutesContent />
    </MemoryRouter>
  );
}

function expectPath(path) {
  expect(screen.getByTestId("location").textContent).toBe(path);
}

afterEach(cleanup);

beforeEach(() => {
  localStorage.clear();
  currentAuthUser = null;
  vi.clearAllMocks();
  observeAuthState.mockImplementation((callback) => {
    callback(currentAuthUser);
    return vi.fn();
  });
  loginUser.mockResolvedValue(authUser);
  registerUser.mockResolvedValue(authUser);
});

describe("routing and auth guard", () => {
  test("bottom tab bar shows the formal user navigation", () => {
    renderAt("/");

    expect(screen.getByRole("button", { name: "ホーム" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "時間割" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "チャット" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "プロフィール" })).toBeTruthy();
  });

  test("bottom tab links keep home, timetable, and chats routable", async () => {
    currentAuthUser = authUser;
    renderAt("/");

    fireEvent.click(screen.getByRole("button", { name: "時間割" }));
    expectPath("/timetable");

    fireEvent.click(screen.getByRole("button", { name: "ホーム" }));
    expectPath("/");

    fireEvent.click(screen.getByRole("button", { name: "チャット" }));
    await waitFor(() => expectPath("/chats"));
    expect(screen.getByRole("heading", { name: "チャット" })).toBeTruthy();
  });

  test("/login shows an in-page home return button", () => {
    renderAt("/login");

    fireEvent.click(screen.getByRole("button", { name: "ホームへ戻る" }));

    expectPath("/");
  });

  test("unauthenticated /matching/:classCode redirects to /login", async () => {
    renderAt("/matching/TEST101");

    await screen.findByPlaceholderText("you@example-univ.ac.jp");

    expectPath("/login");
  });

  test("unauthenticated /chats redirects to /login", async () => {
    renderAt("/chats");

    await screen.findByPlaceholderText("you@example-univ.ac.jp");

    expectPath("/login");
  });

  test("unauthenticated /profile redirects to /login", async () => {
    renderAt("/profile");

    await screen.findByPlaceholderText("you@example-univ.ac.jp");

    expectPath("/login");
  });

<<<<<<< HEAD
  test("/timetable → 時間割画面が描画される", () => {
    renderAt("/timetable");
    expect(screen.getByText(/＋ 授業を追加/)).toBeTruthy();
  });

  test("/classes/search → 授業検索画面が描画される（Navigate ではなく ClassSearchPage）", () => {
    renderAt("/classes/search");
    expect(screen.getByText("授業を探す")).toBeTruthy();
  });

  test("/matching/53124 → マッチング画面のプレースホルダーが描画される", () => {
    renderAt("/matching/53124");
    expect(screen.getByText(/マッチング確認/)).toBeTruthy();
  });

  test("/chat/test-group → チャット画面が描画される", () => {
    renderAt("/chat/test-group");

    await screen.findByPlaceholderText("you@example-univ.ac.jp");

    expectPath("/login");
  });

  test("authenticated users visiting /login are replaced to /timetable", async () => {
    currentAuthUser = authUser;
    renderAt("/login");

    await waitFor(() => expectPath("/timetable"));
  });

  test("login success returns to the guarded page from location state", async () => {
    loginUser.mockImplementation(async () => {
      currentAuthUser = authUser;
      return authUser;
    });
    const { container } = renderAt("/matching/TEST101");

    await screen.findByPlaceholderText("you@example-univ.ac.jp");
    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "password123" },
    });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expectPath("/matching/TEST101"));
  });

  test("authenticated /chat/:groupId has a home escape path", async () => {
    currentAuthUser = authUser;
    renderAt("/chat/test-group");

    await waitFor(() => expectPath("/chat/test-group"));
    expect(screen.getByRole("link", { name: "ホームへ戻る" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "ホームへ戻る" }));

    expectPath("/");
  });

  test("home does not expose a context-free matching shortcut", () => {
    renderAt("/");

    expect(screen.queryByRole("link", { name: "マッチング" })).toBeNull();
    expect(screen.queryByRole("link", { name: "チャット" })).toBeNull();
  });
});
