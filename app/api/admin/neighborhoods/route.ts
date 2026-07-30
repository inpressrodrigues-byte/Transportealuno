import { NextResponse } from "next/server";
import { upsertNeighborhood } from "@/lib/server/app-db";

export async function POST(request: Request) {
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

  return NextResponse.json({ neighborhoods: db.neighborhoods });
}
