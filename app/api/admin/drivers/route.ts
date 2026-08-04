import { NextResponse } from "next/server";
import { deleteDriver, getAdminPayload, persistDb, prepareDb, storageErrorMessage, upsertDriver } from "@/lib/server/app-db";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);

  const { error } = upsertDriver({
    id: String(body?.id || ""),
    name: String(body?.name || ""),
    contact: String(body?.contact || ""),
    cpf: String(body?.cpf || ""),
    license: String(body?.license || ""),
    vanId: String(body?.vanId || ""),
    companyId: String(body?.companyId || ""),
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
  return NextResponse.json(getAdminPayload(String(body?.companyId || "") || undefined));
}

export async function DELETE(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "");
  const { error } = deleteDriver(String(body?.id || ""), companyId || undefined);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(getAdminPayload(companyId || undefined));
}
