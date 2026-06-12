import { syllabusData } from "../data/syllabus";
import { filterClasses } from "../utils/classUtils";

const TIMETABLE_KEY = "timetable_entries";

export function searchClasses(keyword) {
  return filterClasses(syllabusData, keyword);
}

export function getClassByCode(code) {
  return syllabusData.find((c) => c.code === code) ?? null;
}

// Firestore未接続のため時間割をlocalStorageに仮保存する
// 各エントリは {code, name, day, period, syllabusUrl} の形式
export function getMyClasses() {
  const raw = localStorage.getItem(TIMETABLE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addClassToTimetable(entry) {
  const entries = getMyClasses();
  if (entries.some((e) => e.code === entry.code)) return;
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify([...entries, entry]));
}

export function removeClassFromTimetable(classCode) {
  const entries = getMyClasses();
  localStorage.setItem(
    TIMETABLE_KEY,
    JSON.stringify(entries.filter((e) => e.code !== classCode))
  );
}
