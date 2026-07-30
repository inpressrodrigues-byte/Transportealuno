import { NextResponse } from "next/server";
import { getAdminPayload } from "@/lib/server/app-db";

export async function GET() {
  return NextResponse.json(getAdminPayload());
}
