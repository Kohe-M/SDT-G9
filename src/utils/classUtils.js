export function filterClasses(classes, keyword) {
  if (!keyword || keyword.trim() === "") return classes;

  const lower = keyword.toLowerCase().trim();
  return classes.filter(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      c.teacher.toLowerCase().includes(lower) ||
      c.code.toLowerCase().includes(lower)
  );
}

export function organizeByDayPeriod(classes) {
  const map = {};
  for (const c of classes) {
    if (!map[c.day]) map[c.day] = {};
    map[c.day][c.period] = c;
  }
  return map;
}
