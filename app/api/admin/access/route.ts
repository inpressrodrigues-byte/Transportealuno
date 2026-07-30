import { NextResponse } from "next/server";
import { getAdminPayload, updateAdminAccess } from "@/lib/server/app-db";

export async function GET() {
  return NextResponse.json(getAdminPayload().adminAccess);
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const { adminAccess, error } = updateAdminAccess({
    id: String(body?.id || ""),
    name: String(body?.name || ""),
    login: String(body?.login || ""),
    password: String(body?.password || ""),
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ adminAccess });
}
