import { NextResponse } from "next/server";
import { deleteVan, persistDb, prepareDb, storageErrorMessage, upsertVan } from "@/lib/server/app-db";
import { scopedAdminPayload } from "@/lib/server/admin-request";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);

  const { error } = upsertVan({
    id: String(body?.id || ""),
    label: String(body?.label || ""),
    plate: String(body?.plate || ""),
    model: String(body?.model || ""),
    seats: Number(body?.seats || 15),
    color: String(body?.color || "#c89b4a"),
    driverId: String(body?.driverId || ""),
    companyId: String(body?.companyId || ""),
    active: body?.active ?? true,
    notes: String(body?.notes || ""),
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(scopedAdminPayload(request, String(body?.companyId || "") || undefined));
}

export async function DELETE(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "");
  const { error } = deleteVan(String(body?.id || ""), companyId || undefined);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(scopedAdminPayload(request, companyId || undefined));
}
