import { NextResponse } from "next/server";
import {
  deleteChild,
  getAdminPayload,
  persistDb,
  prepareDb,
  storageErrorMessage,
  upsertChild,
} from "@/lib/server/app-db";
import type { Shift } from "@/lib/app-types";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "") || undefined;
  const { error } = upsertChild({
    id: String(body?.id || "") || undefined,
    companyId,
    parentId: String(body?.parentId || ""),
    name: String(body?.name || ""),
    cpf: String(body?.cpf || ""),
    birthDate: String(body?.birthDate || ""),
    schoolId: String(body?.schoolId || ""),
    grade: String(body?.grade || ""),
    responsiblePhone: String(body?.responsiblePhone || ""),
    address: body?.address || {},
    notes: String(body?.notes || ""),
    driverId: String(body?.driverId || ""),
    vanId: String(body?.vanId || ""),
    shift: String(body?.shift || "") as Shift | "",
    active: body?.active ?? true,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(getAdminPayload(companyId));
}

export async function DELETE(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "") || undefined;
  const { error } = deleteChild(String(body?.id || ""), companyId);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(getAdminPayload(companyId));
}
