import { NextResponse } from "next/server";
import { getDriverRoutePayload } from "@/lib/server/app-db";

export async function GET() {
  return NextResponse.json(getDriverRoutePayload());
}
