import { NextResponse } from "next/server";
import { getAdminPayload, upsertDriver } from "@/lib/server/app-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const { error } = upsertDriver({
    id: String(body?.id || ""),
    name: String(body?.name || ""),
    contact: String(body?.contact || ""),
    cpf: String(body?.cpf || ""),
    license: String(body?.license || ""),
    vanId: String(body?.vanId || ""),
    active: body?.active ?? true,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(getAdminPayload());
}
