import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  sendMessage,
  subscribeToGroup,
  subscribeToMessages,
  validateMessage,
} from "./chatService";
import { onSnapshot, writeBatch } from "firebase/firestore";

const batchSet = vi.fn();
const batchUpdate = vi.fn();
const batchCommit = vi.fn();

vi.mock("../firebase", () => ({ db: { name: "mock-db" } }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn((...path) => ({ type: "collection", path })),
  doc: vi.fn((...args) => {
    if (args[0]?.type === "collection") {
      return { id: "generated-message-id", path: [...args[0].path, "generated-message-id"] };
    }
    return { id: args.at(-1), path: args.slice(1) };
  }),
  onSnapshot: vi.fn(() => vi.fn()),
  orderBy: vi.fn((field, direction) => ({ field, direction })),
  query: vi.fn((...parts) => ({ parts })),
  serverTimestamp: vi.fn(() => "server-time"),
  where: vi.fn((field, operator, value) => ({ field, operator, value })),
  writeBatch: vi.fn(() => ({
    set: batchSet,
    update: batchUpdate,
    commit: batchCommit,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  batchCommit.mockResolvedValue(undefined);
});

describe("validateMessage", () => {
  test("rejects empty text", () => {
    expect(validateMessage("").ok).toBe(false);
  });

  test("rejects whitespace-only text", () => {
    expect(validateMessage("   ").ok).toBe(false);
  });

  test("accepts one character", () => {
    expect(validateMessage("あ").ok).toBe(true);
  });

  test("accepts 200 characters", () => {
    expect(validateMessage("a".repeat(200)).ok).toBe(true);
  });

  test("rejects 201 characters", () => {
    expect(validateMessage("a".repeat(201)).ok).toBe(false);
  });
});

describe("sendMessage", () => {
  test("creates a message and updates the parent group", async () => {
    await expect(sendMessage({
      groupId: "group-1",
      senderId: "user-1",
      text: " hello ",
    })).resolves.toBe("generated-message-id");

    expect(batchSet).toHaveBeenCalledWith(
      expect.objectContaining({ id: "generated-message-id" }),
      {
        senderId: "user-1",
        text: "hello",
        createdAt: "server-time",
      }
    );
    expect(batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ path: ["groups", "group-1"] }),
      {
        lastMessageAt: "server-time",
        lastMessageText: "hello",
        updatedAt: "server-time",
      }
    );
    expect(batchCommit).toHaveBeenCalledTimes(1);
  });

  test("returns errors to the caller on send failure", async () => {
    batchCommit.mockRejectedValueOnce(new Error("write failed"));

    await expect(sendMessage({
      groupId: "group-1",
      senderId: "user-1",
      text: "hello",
    })).rejects.toThrow("write failed");
  });

  test("does not write invalid messages", async () => {
    await expect(sendMessage({
      groupId: "group-1",
      senderId: "user-1",
      text: "",
    })).rejects.toThrow("メッセージを入力してください。");

    expect(writeBatch).not.toHaveBeenCalled();
  });
});

describe("subscribeToMessages", () => {
  test("returns the Firestore unsubscribe function", () => {
    const unsubscribe = vi.fn();
    onSnapshot.mockReturnValueOnce(unsubscribe);

    expect(subscribeToMessages({
      groupId: "group-1",
      onMessages: vi.fn(),
      onError: vi.fn(),
    })).toBe(unsubscribe);
  });

  test("passes Firestore errors to onError", () => {
    const onError = vi.fn();
    onSnapshot.mockImplementationOnce((_query, _next, errorHandler) => {
      errorHandler(new Error("permission denied"));
      return vi.fn();
    });

    subscribeToMessages({
      groupId: "group-1",
      onMessages: vi.fn(),
      onError,
    });

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "permission denied" }));
  });
});

describe("subscribeToGroup", () => {
  test("returns the Firestore unsubscribe function", () => {
    const unsubscribe = vi.fn();
    onSnapshot.mockReturnValueOnce(unsubscribe);

    expect(subscribeToGroup({
      groupId: "group-1",
      onGroup: vi.fn(),
      onError: vi.fn(),
    })).toBe(unsubscribe);
  });

  test("passes group data to onGroup", () => {
    const onGroup = vi.fn();
    onSnapshot.mockImplementationOnce((_ref, next) => {
      next({
        id: "group-1",
        exists: () => true,
        data: () => ({ classCode: "53382", members: ["user-1", "user-2"] }),
      });
      return vi.fn();
    });

    subscribeToGroup({
      groupId: "group-1",
      onGroup,
      onError: vi.fn(),
    });

    expect(onGroup).toHaveBeenCalledWith({
      id: "group-1",
      classCode: "53382",
      members: ["user-1", "user-2"],
    });
  });

  test("passes null when the group does not exist", () => {
    const onGroup = vi.fn();
    onSnapshot.mockImplementationOnce((_ref, next) => {
      next({
        id: "group-1",
        exists: () => false,
        data: () => undefined,
      });
      return vi.fn();
    });

    subscribeToGroup({
      groupId: "group-1",
      onGroup,
      onError: vi.fn(),
    });

    expect(onGroup).toHaveBeenCalledWith(null);
  });

  test("passes Firestore errors to onError", () => {
    const onError = vi.fn();
    onSnapshot.mockImplementationOnce((_ref, _next, errorHandler) => {
      errorHandler(new Error("permission denied"));
      return vi.fn();
    });

    subscribeToGroup({
      groupId: "group-1",
      onGroup: vi.fn(),
      onError,
    });

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "permission denied" }));
  });
});
