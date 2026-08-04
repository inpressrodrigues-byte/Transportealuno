import { NextResponse } from "next/server";
import { getAdminPayload, persistDb, prepareDb, storageErrorMessage, updateAdminAccess } from "@/lib/server/app-db";

export async function GET() {
  await prepareDb();
  return NextResponse.json(getAdminPayload().adminAccess);
}

export async function PUT(request: Request) {
  await prepareDb();
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

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json({ adminAccess });
}
