import { NextResponse } from "next/server";
import { createCheckin, persistDb, prepareDb, storageErrorMessage } from "@/lib/server/app-db";
import type { CheckinType } from "@/lib/app-types";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const token = String(body?.token || "");
  const parentId = String(body?.parentId || "");
  const childId = String(body?.childId || "");
  const type = body?.type as CheckinType;

  if (!token || !parentId || !childId) {
    return NextResponse.json({ error: "QR Code, responsavel e aluno sao obrigatorios." }, { status: 400 });
  }

  const latitude = Number(body?.latitude);
  const longitude = Number(body?.longitude);
  const accuracy = Number(body?.accuracy);

  const { checkin, error } = createCheckin({
    token,
    parentId,
    childId,
    type,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    accuracy: Number.isFinite(accuracy) ? accuracy : undefined,
  });

  if (error || !checkin) {
    return NextResponse.json({ error: error || "Nao foi possivel registrar o check-in." }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json({ checkin });
}
