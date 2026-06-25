import { syllabusData } from "../data/syllabus";

function normalizeCode(classCode) {
  if (classCode === undefined || classCode === null) return "";
  return String(classCode).trim();
}

export function findClassByCode(classCode, classes = syllabusData) {
  const code = normalizeCode(classCode);
  if (!code) return null;
  return classes.find((classItem) => normalizeCode(classItem.code) === code) ?? null;
}

export function getClassDisplayName(classCode, classes = syllabusData) {
  const code = normalizeCode(classCode);
  if (!code) return "授業コード: 未設定";

  const classItem = findClassByCode(code, classes);
  if (!classItem?.name) return `授業コード: ${code}`;

  return `${classItem.name}（${code}）`;
}
