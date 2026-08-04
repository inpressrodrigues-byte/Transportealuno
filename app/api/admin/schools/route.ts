import { NextResponse } from "next/server";
import { bulkUpdateSchools, deleteSchool, persistDb, prepareDb, storageErrorMessage, upsertSchool } from "@/lib/server/app-db";
import { schoolCategories, shifts } from "@/lib/app-utils";
import type { SchoolCategory, Shift } from "@/lib/app-types";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);

  if (!body?.name || String(body.name).trim().length < 2) {
    return NextResponse.json({ error: "Informe o nome da escola." }, { status: 400 });
  }

  const db = upsertSchool({
    id: body.id,
    name: String(body.name),
    city: String(body.city || "Toledo, PR"),
    category: schoolCategories.includes(body.category) ? (body.category as SchoolCategory) : "particular",
    address: String(body.address || ""),
    neighborhood: String(body.neighborhood || "Toledo"),
    served: Boolean(body.served),
    servedShifts: Array.isArray(body.servedShifts)
      ? body.servedShifts.filter((item: Shift) => shifts.includes(item))
      : [],
    active: body.active ?? true,
  });

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json({ schools: db.schools });
}

export async function DELETE(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const id = String(body?.id || "");

  if (!id) {
    return NextResponse.json({ error: "Informe a escola para excluir." }, { status: 400 });
  }

  const db = deleteSchool(id);
  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json({ schools: db.schools });
}

export async function PATCH(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids.map((id: string) => String(id)) : [];
  const action = String(body?.action || "");

  if (ids.length === 0) {
    return NextResponse.json({ error: "Selecione pelo menos uma escola." }, { status: 400 });
  }

  if (!["serve", "pause", "delete"].includes(action)) {
    return NextResponse.json({ error: "Acao invalida para escolas." }, { status: 400 });
  }

  const db = bulkUpdateSchools(ids, action as "serve" | "pause" | "delete");
  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json({ schools: db.schools });
}
