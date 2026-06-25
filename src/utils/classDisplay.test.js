import { describe, expect, test } from "vitest";
import {
  findClassByCode,
  getClassDisplayName,
  getClassScheduleLabel,
} from "./classDisplay";

const classes = [
  { code: "53382", name: "ソフトウェア開発論", day: "月", period: 1 },
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

  test("returns a schedule label when day and period are available", () => {
    expect(getClassScheduleLabel("53382", classes)).toBe("月1限");
  });

  test("returns an empty schedule label when day or period is unavailable", () => {
    expect(getClassScheduleLabel("53364", classes)).toBe("");
  });
});
