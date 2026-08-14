import { NextResponse } from "next/server";

export async function GET() {
  const days = 30;
  const now = Date.now();
  const data = Array.from({ length: days }).map((_, i) => ({
    date: new Date(now - (days - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    value: Math.max(50, Math.round(100 + Math.sin(i / 3) * 30 + Math.random() * 20)),
  }));

  return NextResponse.json(data);
}
