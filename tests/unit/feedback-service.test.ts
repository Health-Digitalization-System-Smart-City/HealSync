import { describe, expect, it } from "vitest";

import { PERMISSIONS } from "@/config/roles";
import { FeedbackError } from "@/lib/feedback/errors";
import {
  deleteFeedback,
  getFeedbackById,
  getFeedbackMeta,
  listFeedback,
  updateFeedback,
} from "@/lib/feedback/service";
import { createFeedbackStore, type FeedbackStore } from "@/lib/feedback/store";
import type { Viewer } from "@/lib/feedback/types";

const adminViewer: Viewer = {
  role: "Admin",
  permissions: [
    PERMISSIONS.feedbackRead,
    PERMISSIONS.feedbackUpdate,
    PERMISSIONS.feedbackDelete,
    PERMISSIONS.feedbackPhone,
  ],
};

const managerViewer: Viewer = {
  role: "Manager",
  permissions: [PERMISSIONS.feedbackRead],
};

const analystViewer: Viewer = {
  role: "Analyst",
  permissions: [PERMISSIONS.feedbackRead],
};

function freshStore(): FeedbackStore {
  return createFeedbackStore();
}

function rawPhoneOf(store: FeedbackStore, index: number): string {
  return store.records[index].phoneNumber;
}

describe("listFeedback", () => {
  it("returns raw phone numbers for Admin", () => {
    const store = freshStore();
    const result = listFeedback(store, {}, adminViewer);

    expect(result.total).toBe(store.records.length);
    expect(result.items.length).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(item.phoneNumber).toMatch(/^\+251\d{9}$/);
    }
  });

  it("returns masked phone numbers for Manager and Analyst (raw number never leaves the server)", () => {
    for (const viewer of [managerViewer, analystViewer]) {
      const store = freshStore();
      const result = listFeedback(store, {}, viewer);

      expect(result.items.length).toBeGreaterThan(0);
      for (const item of result.items) {
        expect(item.phoneNumber).toMatch(/^•••• \d{4}$/);
        expect(item.phoneNumber).not.toContain(rawPhoneOf(store, 0));
      }
    }
  });

  it("exposes viewer capabilities in the response", () => {
    const store = freshStore();

    const admin = listFeedback(store, {}, adminViewer).viewer;
    expect(admin).toMatchObject({
      canSeePhone: true,
      canUpdate: true,
      canDelete: true,
    });

    const manager = listFeedback(store, {}, managerViewer).viewer;
    expect(manager).toMatchObject({
      canSeePhone: false,
      canUpdate: false,
      canDelete: false,
    });
  });

  it("filters by branch", () => {
    const store = freshStore();
    const branchId = "br-main";
    const expected = store.records.filter(
      (record) => record.branchId === branchId,
    ).length;

    const result = listFeedback(
      store,
      { branchId, pageSize: 100 },
      adminViewer,
    );

    expect(result.total).toBe(expected);
    expect(result.items.every((item) => item.branchId === branchId)).toBe(true);
  });

  it("filters by service", () => {
    const store = freshStore();
    const serviceId = "sv-pharmacy";
    const expected = store.records.filter(
      (record) => record.serviceId === serviceId,
    ).length;

    const result = listFeedback(
      store,
      { serviceId, pageSize: 100 },
      adminViewer,
    );

    expect(result.total).toBe(expected);
    expect(result.items.every((item) => item.serviceId === serviceId)).toBe(
      true,
    );
  });

  it("filters by rating", () => {
    const store = freshStore();
    const rating = "VERY_SATISFIED";
    const expected = store.records.filter(
      (record) => record.rating === rating,
    ).length;

    const result = listFeedback(store, { rating, pageSize: 100 }, adminViewer);

    expect(result.total).toBe(expected);
    expect(result.items.every((item) => item.rating === rating)).toBe(true);
  });

  it("filters by today / yesterday ranges", () => {
    const store = freshStore();
    const today = listFeedback(
      store,
      { range: "today", pageSize: 100 },
      adminViewer,
    );
    const yesterday = listFeedback(
      store,
      { range: "yesterday", pageSize: 100 },
      adminViewer,
    );

    const now = new Date();
    const expectedToday = store.records.filter((record) => {
      const date = new Date(record.createdAt);
      return date.toDateString() === now.toDateString();
    }).length;
    const expectedYesterday = store.records.filter((record) => {
      const date = new Date(record.createdAt);
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return date.toDateString() === y.toDateString();
    }).length;

    expect(today.total).toBe(expectedToday);
    expect(yesterday.total).toBe(expectedYesterday);
  });

  it("filters by a custom date range that includes everything", () => {
    const store = freshStore();
    const result = listFeedback(
      store,
      {
        range: "custom",
        startDate: "2000-01-01",
        endDate: "2100-01-01",
        pageSize: 100,
      },
      adminViewer,
    );

    expect(result.total).toBe(store.records.length);
  });

  it("combines filters", () => {
    const store = freshStore();
    const result = listFeedback(
      store,
      { branchId: "br-main", serviceId: "sv-general", pageSize: 100 },
      adminViewer,
    );

    const expected = store.records.filter(
      (record) =>
        record.branchId === "br-main" && record.serviceId === "sv-general",
    ).length;

    expect(result.total).toBe(expected);
  });

  it("searches by keyword in comments, branch name, and service name", () => {
    const store = freshStore();
    const result = listFeedback(
      store,
      { search: "pediatrician", pageSize: 100 },
      adminViewer,
    );

    expect(result.total).toBeGreaterThan(0);
    expect(
      result.items.every((item) =>
        item.comment?.toLowerCase().includes("pediatrician"),
      ),
    ).toBe(true);
  });

  it("allows Admin to search by phone number, but restricts Manager and Analyst", () => {
    const store = freshStore();
    const rawPhone = store.records[0].phoneNumber;

    // Admin search finds the record
    const adminResult = listFeedback(
      store,
      { search: rawPhone, pageSize: 100 },
      adminViewer,
    );
    expect(adminResult.total).toBeGreaterThanOrEqual(1);

    // Manager / Analyst search by raw phone does not match
    const managerResult = listFeedback(
      store,
      { search: rawPhone, pageSize: 100 },
      managerViewer,
    );
    expect(managerResult.total).toBe(0);
  });

  it("paginates and clamps out-of-range pages", () => {
    const store = freshStore();
    const pageOne = listFeedback(store, { page: 1, pageSize: 10 }, adminViewer);
    expect(pageOne.items).toHaveLength(10);
    expect(pageOne.totalPages).toBe(Math.ceil(store.records.length / 10));

    const last = listFeedback(store, { page: 999, pageSize: 10 }, adminViewer);
    expect(last.page).toBe(last.totalPages);
    expect(last.items.length).toBeGreaterThan(0);
    expect(last.items.length).toBeLessThanOrEqual(10);
  });

  it("computes the summary across the filtered set", () => {
    const store = freshStore();
    const result = listFeedback(store, { pageSize: 100 }, adminViewer);

    expect(result.summary.total).toBe(result.total);
    expect(
      result.summary.positive +
        result.summary.neutral +
        result.summary.needsAttention,
    ).toBe(result.total);
  });

  it("excludes soft-deleted records", () => {
    const store = freshStore();
    const first = store.records[0];
    deleteFeedback(store, first.id, adminViewer);

    const result = listFeedback(store, { pageSize: 100 }, adminViewer);
    expect(result.total).toBe(store.records.length - 1);
    expect(result.items.some((item) => item.id === first.id)).toBe(false);
  });
});

describe("getFeedbackById", () => {
  it("returns the record for a valid id", () => {
    const store = freshStore();
    const record = store.records[0];

    const admin = getFeedbackById(store, record.id, adminViewer);
    expect(admin.phoneNumber).toBe(record.phoneNumber);

    const analyst = getFeedbackById(store, record.id, analystViewer);
    expect(analyst.phoneNumber).not.toBe(record.phoneNumber);
  });

  it("throws NOT_FOUND for missing or deleted records", () => {
    const store = freshStore();
    const record = store.records[0];
    deleteFeedback(store, record.id, adminViewer);

    expect(() => getFeedbackById(store, record.id, adminViewer)).toThrowError(
      FeedbackError,
    );
    expect(() => getFeedbackById(store, "fb-missing", adminViewer)).toThrow(
      /not found/i,
    );
  });
});

describe("updateFeedback", () => {
  it("allows Admin to update rating and comment", () => {
    const store = freshStore();
    const record = store.records[0];

    const updated = updateFeedback(
      store,
      record.id,
      { rating: "NEUTRAL", comment: "Updated comment." },
      adminViewer,
    );

    expect(updated.rating).toBe("NEUTRAL");
    expect(updated.comment).toBe("Updated comment.");
    expect(store.records[0].rating).toBe("NEUTRAL");
  });

  it("forbids Manager and Analyst from updating", () => {
    for (const viewer of [managerViewer, analystViewer]) {
      const store = freshStore();
      expect(() =>
        updateFeedback(store, store.records[0].id, { comment: "x" }, viewer),
      ).toThrowError(/permission/i);
    }
  });
});

describe("deleteFeedback", () => {
  it("allows Admin to soft-delete feedback", () => {
    const store = freshStore();
    const record = store.records[0];

    deleteFeedback(store, record.id, adminViewer);

    expect(store.records[0].deletedAt).not.toBeNull();
  });

  it("forbids Manager and Analyst from deleting", () => {
    for (const viewer of [managerViewer, analystViewer]) {
      const store = freshStore();
      expect(() =>
        deleteFeedback(store, store.records[0].id, viewer),
      ).toThrowError(/permission/i);
    }
  });

  it("throws NOT_FOUND when deleting an already-deleted record", () => {
    const store = freshStore();
    const record = store.records[0];
    deleteFeedback(store, record.id, adminViewer);

    expect(() => deleteFeedback(store, record.id, adminViewer)).toThrow(
      /not found/i,
    );
  });
});

describe("getFeedbackMeta", () => {
  it("returns branches, services and the rating scale", () => {
    const store = freshStore();
    const meta = getFeedbackMeta(store);

    expect(meta.branches.length).toBeGreaterThan(0);
    expect(meta.services.length).toBeGreaterThan(0);
    expect(meta.ratings.length).toBeGreaterThan(0);
    expect(meta.ratings[0]).toHaveProperty("value");
    expect(meta.ratings[0]).toHaveProperty("label");
  });
});
