import { syllabusData } from "../data/syllabus";
import { filterClasses } from "../utils/classUtils";

const TIMETABLE_STORAGE_KEY = "timetable_class_codes";

export function searchClasses(keyword) {
  return filterClasses(syllabusData, keyword);
}

export function getClassByCode(code) {
  return syllabusData.find((classItem) => classItem.code === code) ?? null;
}

// Firestore未接続のため、登録済み授業はlocalStorageに仮保存する
function loadRegisteredCodes() {
  const raw = localStorage.getItem(TIMETABLE_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveRegisteredCodes(codes) {
  localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(codes));
}

export function getMyClasses() {
  const codes = loadRegisteredCodes();
  return codes
    .map((code) => getClassByCode(code))
    .filter((classItem) => classItem !== null);
}

export function addClassToTimetable(classCode) {
  const codes = loadRegisteredCodes();
  if (codes.includes(classCode)) return;

  saveRegisteredCodes([...codes, classCode]);
}

export function removeClassFromTimetable(classCode) {
  const codes = loadRegisteredCodes();
  saveRegisteredCodes(codes.filter((code) => code !== classCode));
}
