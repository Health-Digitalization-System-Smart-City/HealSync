// Typed API client for the feedback endpoints.
//
// Only the browser-visible, permission-scoped shapes are exposed here. The
// server decides what each viewer may see (e.g. raw vs. masked phone numbers).

import type {
  FeedbackListResult,
  FeedbackMeta,
  FeedbackQuery,
  FeedbackView,
  UpdateFeedbackInput,
} from "@/lib/feedback/types";

const API = "/api/feedback";

export class ApiClientError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const payload = await response.json();
      if (payload?.error?.message) message = payload.error.message;
    } catch {
      // Non-JSON error body — keep the default message.
    }
    throw new ApiClientError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function fetchFeedbackList(
  params: FeedbackQuery = {},
): Promise<FeedbackListResult> {
  const search = new URLSearchParams();

  if (params.search) search.set("search", params.search);
  if (params.branchId) search.set("branchId", params.branchId);
  if (params.serviceId) search.set("serviceId", params.serviceId);
  if (params.rating) search.set("rating", params.rating);

  if (params.range && params.range !== "all") {
    search.set("range", params.range);
    if (params.range === "custom") {
      if (params.startDate) search.set("startDate", params.startDate);
      if (params.endDate) search.set("endDate", params.endDate);
    }
  }

  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));

  return request<FeedbackListResult>(`${API}?${search.toString()}`);
}

export function fetchFeedbackMeta(): Promise<FeedbackMeta> {
  return request<FeedbackMeta>(`${API}/meta`);
}

export function fetchFeedbackDetail(id: string): Promise<FeedbackView> {
  return request<FeedbackView>(`${API}/${id}`);
}

export function updateFeedback(
  id: string,
  input: UpdateFeedbackInput,
): Promise<FeedbackView> {
  return request<FeedbackView>(`${API}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteFeedback(id: string): Promise<void> {
  return request<void>(`${API}/${id}`, { method: "DELETE" });
}
