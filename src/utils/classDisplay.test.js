import { describe, expect, test } from "vitest";
import {
  findClassByCode,
  getClassDisplayName,
} from "./classDisplay";

const classes = [
  { code: "53382", name: "ソフトウェア開発論" },
  { code: "53364", name: "データ構造とアルゴリズム" },
];

describe("class display helpers", () => {
  test("finds a class by code", () => {
    expect(findClassByCode("53382", classes)?.name).toBe("ソフトウェア開発論");
  });

  test("formats class name and code", () => {
    expect(getClassDisplayName("53382", classes)).toBe("ソフトウェア開発論（53382）");
  });

  test("falls back when the class code is not in class data", () => {
    expect(getClassDisplayName("99999", classes)).toBe("授業コード: 99999");
  });
});
