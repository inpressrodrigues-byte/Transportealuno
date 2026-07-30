import { NextResponse } from "next/server";
import { getDriverRoutePayload } from "@/lib/server/app-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return NextResponse.json(getDriverRoutePayload(searchParams.get("driverId") || undefined));
}
