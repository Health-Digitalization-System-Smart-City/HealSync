// Analytics API client (consumes backend analytics contracts)
export type Summary = {
  activePatients: number;
  appointmentsToday: number;
  avgResponseMinutes: number;
};

export type ActivityItem = {
  id: string;
  type: string;
  message: string;
  timestamp: string;
};

export async function fetchSummary(): Promise<Summary> {
  const res = await fetch("/api/analytics/summary");
  if (!res.ok) throw new Error("Failed to fetch analytics summary");
  return res.json();
}

export async function fetchActivity(): Promise<ActivityItem[]> {
  const res = await fetch("/api/analytics/activity?limit=20");
  if (!res.ok) throw new Error("Failed to fetch activity");
  return res.json();
}

export async function fetchTrend(): Promise<{ date: string; value: number }[]> {
  const res = await fetch("/api/analytics/trend?days=30");
  if (!res.ok) throw new Error("Failed to fetch trend");
  return res.json();
}
