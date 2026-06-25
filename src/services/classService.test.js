import { beforeEach, describe, expect, test } from "vitest";
import {
  addClassToTimetable,
  getClassByCode,
  getInvalidSyllabusMeetingSlots,
  getMeetingSlotsByClassCode,
  getMyClasses,
  hasMeetingSlotsByClassCode,
  removeClassFromTimetable,
  searchClasses,
} from "./classService";
import { syllabusData } from "../data/syllabus";

beforeEach(() => {
  localStorage.clear();
});

// ─────────────────── getClassByCode ───────────────────

describe("getClassByCode", () => {
  test("存在するコードで正しい授業情報を返す", () => {
    const cls = getClassByCode("53124");
    expect(cls).not.toBeNull();
    expect(cls.code).toBe("53124");
    expect(typeof cls.name).toBe("string");
    expect(cls.name.length).toBeGreaterThan(0);
  });

  test("存在しないコードでnullを返す", () => {
    expect(getClassByCode("00000")).toBeNull();
  });

  test("空文字でnullを返す", () => {
    expect(getClassByCode("")).toBeNull();
  });

  test("9桁の範囲外コードでnullを返す", () => {
    expect(getClassByCode("99999999")).toBeNull();
  });
});

describe("meeting slot data", () => {
  test("all production syllabus records expose meetingSlots as an array", () => {
    expect(syllabusData.length).toBeGreaterThan(0);
    expect(syllabusData.every((classInfo) => Array.isArray(classInfo.meetingSlots))).toBe(true);
  });

  test("classes without confirmed meeting slots are distinguishable", () => {
    expect(getMeetingSlotsByClassCode("53124")).toEqual([]);
    expect(hasMeetingSlotsByClassCode("53124")).toBe(false);
  });

  test("missing class codes have no meeting slots", () => {
    expect(getMeetingSlotsByClassCode("00000")).toEqual([]);
    expect(hasMeetingSlotsByClassCode("00000")).toBe(false);
  });

  test("production syllabus meetingSlots contain no invalid values", () => {
    expect(getInvalidSyllabusMeetingSlots()).toEqual([]);
  });
});

// ─────────────────── searchClasses ───────────────────

describe("searchClasses", () => {
  test("存在しないキーワードで空配列を返す（0件）", () => {
    const result = searchClasses("zzzxxx授業名存在しないzzz");
    expect(result).toHaveLength(0);
  });

  test("空キーワードで全シラバスを返す", () => {
    const result = searchClasses("");
    expect(result.length).toBeGreaterThan(0);
  });

  test("授業コードの部分一致で絞り込める", () => {
    const result = searchClasses("53124");
    const codes = result.map((c) => c.code);
    expect(codes).toContain("53124");
  });
});

// ─────────────────── addClassToTimetable / getMyClasses ───────────────────

const ENTRY_A = {
  code: "53124",
  name: "英語初級 103",
  day: "月",
  period: 1,
  room: "H346",
  syllabusUrl: "https://example.com/53124",
};

const ENTRY_B = {
  code: "53382",
  name: "ソフトウェア開発論",
  day: "火",
  period: 2,
  room: "A201",
  syllabusUrl: "https://example.com/53382",
};

describe("getMyClasses", () => {
  test("localStorage未登録の場合は空配列を返す", () => {
    expect(getMyClasses()).toEqual([]);
  });

  test("localStorage が破損JSON の場合は空配列を返し、キーを削除する", () => {
    localStorage.setItem("timetable_entries", "not-valid-json{{{");
    expect(getMyClasses()).toEqual([]);
    expect(localStorage.getItem("timetable_entries")).toBeNull();
  });

  test("localStorage がオブジェクトJSON ({}) の場合は空配列を返し、キーを削除する", () => {
    localStorage.setItem("timetable_entries", JSON.stringify({}));
    expect(getMyClasses()).toEqual([]);
    expect(localStorage.getItem("timetable_entries")).toBeNull();
  });

  test("localStorage が文字列JSON の場合は空配列を返し、キーを削除する", () => {
    localStorage.setItem("timetable_entries", JSON.stringify("hello"));
    expect(getMyClasses()).toEqual([]);
    expect(localStorage.getItem("timetable_entries")).toBeNull();
  });

  test("localStorage が数値JSON の場合は空配列を返し、キーを削除する", () => {
    localStorage.setItem("timetable_entries", JSON.stringify(42));
    expect(getMyClasses()).toEqual([]);
    expect(localStorage.getItem("timetable_entries")).toBeNull();
  });
});

describe("addClassToTimetable", () => {
  test("授業を1件追加できる", () => {
    addClassToTimetable(ENTRY_A);
    const classes = getMyClasses();
    expect(classes).toHaveLength(1);
    expect(classes[0].code).toBe("53124");
  });

  test("異なるコードを複数追加できる", () => {
    addClassToTimetable(ENTRY_A);
    addClassToTimetable(ENTRY_B);
    expect(getMyClasses()).toHaveLength(2);
  });

  test("同一コードを2回追加しても1件のまま（重複防止）", () => {
    addClassToTimetable(ENTRY_A);
    const result = addClassToTimetable(ENTRY_A);
    expect(result).toBe("duplicate_code");
    expect(getMyClasses()).toHaveLength(1);
  });

  test("同一コードを3回追加しても1件のまま（境界値）", () => {
    addClassToTimetable(ENTRY_A);
    addClassToTimetable(ENTRY_A);
    addClassToTimetable(ENTRY_A);
    expect(getMyClasses()).toHaveLength(1);
  });

  test("同じ曜日・時限に別コードを追加すると弾かれる（スロット重複）", () => {
    addClassToTimetable(ENTRY_A); // 月1限
    const sameSlot = { ...ENTRY_B, day: "月", period: 1 };
    const result = addClassToTimetable(sameSlot);
    expect(result).toBe("duplicate_slot");
    expect(getMyClasses()).toHaveLength(1);
  });

  test("正常追加時に ok を返す", () => {
    expect(addClassToTimetable(ENTRY_A)).toBe("ok");
  });
});

// ─────────────────── removeClassFromTimetable ───────────────────

describe("removeClassFromTimetable", () => {
  test("指定したコードの授業を削除する", () => {
    addClassToTimetable(ENTRY_A);
    addClassToTimetable(ENTRY_B);
    removeClassFromTimetable("53124");
    const classes = getMyClasses();
    expect(classes).toHaveLength(1);
    expect(classes[0].code).toBe("53382");
  });

  test("削除後も他の授業が残る", () => {
    addClassToTimetable(ENTRY_A);
    addClassToTimetable(ENTRY_B);
    removeClassFromTimetable("53382");
    const classes = getMyClasses();
    expect(classes).toHaveLength(1);
    expect(classes[0].code).toBe("53124");
  });

  test("存在しないコードを削除しても件数が変わらない", () => {
    addClassToTimetable(ENTRY_A);
    removeClassFromTimetable("00000");
    expect(getMyClasses()).toHaveLength(1);
  });

  test("空の時間割に削除操作をしても0件のまま", () => {
    removeClassFromTimetable("53124");
    expect(getMyClasses()).toHaveLength(0);
  });

  test("1件のみ登録後に削除すると0件になる（境界値）", () => {
    addClassToTimetable(ENTRY_A);
    removeClassFromTimetable("53124");
    expect(getMyClasses()).toHaveLength(0);
  });
});
