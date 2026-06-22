export function homePath() {
  return "/";
}

export function loginPath() {
  return "/login";
}

export function profilePath() {
  return "/profile";
}

export function timetablePath() {
  return "/timetable";
}

export function classSearchPath() {
  return "/classes/search";
}

export function chatsPath() {
  return "/chats";
}

function requireRouteParam(value, name) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${name} is required`);
  }
  return String(value);
}

function appendQuery(path, params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function matchingPath({ classCode, dayOfWeek, period, term } = {}) {
  const path = `/matching/${encodeURIComponent(requireRouteParam(classCode, "classCode"))}`;
  return appendQuery(path, { dayOfWeek, period, term });
}

export function chatPath({ groupId } = {}) {
  return `/chat/${encodeURIComponent(requireRouteParam(groupId, "groupId"))}`;
}

export const ROUTES = {
  HOME: homePath(),
  LOGIN: loginPath(),
  PROFILE: profilePath(),
  TIMETABLE: timetablePath(),
  CLASS_SEARCH: classSearchPath(),
  CHATS: chatsPath(),
  MATCHING_TEST: matchingPath({ classCode: "TEST101" }),
  CHAT_TEST: chatPath({ groupId: "test-group" }),
};
