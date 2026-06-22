import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import TimetablePage from "./TimetablePage";
import { matchingPath } from "../constants/routes";

const TIMETABLE_KEY = "timetable_entries";

const registeredClass = {
  code: "53382",
  name: "登録済み授業",
  room: "A101",
  day: "月",
  period: 1,
  syllabusUrl: "https://example.test/syllabus",
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => localStorage.clear());

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/timetable"]}>
      <TimetablePage />
      <LocationProbe />
    </MemoryRouter>
  );
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="pathname">{location.pathname}</div>;
}

function seedRegisteredClass() {
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify([registeredClass]));
}

describe("TimetablePage — マッチング導線", () => {
  test("登録済み授業のマッチング操作から対象授業のマッチング画面へ遷移する", () => {
    seedRegisteredClass();
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "「登録済み授業」のマッチングを探す" }));

    expect(screen.getByTestId("pathname").textContent).toBe(matchingPath({ classCode: registeredClass.code }));
  });

  test("空の時間割セルにはマッチング操作を表示しない", () => {
    renderPage();

    expect(screen.queryByRole("button", { name: /マッチングを探す/ })).toBeNull();
  });

  test("マッチング操作を押してもシラバスを開かず授業も削除しない", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    seedRegisteredClass();
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "「登録済み授業」のマッチングを探す" }));

    expect(openSpy).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(TIMETABLE_KEY))).toEqual([registeredClass]);
  });
});
