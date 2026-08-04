import { NextResponse } from "next/server";
import { getPublicPayload, prepareDb } from "@/lib/server/app-db";

export async function GET() {
  await prepareDb();
  return NextResponse.json(getPublicPayload());
}
