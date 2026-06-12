import { describe, expect, test } from "vitest";
import { filterClasses, organizeByDayPeriod } from "./classUtils";

const sampleClasses = [
  { code: "IS101", name: "ソフトウェア開発論", day: "月", period: 1, teacher: "山田先生" },
  { code: "IS102", name: "データベース基礎", day: "火", period: 2, teacher: "佐藤先生" },
  { code: "IS103", name: "アルゴリズムとデータ構造", day: "月", period: 3, teacher: "鈴木先生" },
];

describe("filterClasses", () => {
  test("キーワードが空の場合は全件返す", () => {
    expect(filterClasses(sampleClasses, "")).toHaveLength(3);
    expect(filterClasses(sampleClasses, "  ")).toHaveLength(3);
  });

  test("授業名で絞り込める", () => {
    const result = filterClasses(sampleClasses, "データベース");
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("IS102");
  });

  test("授業コードで絞り込める", () => {
    const result = filterClasses(sampleClasses, "IS101");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("ソフトウェア開発論");
  });

  test("教員名で絞り込める", () => {
    const result = filterClasses(sampleClasses, "鈴木");
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("IS103");
  });

  test("マッチしないキーワードは空配列を返す", () => {
    expect(filterClasses(sampleClasses, "存在しない授業")).toHaveLength(0);
  });
});

describe("organizeByDayPeriod", () => {
  test("曜日・時限のマップを正しく作る", () => {
    const map = organizeByDayPeriod(sampleClasses);
    expect(map["月"][1].code).toBe("IS101");
    expect(map["月"][3].code).toBe("IS103");
    expect(map["火"][2].code).toBe("IS102");
  });

  test("登録のない曜日はundefinedになる", () => {
    const map = organizeByDayPeriod(sampleClasses);
    expect(map["水"]).toBeUndefined();
  });
});
