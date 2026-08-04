import { NextResponse } from "next/server";
import { prepareDb } from "@/lib/server/app-db";
import { scopedAdminPayload } from "@/lib/server/admin-request";

export async function GET(request: Request) {
  await prepareDb();
  const { searchParams } = new URL(request.url);
  return NextResponse.json(scopedAdminPayload(request, searchParams.get("companyId") || undefined));
}
