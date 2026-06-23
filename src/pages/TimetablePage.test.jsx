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

const classWithoutSyllabus = {
  code: "53384",
  name: "シラバスなし授業",
  room: "C303",
  day: "水",
  period: 3,
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

function seedClasses(classes) {
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify(classes));
}

describe("TimetablePage — マッチング導線", () => {
  test("登録済み授業カード本体を押すとシラバスを別タブで開く", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    seedRegisteredClass();
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "「登録済み授業」の授業カードを開く" }));

    expect(openSpy).toHaveBeenCalledWith(registeredClass.syllabusUrl, "_blank", "noopener");
  });

  test("登録済み授業カード本体のシラバスボタンはキーボード操作でもシラバスを別タブで開く", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    seedRegisteredClass();
    renderPage();

    const cardButton = screen.getByRole("button", { name: "「登録済み授業」の授業カードを開く" });
    fireEvent.keyDown(cardButton, { key: "Enter", code: "Enter" });
    fireEvent.click(cardButton);

    expect(openSpy).toHaveBeenCalledWith(registeredClass.syllabusUrl, "_blank", "noopener");
  });

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

  test.each([
    ["Enter", "Enter"],
    ["Space", " "],
  ])("マッチング操作の%sではシラバスを開かず対象マッチング画面へ遷移する", (_label, key) => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    seedRegisteredClass();
    renderPage();

    const matchingButton = screen.getByRole("button", { name: "「登録済み授業」のマッチングを探す" });
    fireEvent.keyDown(matchingButton, { key });
    expect(openSpy).not.toHaveBeenCalled();

    fireEvent.click(matchingButton);

    expect(openSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId("pathname").textContent).toBe(matchingPath({ classCode: registeredClass.code }));
  });

  test.each([
    ["Enter", "Enter"],
    ["Space", " "],
  ])("削除操作の%sではシラバスを開かず対象授業だけが時間割から消える", (_label, key) => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    seedClasses([registeredClass, secondClass]);
    renderPage();

    const deleteButton = screen.getByRole("button", { name: "「登録済み授業」を削除" });
    fireEvent.keyDown(deleteButton, { key });
    expect(openSpy).not.toHaveBeenCalled();

    fireEvent.click(deleteButton);

    expect(openSpy).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(TIMETABLE_KEY))).toEqual([secondClass]);
  });

  test("syllabusUrl がない授業にはカード本体用のシラバスボタンを表示しない", () => {
    seedClasses([classWithoutSyllabus]);
    renderPage();

    expect(screen.queryByRole("button", { name: "「シラバスなし授業」の授業カードを開く" })).toBeNull();
  });
});
