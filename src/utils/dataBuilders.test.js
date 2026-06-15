import { describe, expect, it } from "vitest";
import {
  buildClassData,
  buildMessageData,
  buildUserProfileData,
} from "./dataBuilders";

describe("buildUserProfileData", () => {
  it("プロフィール保存用のデータを作る", () => {
    expect(
      buildUserProfileData({
        uid: "user-1",
        displayName: "  山田太郎  ",
        email: "  student@example.com  ",
      }),
    ).toEqual({
      uid: "user-1",
      displayName: "山田太郎",
      email: "student@example.com",
    });
  });
});

describe("buildClassData", () => {
  it("授業保存用のデータを作る", () => {
    expect(
      buildClassData({
        classId: "class-1",
        className: "  ソフトウェア開発技法  ",
        dayOfWeek: "土",
        period: 2,
      }),
    ).toEqual({
      classId: "class-1",
      className: "ソフトウェア開発技法",
      dayOfWeek: "土",
      period: 2,
    });
  });
});

describe("buildMessageData", () => {
  it("メッセージ保存用のデータを作り、受け取った日時を保持する", () => {
    const createdAt = new Date("2026-06-13T09:00:00.000Z");

    expect(
      buildMessageData({
        groupId: "group-1",
        userId: "user-1",
        text: "  テストメッセージ  ",
        createdAt,
      }),
    ).toEqual({
      groupId: "group-1",
      userId: "user-1",
      text: "テストメッセージ",
      createdAt,
    });
  });
});
