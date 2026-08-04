import { NextResponse } from "next/server";
import { getAdminPayload, persistDb, prepareDb, regenerateVanQrCode } from "@/lib/server/app-db";

export async function GET(request: Request) {
  await prepareDb();
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || "";
  const payload = getAdminPayload(companyId || undefined);
  const vanId = searchParams.get("vanId") || "";
  return NextResponse.json(
    vanId ? payload.vanQrCodes.find((qr) => qr.vanId === vanId) || payload.vanQrCode : payload.vanQrCode
  );
}

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "");
  regenerateVanQrCode(String(body?.vanId || ""), companyId || undefined);
  const payload = getAdminPayload(companyId || undefined);
  await persistDb();
  return NextResponse.json({ vanQrCode: payload.vanQrCode, vanQrCodes: payload.vanQrCodes });
}
