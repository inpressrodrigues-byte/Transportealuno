import { NextResponse } from "next/server";
import { bulkUpdateNeighborhoods, persistDb, prepareDb, storageErrorMessage, upsertNeighborhood } from "@/lib/server/app-db";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);

  if (!body?.name || String(body.name).trim().length < 2) {
    return NextResponse.json({ error: "Informe o nome do bairro." }, { status: 400 });
  }

  const db = upsertNeighborhood({
    id: body.id,
    name: String(body.name),
    area: String(body.area || "Toledo"),
    served: Boolean(body.served),
    color: String(body.color || "#facc15"),
    notes: String(body.notes || ""),
    position: {
      x: Number(body.position?.x ?? 50),
      y: Number(body.position?.y ?? 50),
    },
  });

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json({ neighborhoods: db.neighborhoods });
}

export async function PATCH(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids.map((id: string) => String(id)) : [];
  const action = String(body?.action || "");

  if (ids.length === 0) {
    return NextResponse.json({ error: "Selecione pelo menos um bairro." }, { status: 400 });
  }

  if (!["serve", "pause", "delete"].includes(action)) {
    return NextResponse.json({ error: "Acao invalida para bairros." }, { status: 400 });
  }

  const db = bulkUpdateNeighborhoods(ids, action as "serve" | "pause" | "delete");
  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json({ neighborhoods: db.neighborhoods });
}
