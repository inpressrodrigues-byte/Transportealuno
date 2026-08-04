import { NextResponse } from "next/server";
import { getDriverRoutePayload, prepareDb } from "@/lib/server/app-db";

export async function GET(request: Request) {
  await prepareDb();
  const { searchParams } = new URL(request.url);
  return NextResponse.json(getDriverRoutePayload(searchParams.get("driverId") || undefined));
}
