import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    activePatients: 1248,
    appointmentsToday: 84,
    avgResponseMinutes: 134,
  };

  return NextResponse.json(payload);
}
