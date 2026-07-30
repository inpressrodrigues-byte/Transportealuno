import { NextResponse } from "next/server";
import { getLiveTracking } from "@/lib/server/app-db";

export async function GET() {
  return NextResponse.json(getLiveTracking());
}
