import { NextResponse } from "next/server";
import {
  deleteChild,
  getParentDashboard,
  persistDb,
  prepareDb,
  readDb,
  storageErrorMessage,
  upsertChild,
} from "@/lib/server/app-db";
import type { Shift } from "@/lib/app-types";

export async function POST(request: Request) {
  return saveChild(request);
}

export async function PATCH(request: Request) {
  return saveChild(request);
}

async function saveChild(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const parentId = String(body?.parentId || "");
  const parent = readDb().parents.find((item) => item.id === parentId && item.active);
  if (!parent) {
    return NextResponse.json(
      { error: "Responsavel nao encontrado. Entre novamente na area dos pais." },
      { status: 404 }
    );
  }

  const { error } = upsertChild({
    id: String(body?.id || "") || undefined,
    companyId: parent.companyId,
    parentId,
    name: String(body?.name || ""),
    cpf: String(body?.cpf || ""),
    birthDate: String(body?.birthDate || ""),
    schoolId: String(body?.schoolId || ""),
    grade: String(body?.grade || ""),
    responsiblePhone: String(body?.responsiblePhone || parent.contact),
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
  return NextResponse.json(getParentDashboard(parentId));
}

export async function DELETE(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const parentId = String(body?.parentId || "");
  const parent = readDb().parents.find((item) => item.id === parentId && item.active);
  if (!parent) {
    return NextResponse.json({ error: "Responsavel nao encontrado." }, { status: 404 });
  }

  const { error } = deleteChild(String(body?.id || ""), parent.companyId, parentId);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(getParentDashboard(parentId));
}
