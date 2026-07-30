import { NextResponse } from "next/server";
import { getLiveTracking } from "@/lib/server/app-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return NextResponse.json(getLiveTracking(searchParams.get("driverId") || undefined));
}
