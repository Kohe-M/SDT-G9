import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  buildGroupId,
  cancelMatching,
  startMatching,
  subscribeMatchingCandidates,
  subscribeUserClassGroups,
  tryCreateGroup,
} from "./matchingService";
import { deleteDoc, getDoc, onSnapshot, runTransaction, setDoc } from "firebase/firestore";

vi.mock("../firebase", () => ({ db: { name: "mock-db" } }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn((...path) => ({ type: "collection", path })),
  deleteDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn((...args) => ({ id: args.at(-1), path: args.slice(1) })),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
  query: vi.fn((...parts) => ({ parts })),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => "server-time"),
  setDoc: vi.fn(() => Promise.resolve()),
  where: vi.fn((field, operator, value) => ({ field, operator, value })),
}));

function snapshot({ exists, data = {} }) {
  return {
    exists: () => exists,
    data: () => data,
  };
}

function queueDoc(id, data) {
  return {
    id,
    data: () => data,
  };
}

function mockTransaction({ userQueue, partnerQueue, group }) {
  const transaction = {
    get: vi.fn((ref) => {
      const key = ref.path.join("/");
      if (key === "matchingQueue/user-1") return Promise.resolve(userQueue);
      if (key === "matchingQueue/user-2") return Promise.resolve(partnerQueue);
      return Promise.resolve(group);
    }),
    set: vi.fn(),
    delete: vi.fn(),
  };

  runTransaction.mockImplementationOnce(async (_db, callback) => callback(transaction));
  return transaction;
}

const randomUUID = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("crypto", { randomUUID });
  randomUUID.mockReturnValue("request-new");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildGroupId", () => {
  test("returns the same id for the same users and request ids", () => {
    const first = buildGroupId({
      userId: "user-1",
      userRequestId: "request-1",
      partnerId: "user-2",
      partnerRequestId: "request-2",
      classCode: "TEST101",
    });
    const second = buildGroupId({
      userId: "user-1",
      userRequestId: "request-1",
      partnerId: "user-2",
      partnerRequestId: "request-2",
      classCode: "TEST101",
    });

    expect(first).toBe(second);
  });

  test("changes the id when a request id changes for the same users and class", () => {
    const first = buildGroupId({
      userId: "user-1",
      userRequestId: "request-1",
      partnerId: "user-2",
      partnerRequestId: "request-2",
      classCode: "TEST101",
    });
    const second = buildGroupId({
      userId: "user-1",
      userRequestId: "request-3",
      partnerId: "user-2",
      partnerRequestId: "request-2",
      classCode: "TEST101",
    });

    expect(second).not.toBe(first);
  });

  test("keeps uid and requestId paired when the input order changes", () => {
    const first = buildGroupId({
      userId: "user-1",
      userRequestId: "request-1",
      partnerId: "user-2",
      partnerRequestId: "request-2",
      classCode: "TEST101",
    });
    const second = buildGroupId({
      userId: "user-2",
      userRequestId: "request-2",
      partnerId: "user-1",
      partnerRequestId: "request-1",
      classCode: "TEST101",
    });

    expect(second).toBe(first);
  });
});

describe("startMatching", () => {
  test("stores a requestId on a new queue document", async () => {
    randomUUID.mockReturnValueOnce("request-1");
    getDoc.mockResolvedValueOnce(snapshot({ exists: false }));

    await expect(startMatching({
      userId: "user-1",
      classCode: "TEST101",
    })).resolves.toEqual({ status: "waiting", reused: false, requestId: "request-1" });

    expect(setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: ["matchingQueue", "user-1"] }),
      expect.objectContaining({
        userId: "user-1",
        classCode: "TEST101",
        requestId: "request-1",
        createdAt: "server-time",
      })
    );
  });

  test("reuses the existing queue document for repeated starts by the same user", async () => {
    getDoc.mockResolvedValueOnce(snapshot({
      exists: true,
      data: { userId: "user-1", classCode: "TEST101", requestId: "request-existing" },
    }));

    await expect(startMatching({
      userId: "user-1",
      classCode: "TEST101",
    })).resolves.toEqual({ status: "waiting", reused: true, requestId: "request-existing" });

    expect(setDoc).not.toHaveBeenCalled();
  });

  test("replaces a legacy queue without requestId for the same class", async () => {
    randomUUID.mockReturnValueOnce("request-replacement");
    getDoc.mockResolvedValueOnce(snapshot({
      exists: true,
      data: { userId: "user-1", classCode: "TEST101" },
    }));

    await expect(startMatching({
      userId: "user-1",
      classCode: "TEST101",
    })).resolves.toEqual({
      status: "waiting",
      reused: false,
      replacedLegacy: true,
      requestId: "request-replacement",
    });

    expect(setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: ["matchingQueue", "user-1"] }),
      expect.objectContaining({
        userId: "user-1",
        classCode: "TEST101",
        requestId: "request-replacement",
      })
    );
  });

  test("fails when the user is already waiting for another class", async () => {
    getDoc.mockResolvedValueOnce(snapshot({
      exists: true,
      data: { userId: "user-1", classCode: "TEST999" },
    }));

    await expect(startMatching({
      userId: "user-1",
      classCode: "TEST101",
    })).rejects.toThrow("別の授業でマッチング待機中です。先に待機をキャンセルしてください。");
  });
});

describe("subscribeUserClassGroups", () => {
  test("notifies only when the joined group has the current requestId", () => {
    const onMatched = vi.fn();
    onSnapshot.mockImplementationOnce((_query, next) => {
      next({
        docs: [
          {
            id: "TEST101__user-1__user-2",
            data: () => ({ classCode: "TEST101", members: ["user-1", "user-2"] }),
          },
          {
            id: "TEST101__user-1__request-current__user-2__request-2",
            data: () => ({
              classCode: "TEST101",
              members: ["user-1", "user-2"],
              matchRequestIds: ["request-current", "request-2"],
            }),
          },
        ],
      });
      return vi.fn();
    });

    subscribeUserClassGroups({
      userId: "user-1",
      classCode: "TEST101",
      requestId: "request-current",
      onMatched,
      onError: vi.fn(),
    });

    expect(onMatched).toHaveBeenCalledWith("TEST101__user-1__request-current__user-2__request-2");
  });

  test("ignores previous groups that do not include the current requestId", () => {
    const onMatched = vi.fn();
    onSnapshot.mockImplementationOnce((_query, next) => {
      next({
        docs: [
          {
            id: "TEST101__user-1__user-2",
            data: () => ({ classCode: "TEST101", members: ["user-1", "user-2"] }),
          },
          {
            id: "TEST101__user-1__request-old__user-2__request-2",
            data: () => ({
              classCode: "TEST101",
              members: ["user-1", "user-2"],
              matchRequestIds: ["request-old", "request-2"],
            }),
          },
        ],
      });
      return vi.fn();
    });

    subscribeUserClassGroups({
      userId: "user-1",
      classCode: "TEST101",
      requestId: "request-current",
      onMatched,
      onError: vi.fn(),
    });

    expect(onMatched).not.toHaveBeenCalled();
  });
});

describe("subscribeMatchingCandidates", () => {
  test("does not create a group when no partner is waiting", () => {
    onSnapshot.mockImplementationOnce((_query, next) => {
      next({
        docs: [
          queueDoc("user-1", { userId: "user-1", classCode: "TEST101" }),
        ],
      });
      return vi.fn();
    });

    subscribeMatchingCandidates({
      userId: "user-1",
      classCode: "TEST101",
      onMatched: vi.fn(),
      onError: vi.fn(),
    });

    expect(runTransaction).not.toHaveBeenCalled();
  });

  test("ignores legacy partner queues without requestId", () => {
    onSnapshot.mockImplementationOnce((_query, next) => {
      next({
        docs: [
          queueDoc("user-1", { userId: "user-1", classCode: "TEST101", requestId: "request-1" }),
          queueDoc("user-2", { userId: "user-2", classCode: "TEST101" }),
        ],
      });
      return vi.fn();
    });

    subscribeMatchingCandidates({
      userId: "user-1",
      classCode: "TEST101",
      onMatched: vi.fn(),
      onError: vi.fn(),
    });

    expect(runTransaction).not.toHaveBeenCalled();
  });
});

describe("tryCreateGroup", () => {
  test("creates one group when a partner is waiting", async () => {
    const transaction = mockTransaction({
      userQueue: snapshot({ exists: true, data: { classCode: "TEST101", requestId: "request-1" } }),
      partnerQueue: snapshot({ exists: true, data: { classCode: "TEST101", requestId: "request-2" } }),
      group: snapshot({ exists: false }),
    });

    await expect(tryCreateGroup({
      userId: "user-1",
      partnerId: "user-2",
      classCode: "TEST101",
    })).resolves.toBe("TEST101__user-1__request-1__user-2__request-2");

    expect(transaction.set).toHaveBeenCalledTimes(1);
    expect(transaction.set).toHaveBeenCalledWith(
      expect.objectContaining({ id: "TEST101__user-1__request-1__user-2__request-2" }),
      expect.objectContaining({
        classCode: "TEST101",
        members: ["user-1", "user-2"],
        matchRequestIds: ["request-1", "request-2"],
        lastMessageAt: null,
        lastMessageText: "",
      })
    );
    expect(transaction.delete).not.toHaveBeenCalled();
  });

  test("reuses the existing group for the same two users and class without deleting queues", async () => {
    const transaction = mockTransaction({
      userQueue: snapshot({ exists: true, data: { classCode: "TEST101", requestId: "request-1" } }),
      partnerQueue: snapshot({ exists: true, data: { classCode: "TEST101", requestId: "request-2" } }),
      group: snapshot({ exists: true }),
    });

    await expect(tryCreateGroup({
      userId: "user-2",
      partnerId: "user-1",
      classCode: "TEST101",
    })).resolves.toBe("TEST101__user-1__request-1__user-2__request-2");

    expect(transaction.set).not.toHaveBeenCalled();
    expect(transaction.delete).not.toHaveBeenCalled();
  });

  test("uses a new requestId based group id instead of the previous fixed id", async () => {
    const transaction = mockTransaction({
      userQueue: snapshot({ exists: true, data: { classCode: "TEST101", requestId: "request-new-1" } }),
      partnerQueue: snapshot({ exists: true, data: { classCode: "TEST101", requestId: "request-new-2" } }),
      group: snapshot({ exists: false }),
    });

    await expect(tryCreateGroup({
      userId: "user-1",
      partnerId: "user-2",
      classCode: "TEST101",
    })).resolves.toBe("TEST101__user-1__request-new-1__user-2__request-new-2");

    expect(transaction.get).toHaveBeenCalledWith(expect.objectContaining({
      id: "TEST101__user-1__request-new-1__user-2__request-new-2",
    }));
    expect(transaction.get).not.toHaveBeenCalledWith(expect.objectContaining({
      id: "TEST101__user-1__user-2",
    }));
  });

  test("does not create a group when the partner queue is gone", async () => {
    const transaction = mockTransaction({
      userQueue: snapshot({ exists: true, data: { classCode: "TEST101", requestId: "request-1" } }),
      partnerQueue: snapshot({ exists: false }),
      group: snapshot({ exists: false }),
    });

    await expect(tryCreateGroup({
      userId: "user-1",
      partnerId: "user-2",
      classCode: "TEST101",
    })).resolves.toBeNull();

    expect(transaction.set).not.toHaveBeenCalled();
    expect(transaction.delete).not.toHaveBeenCalled();
  });

  test("does not create a group from legacy queues without requestId", async () => {
    const transaction = mockTransaction({
      userQueue: snapshot({ exists: true, data: { classCode: "TEST101" } }),
      partnerQueue: snapshot({ exists: true, data: { classCode: "TEST101", requestId: "request-2" } }),
      group: snapshot({ exists: false }),
    });

    await expect(tryCreateGroup({
      userId: "user-1",
      partnerId: "user-2",
      classCode: "TEST101",
    })).resolves.toBeNull();

    expect(transaction.set).not.toHaveBeenCalled();
    expect(transaction.delete).not.toHaveBeenCalled();
  });

  test("returns Firestore failures to the caller", async () => {
    runTransaction.mockRejectedValueOnce(new Error("transaction failed"));

    await expect(tryCreateGroup({
      userId: "user-1",
      partnerId: "user-2",
      classCode: "TEST101",
    })).rejects.toThrow("transaction failed");
  });
});

describe("cancelMatching", () => {
  test("deletes the current user's queue document", async () => {
    await cancelMatching({ userId: "user-1" });

    expect(deleteDoc).toHaveBeenCalledWith(expect.objectContaining({
      path: ["matchingQueue", "user-1"],
    }));
  });
});
