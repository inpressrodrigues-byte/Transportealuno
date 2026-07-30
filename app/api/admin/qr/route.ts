import { NextResponse } from "next/server";
import { getAdminPayload, regenerateVanQrCode } from "@/lib/server/app-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload = getAdminPayload();
  const vanId = searchParams.get("vanId") || "";
  return NextResponse.json(
    vanId ? payload.vanQrCodes.find((qr) => qr.vanId === vanId) || payload.vanQrCode : payload.vanQrCode
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const db = regenerateVanQrCode(String(body?.vanId || ""));
  return NextResponse.json({ vanQrCode: db.vanQrCode, vanQrCodes: db.vanQrCodes });
}
