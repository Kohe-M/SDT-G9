import { describe, expect, test } from "vitest";
import {
  getMeetingSlots,
  hasMeetingSlots,
  hasValidMeetingSlots,
  isValidMeetingSlot,
  validateMeetingSlot,
  validateMeetingSlots,
} from "./meetingSlots";

describe("meeting slot validation", () => {
  test("accepts single, multiple, and spanning meeting slots", () => {
    expect(isValidMeetingSlot({ day: "月", period: 3, span: 1 })).toBe(true);
    expect(
      validateMeetingSlots([
        { day: "火", period: 2, span: 2 },
        { day: "木", period: 4, span: 1 },
      ])
    ).toEqual([]);
  });

  test("detects invalid day, period, and span values", () => {
    expect(validateMeetingSlot({ day: "日", period: 3, span: 1 })).toContain("day");
    expect(validateMeetingSlot({ day: "月", period: 0, span: 1 })).toContain("period");
    expect(validateMeetingSlot({ day: "月", period: 1, span: 0 })).toContain("span");
  });

  test("detects spanning slots that exceed fifth period", () => {
    expect(validateMeetingSlot({ day: "金", period: 5, span: 2 })).toContain("period_span");
  });

  test("detects non-array meetingSlots", () => {
    expect(validateMeetingSlots(null)).toEqual([
      { index: null, errors: ["meetingSlots_array"] },
    ]);
  });

  test("distinguishes classes with no meeting slots from valid scheduled classes", () => {
    const unscheduled = { code: "TEST-EMPTY", meetingSlots: [] };
    const scheduled = {
      code: "TEST-SCHEDULED",
      meetingSlots: [{ day: "水", period: 2, span: 1 }],
    };

    expect(getMeetingSlots({ code: "TEST-MISSING" })).toEqual([]);
    expect(hasMeetingSlots(unscheduled)).toBe(false);
    expect(hasValidMeetingSlots(unscheduled)).toBe(false);
    expect(hasMeetingSlots(scheduled)).toBe(true);
    expect(hasValidMeetingSlots(scheduled)).toBe(true);
  });
});
