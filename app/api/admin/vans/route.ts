import { NextResponse } from "next/server";
import { getAdminPayload, upsertVan } from "@/lib/server/app-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const { error } = upsertVan({
    id: String(body?.id || ""),
    label: String(body?.label || ""),
    plate: String(body?.plate || ""),
    model: String(body?.model || ""),
    seats: Number(body?.seats || 15),
    color: String(body?.color || "#facc15"),
    driverId: String(body?.driverId || ""),
    active: body?.active ?? true,
    notes: String(body?.notes || ""),
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(getAdminPayload());
}
