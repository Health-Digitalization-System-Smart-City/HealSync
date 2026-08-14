import { NextResponse } from "next/server";

export async function GET() {
  const now = Date.now();
  const items = Array.from({ length: 12 }).map((_, i) => ({
    id: String(i + 1),
    type: i % 2 === 0 ? "appointment" : "note",
    message: i % 2 === 0 ? `New appointment scheduled (#${100 + i})` : `Note added to patient #${200 + i}`,
    timestamp: new Date(now - i * 1000 * 60 * 60).toISOString(),
  }));

  return NextResponse.json(items);
}
