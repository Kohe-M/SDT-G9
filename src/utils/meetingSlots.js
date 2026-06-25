export const MEETING_DAYS = ["月", "火", "水", "木", "金"];
export const MIN_PERIOD = 1;
export const MAX_PERIOD = 5;
export const MIN_SPAN = 1;

export function getMeetingSlots(classInfo) {
  if (!classInfo || !Array.isArray(classInfo.meetingSlots)) return [];
  return classInfo.meetingSlots;
}

export function hasMeetingSlots(classInfo) {
  return getMeetingSlots(classInfo).length > 0;
}

export function validateMeetingSlot(slot) {
  if (!slot || typeof slot !== "object" || Array.isArray(slot)) {
    return ["slot_object"];
  }

  const errors = [];
  const { day, period, span } = slot;

  if (!MEETING_DAYS.includes(day)) errors.push("day");
  if (!Number.isInteger(period) || period < MIN_PERIOD || period > MAX_PERIOD) {
    errors.push("period");
  }
  if (!Number.isInteger(span) || span < MIN_SPAN) {
    errors.push("span");
  }
  if (
    Number.isInteger(period) &&
    Number.isInteger(span) &&
    span >= MIN_SPAN &&
    period + span - 1 > MAX_PERIOD
  ) {
    errors.push("period_span");
  }

  return errors;
}

export function isValidMeetingSlot(slot) {
  return validateMeetingSlot(slot).length === 0;
}

export function validateMeetingSlots(meetingSlots) {
  if (!Array.isArray(meetingSlots)) {
    return [{ index: null, errors: ["meetingSlots_array"] }];
  }

  return meetingSlots.flatMap((slot, index) => {
    const errors = validateMeetingSlot(slot);
    return errors.length === 0 ? [] : [{ index, errors }];
  });
}

export function hasValidMeetingSlots(classInfo) {
  const slots = getMeetingSlots(classInfo);
  return slots.length > 0 && validateMeetingSlots(slots).length === 0;
}
