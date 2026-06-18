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

  test("空配列を渡すと空オブジェクトを返す", () => {
    const map = organizeByDayPeriod([]);
    expect(Object.keys(map)).toHaveLength(0);
  });

  test("1件のみのデータを正しくマップに格納する（境界値）", () => {
    const single = [{ code: "53382", name: "ソフトウェア開発論", day: "月", period: 1 }];
    const map = organizeByDayPeriod(single);
    expect(map["月"][1].code).toBe("53382");
  });
});

describe("filterClasses — 境界値・追加パターン", () => {
  test("空配列を渡すと常に空配列を返す", () => {
    expect(filterClasses([], "データ構造")).toHaveLength(0);
    expect(filterClasses([], "")).toHaveLength(0);
  });

  test("大文字・小文字を区別しない（英語コード部分一致）", () => {
    const data = [
      { code: "ENG101", name: "English A" },
      { code: "ENG102", name: "English B" },
    ];
    const result = filterClasses(data, "eng");
    expect(result.length).toBeGreaterThan(0);
  });

  test("1件のデータでキーワードが一致する場合に1件返す", () => {
    const single = [{ code: "53382", name: "ソフトウェア開発論" }];
    expect(filterClasses(single, "ソフトウェア")).toHaveLength(1);
  });

  test("1件のデータでキーワードが不一致の場合に0件返す", () => {
    const single = [{ code: "53382", name: "ソフトウェア開発論" }];
    expect(filterClasses(single, "存在しない")).toHaveLength(0);
  });
});
