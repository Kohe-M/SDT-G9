import { describe, expect, test } from "vitest";
import { filterClasses, organizeByDayPeriod } from "./classUtils";

const sampleClasses = [
  { code: "53382", name: "ソフトウェア開発論", syllabusUrl: "https://example.com/53382" },
  { code: "53364", name: "データ構造とアルゴリズム", syllabusUrl: "https://example.com/53364" },
  { code: "53410", name: "オブジェクト指向論", syllabusUrl: "https://example.com/53410" },
];

const sampleTimetable = [
  { code: "53382", name: "ソフトウェア開発論", day: "月", period: 1, syllabusUrl: "https://example.com/53382" },
  { code: "53364", name: "データ構造とアルゴリズム", day: "火", period: 2, syllabusUrl: "https://example.com/53364" },
  { code: "53410", name: "オブジェクト指向論", day: "月", period: 3, syllabusUrl: "https://example.com/53410" },
];

describe("filterClasses", () => {
  test("キーワードが空の場合は全件返す", () => {
    expect(filterClasses(sampleClasses, "")).toHaveLength(3);
    expect(filterClasses(sampleClasses, "  ")).toHaveLength(3);
  });

  test("授業名で絞り込める", () => {
    const result = filterClasses(sampleClasses, "データ構造");
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("53364");
  });

  test("授業コードで絞り込める", () => {
    const result = filterClasses(sampleClasses, "53382");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("ソフトウェア開発論");
  });

  test("マッチしないキーワードは空配列を返す", () => {
    expect(filterClasses(sampleClasses, "存在しない授業")).toHaveLength(0);
  });
});

describe("organizeByDayPeriod", () => {
  test("曜日・時限のマップを正しく作る", () => {
    const map = organizeByDayPeriod(sampleTimetable);
    expect(map["月"][1].code).toBe("53382");
    expect(map["月"][3].code).toBe("53410");
    expect(map["火"][2].code).toBe("53364");
  });

  test("登録のない曜日はundefinedになる", () => {
    const map = organizeByDayPeriod(sampleTimetable);
    expect(map["水"]).toBeUndefined();
  });
});
