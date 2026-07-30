import { NextResponse } from "next/server";
import { getAdminPayload, regenerateVanQrCode } from "@/lib/server/app-db";

export async function GET() {
  return NextResponse.json(getAdminPayload().vanQrCode);
}

export async function POST() {
  const db = regenerateVanQrCode();
  return NextResponse.json({ vanQrCode: db.vanQrCode });
}
