const trimText = (value) =>
  typeof value === "string" ? value.trim() : value;

export const buildUserProfileData = ({ uid, displayName, email }) => ({
  uid,
  displayName: trimText(displayName),
  email: trimText(email),
});

export const buildClassData = ({
  classId,
  className,
  dayOfWeek,
  period,
}) => ({
  classId,
  className: trimText(className),
  dayOfWeek,
  period,
});

export const buildMessageData = ({
  groupId,
  userId,
  text,
  createdAt,
}) => ({
  groupId,
  userId,
  text: trimText(text),
  createdAt,
});
