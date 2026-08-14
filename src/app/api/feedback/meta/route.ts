import { NextResponse } from "next/server";
import { getFeedbackMeta } from "@/lib/feedback/service";
import { feedbackStore } from "@/lib/feedback/store";

export async function GET() {
  return NextResponse.json(getFeedbackMeta(feedbackStore));
}
