import { NextResponse } from "next/server";
import { getParentDashboard, prepareDb } from "@/lib/server/app-db";

export async function GET(request: Request) {
  await prepareDb();
  const url = new URL(request.url);
  const parentId = url.searchParams.get("parentId") || "";
  const payload = getParentDashboard(parentId);

  if (!payload) {
    return NextResponse.json({ error: "Responsavel nao encontrado." }, { status: 404 });
  }

  return NextResponse.json(payload);
}
