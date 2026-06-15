/**
 * ルーティング・画面スモークテスト
 * - 実際の AppRoutesContent（ルート定義）をMemoryRouterで動かして検証する
 * - Firebase未接続のため認証・Firestoreは一切使わない
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppRoutesContent } from "./AppRoutes";

afterEach(cleanup);
beforeEach(() => localStorage.clear());

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutesContent />
    </MemoryRouter>
  );
}

// ─── ルーティング ───

describe("ルーティング — 各パスが正しい画面を表示する", () => {
  test("/ → ホーム画面が描画される", () => {
    renderAt("/");
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });

  test("/login → ログイン画面のプレースホルダーが描画される", () => {
    renderAt("/login");
    expect(screen.getByText(/ログイン画面/)).toBeTruthy();
  });

  test("/profile → プロフィール画面のプレースホルダーが描画される", () => {
    renderAt("/profile");
    expect(screen.getByText(/プロフィール画面/)).toBeTruthy();
  });

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
    expect(screen.getByText(/マッチング確認画面/)).toBeTruthy();
  });

  test("/chat/test-group → チャット画面が描画される", () => {
    renderAt("/chat/test-group");
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });
});

// ─── BottomTabBar の表示制御 ───

describe("BottomTabBar — 表示・非表示の制御", () => {
  test("/ → BottomTabBarが表示される", () => {
    renderAt("/");
    expect(screen.getByText("ぼっち")).toBeTruthy();
  });

  test("/timetable → BottomTabBarの時間割タブが表示される", () => {
    renderAt("/timetable");
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

// ─── ClassSearchPage ───

describe("ClassSearchPage — 検索・0件表示", () => {
  test("初期表示で0件メッセージが出ていない", () => {
    renderAt("/classes/search");
    expect(screen.queryByText(/該当する授業が見つかりませんでした/)).toBeNull();
  });
});
