import type {
  AnalyticsDashboardData,
  AnalyticsQuery,
} from "@/lib/analytics/types";

const API = "/api/analytics";

export async function fetchAnalyticsDashboard(
  query: AnalyticsQuery = {},
): Promise<AnalyticsDashboardData> {
  const search = new URLSearchParams();

  if (query.range && query.range !== "all") {
    search.set("range", query.range);
    if (query.range === "custom") {
      if (query.startDate) search.set("startDate", query.startDate);
      if (query.endDate) search.set("endDate", query.endDate);
    }
  }

  if (query.branchId) search.set("branchId", query.branchId);
  if (query.serviceId) search.set("serviceId", query.serviceId);
  if (query.interval) search.set("interval", query.interval);

  const url = search.toString() ? `${API}?${search.toString()}` : API;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    let message = "Failed to load analytics dashboard data.";
    try {
      const payload = await response.json();
      if (payload?.error?.message) message = payload.error.message;
    } catch {
      // Non-JSON error body
    }
    throw new Error(message);
  }

  return response.json() as Promise<AnalyticsDashboardData>;
}
