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

const secondClass = {
  code: "53383",
  name: "残る授業",
  room: "B202",
  day: "火",
  period: 2,
  syllabusUrl: "https://example.test/second-syllabus",
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

function seedClasses(classes = [registeredClass]) {
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify(classes));
}

function openClassDetail() {
  fireEvent.click(screen.getByRole("button", { name: "「登録済み授業」の詳細を開く" }));
}

describe("TimetablePage — マッチング導線", () => {
  test("登録済み授業セルから詳細を開き、大きいマッチング操作で対象授業の画面へ遷移する", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    seedClasses();
    renderPage();

    openClassDetail();
    const matchingButton = screen.getByRole("button", { name: "「登録済み授業」のマッチングを探す" });

    expect(matchingButton.textContent).toBe("この授業で相手を探す");
    fireEvent.click(matchingButton);

    expect(openSpy).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(TIMETABLE_KEY))).toEqual([registeredClass]);
    expect(screen.getByTestId("pathname").textContent).toBe(matchingPath({ classCode: registeredClass.code }));
  });

  test("シラバス操作はマッチングへ遷移せず、授業も削除しない", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    seedClasses();
    renderPage();

    openClassDetail();
    fireEvent.click(screen.getByRole("button", { name: "「登録済み授業」のシラバスを開く" }));

    expect(openSpy).toHaveBeenCalledWith(registeredClass.syllabusUrl, "_blank", "noopener");
    expect(JSON.parse(localStorage.getItem(TIMETABLE_KEY))).toEqual([registeredClass]);
    expect(screen.getByTestId("pathname").textContent).toBe("/timetable");
  });

  test("削除操作はシラバスを開かず、マッチングへも遷移しない", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    seedClasses([registeredClass, secondClass]);
    renderPage();

    openClassDetail();
    fireEvent.click(screen.getByRole("button", { name: "「登録済み授業」を削除" }));

    expect(openSpy).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(TIMETABLE_KEY))).toEqual([secondClass]);
    expect(screen.getByTestId("pathname").textContent).toBe("/timetable");
  });

  test("空の時間割セルにはマッチング操作を表示しない", () => {
    renderPage();

    expect(screen.queryByRole("button", { name: /マッチングを探す/ })).toBeNull();
  });
});
