import { NextResponse } from "next/server";
import {
  deleteParent,
  getAdminPayload,
  persistDb,
  prepareDb,
  upsertParent,
} from "@/lib/server/app-db";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "") || undefined;
  const { error } = upsertParent({
    id: String(body?.id || "") || undefined,
    companyId,
    name: String(body?.name || ""),
    contact: String(body?.contact || ""),
    email: String(body?.email || ""),
    cpf: String(body?.cpf || ""),
    active: body?.active ?? true,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  await persistDb();
  return NextResponse.json(getAdminPayload(companyId));
}

export async function DELETE(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "") || undefined;
  const { error } = deleteParent(String(body?.id || ""), companyId);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  await persistDb();
  return NextResponse.json(getAdminPayload(companyId));
}
