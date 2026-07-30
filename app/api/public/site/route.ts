import { NextResponse } from "next/server";
import { getPublicPayload } from "@/lib/server/app-db";

export async function GET() {
  return NextResponse.json(getPublicPayload());
}
