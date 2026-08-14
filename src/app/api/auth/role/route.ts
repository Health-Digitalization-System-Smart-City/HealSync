import { NextRequest, NextResponse } from "next/server";
import { isUserRole } from "@/config/roles";
import { getServerViewer } from "@/lib/auth/access";

export async function GET() {
  const viewer = await getServerViewer();
  return NextResponse.json({ role: viewer.role });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const role = body?.role;
    if (!isUserRole(role)) {
      return NextResponse.json(
        { error: { message: "Invalid role specified." } },
        { status: 400 },
      );
    }

    const response = NextResponse.json({ role });
    response.cookies.set("healsync_role", role, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: { message: "Failed to switch role." } },
      { status: 400 },
    );
  }
}
