import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session-token";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const adminPortal = String(body?.portal || "") === "admin";
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  if (adminPortal) {
    response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  }
  return response;
}
