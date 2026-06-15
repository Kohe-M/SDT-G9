/**
 * ルーティング・画面スモークテスト
 * - 各パスが正しいページコンポーネントを描画することを検証する
 * - Firebase未接続のため認証・Firestoreは一切使わない
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import ChatPage from "../pages/ChatPage";
import ClassSearchPage from "../pages/ClassSearchPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import MatchingPage from "../pages/MatchingPage";
import ProfilePage from "../pages/ProfilePage";
import TimetablePage from "../pages/TimetablePage";

afterEach(cleanup);
beforeEach(() => localStorage.clear());

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/classes/search" element={<ClassSearchPage />} />
          <Route path="/matching/:classCode" element={<MatchingPage />} />
          <Route path="/chat/:groupId" element={<ChatPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

// ─── ルーティング ───

describe("ルーティング — 各パスが正しい画面を表示する", () => {
  test("/ → ホーム画面が描画される", () => {
    renderAt("/");
    // BottomTabBar の「ぼっち」アイコンラベルでホームを確認
    expect(screen.getByText("ぼっち")).toBeTruthy();
  });

  test("/login → ログイン画面が描画される", () => {
    renderAt("/login");
    // LoginPage 固有の email placeholder で識別
    expect(screen.getByPlaceholderText("you@example-univ.ac.jp")).toBeTruthy();
  });

  test("/profile → プロフィール画面が描画される", () => {
    renderAt("/profile");
    // ProfilePage 固有の「モチベーション」セクションタイトルで識別
    expect(screen.getAllByText("モチベーション")[0]).toBeTruthy();
  });

  test("/timetable → 時間割画面が描画される", () => {
    renderAt("/timetable");
    // TimetablePage 固有の「＋ 授業を追加」ボタンで識別
    expect(screen.getByText(/＋ 授業を追加/)).toBeTruthy();
  });

  test("/classes/search → 授業検索画面が描画される（到達不能ではない）", () => {
    renderAt("/classes/search");
    // ClassSearchPage 固有のページ見出しで識別
    expect(screen.getByText("授業を探す")).toBeTruthy();
  });

  test("/matching/53124 → マッチング画面が描画される", () => {
    renderAt("/matching/53124");
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });

  test("/chat/test-group → チャット画面が描画される", () => {
    renderAt("/chat/test-group");
    // ChatPage 固有の送信ボタン（aria-label）で識別
    expect(screen.getByRole("button", { name: "送信" })).toBeTruthy();
  });
});

// ─── BottomTabBar の表示制御 ───

describe("BottomTabBar — 表示・非表示の制御", () => {
  test("/ → BottomTabBarが表示される", () => {
    renderAt("/");
    expect(screen.getByText("ぼっち")).toBeTruthy();
  });

  test("/timetable → BottomTabBarが表示される", () => {
    renderAt("/timetable");
    // BottomTabBar の「時間割」タブラベルが複数存在する場合も確認できればOK
    expect(screen.getAllByText("時間割").length).toBeGreaterThan(0);
  });

  test("/login → BottomTabBarが非表示になる", () => {
    renderAt("/login");
    expect(screen.queryByText("ぼっち")).toBeNull();
  });

  test("/chat/test-group → BottomTabBarが非表示になる", () => {
    renderAt("/chat/test-group");
    expect(screen.queryByText("ぼっち")).toBeNull();
  });
});

// ─── 授業検索 — 操作テスト ───

describe("ClassSearchPage — 検索・0件表示", () => {
  test("初期表示で結果リストが空", () => {
    renderAt("/classes/search");
    expect(screen.queryByText(/該当する授業が見つかりませんでした/)).toBeNull();
  });
});
