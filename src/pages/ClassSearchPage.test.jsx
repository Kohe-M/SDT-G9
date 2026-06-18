import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ClassSearchPage from "./ClassSearchPage";
import * as classService from "../services/classService";

afterEach(cleanup);
beforeEach(() => localStorage.clear());

function renderPage() {
  return render(
    <MemoryRouter>
      <ClassSearchPage />
    </MemoryRouter>
  );
}

function searchAndOpenPanel(keyword = "英語") {
  const input = screen.getByPlaceholderText("授業名・授業コードで検索");
  fireEvent.change(input, { target: { value: keyword } });
  fireEvent.submit(input.closest("form"));

  // 最初の検索結果の「追加」ボタンをクリックして登録パネルを開く
  const addButtons = screen.getAllByText("追加");
  fireEvent.click(addButtons[0]);
}

describe("ClassSearchPage — 授業登録フロー", () => {
  test("正常登録時に成功トーストが表示される", async () => {
    vi.spyOn(classService, "addClassToTimetable").mockReturnValue("ok");
    renderPage();
    searchAndOpenPanel();

    fireEvent.click(screen.getByText("時間割に登録する"));

    await waitFor(() => {
      expect(screen.getByText(/に追加しました/)).toBeTruthy();
    });
  });

  test("duplicate_code のとき エラートーストが表示される（登録パネルは閉じない）", async () => {
    vi.spyOn(classService, "addClassToTimetable").mockReturnValue("duplicate_code");
    renderPage();
    searchAndOpenPanel();

    fireEvent.click(screen.getByText("時間割に登録する"));

    await waitFor(() => {
      expect(screen.getByText(/すでに時間割に登録されています/)).toBeTruthy();
    });
    // 登録パネルは閉じず「時間割に登録する」ボタンが残っている
    expect(screen.getByText("時間割に登録する")).toBeTruthy();
  });

  test("duplicate_slot のときエラートーストが表示される（登録パネルは閉じない）", async () => {
    vi.spyOn(classService, "addClassToTimetable").mockReturnValue("duplicate_slot");
    renderPage();
    searchAndOpenPanel();

    fireEvent.click(screen.getByText("時間割に登録する"));

    await waitFor(() => {
      expect(screen.getByText(/にはすでに授業が登録されています/)).toBeTruthy();
    });
    expect(screen.getByText("時間割に登録する")).toBeTruthy();
  });

  test("成功後は登録パネルが閉じる（setRegistering(null)が呼ばれる）", async () => {
    vi.spyOn(classService, "addClassToTimetable").mockReturnValue("ok");
    renderPage();
    searchAndOpenPanel();

    fireEvent.click(screen.getByText("時間割に登録する"));

    await waitFor(() => {
      expect(screen.queryByText("時間割に登録する")).toBeNull();
    });
  });
});

describe("ClassSearchPage — 検索結果0件", () => {
  test("存在しないキーワードで0件メッセージを表示する", () => {
    renderPage();
    const input = screen.getByPlaceholderText("授業名・授業コードで検索");
    fireEvent.change(input, { target: { value: "zzz絶対に存在しない授業名zzz" } });
    fireEvent.submit(input.closest("form"));
    expect(screen.getByText(/該当する授業が見つかりませんでした/)).toBeTruthy();
  });
});
