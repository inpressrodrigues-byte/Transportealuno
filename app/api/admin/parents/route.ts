import { NextResponse } from "next/server";
import {
  deleteParent,
  persistDb,
  prepareDb,
  storageErrorMessage,
  upsertParent,
} from "@/lib/server/app-db";
import { scopedAdminPayload } from "@/lib/server/admin-request";

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

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(scopedAdminPayload(request, companyId));
}

export async function DELETE(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "") || undefined;
  const { error } = deleteParent(String(body?.id || ""), companyId);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(scopedAdminPayload(request, companyId));
}
