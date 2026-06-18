import { describe, it, expect } from "vitest";
import { toArray } from "./profileUtils";

describe("toArray — Firestoreデータの後方互換変換", () => {
  it("配列はそのまま返す", () => {
    expect(toArray(["がっつり", "ほどほど"])).toEqual(["がっつり", "ほどほど"]);
  });

  it("空配列はそのまま返す", () => {
    expect(toArray([])).toEqual([]);
  });

  it("文字列（旧フォーマット）は要素1の配列に変換する", () => {
    expect(toArray("がっつり")).toEqual(["がっつり"]);
  });

  it("空文字は空配列を返す", () => {
    expect(toArray("")).toEqual([]);
  });

  it("undefinedは空配列を返す", () => {
    expect(toArray(undefined)).toEqual([]);
  });

  it("nullは空配列を返す", () => {
    expect(toArray(null)).toEqual([]);
  });

  // Firestore保存形式の仕様確認: 常に string[] として保存される
  it("保存値の型が配列であることを明示", () => {
    const saved = ["前の方に座る", "課題は早め"];
    expect(Array.isArray(saved)).toBe(true);
    expect(toArray(saved)).toEqual(saved);
  });
});
