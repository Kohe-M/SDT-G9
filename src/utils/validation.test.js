import { describe, expect, it } from "vitest";
import {
  validateClassName,
  validateDisplayName,
  validateEmail,
  validateMessageText,
  validatePassword,
} from "./validation";

describe("validateEmail", () => {
  it("空文字をエラーにする", () => {
    expect(validateEmail("")).toEqual({
      ok: false,
      message: "メールアドレスを入力してください。",
    });
  });

  it("@を含まない文字列をエラーにする", () => {
    expect(validateEmail("student.example.com").ok).toBe(false);
  });

  it("通常のメール形式を正常とする", () => {
    expect(validateEmail("student@example.com")).toEqual({ ok: true });
  });
});

describe("validatePassword", () => {
  it("空文字をエラーにする", () => {
    expect(validatePassword("").ok).toBe(false);
  });

  it("5文字をエラーにする", () => {
    expect(validatePassword("a".repeat(5)).ok).toBe(false);
  });

  it("6文字を正常とする", () => {
    expect(validatePassword("a".repeat(6))).toEqual({ ok: true });
  });
});

describe("validateDisplayName", () => {
  it.each(["", " "])("%jをエラーにする", (name) => {
    expect(validateDisplayName(name).ok).toBe(false);
  });

  it.each([1, 20])("%i文字を正常とする", (length) => {
    expect(validateDisplayName("a".repeat(length))).toEqual({ ok: true });
  });

  it("21文字をエラーにする", () => {
    expect(validateDisplayName("a".repeat(21)).ok).toBe(false);
  });
});

describe("validateClassName", () => {
  it.each(["", "   "])("%jをエラーにする", (className) => {
    expect(validateClassName(className).ok).toBe(false);
  });

  it.each([1, 50])("%i文字を正常とする", (length) => {
    expect(validateClassName("a".repeat(length))).toEqual({ ok: true });
  });

  it("51文字をエラーにする", () => {
    expect(validateClassName("a".repeat(51)).ok).toBe(false);
  });
});

describe("validateMessageText", () => {
  it.each(["", "\t"])("%jをエラーにする", (text) => {
    expect(validateMessageText(text).ok).toBe(false);
  });

  it.each([1, 500])("%i文字を正常とする", (length) => {
    expect(validateMessageText("a".repeat(length))).toEqual({ ok: true });
  });

  it("501文字をエラーにする", () => {
    expect(validateMessageText("a".repeat(501)).ok).toBe(false);
  });
});
