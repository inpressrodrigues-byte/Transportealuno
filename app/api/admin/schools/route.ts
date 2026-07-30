import { NextResponse } from "next/server";
import { upsertSchool } from "@/lib/server/app-db";
import { schoolCategories, shifts } from "@/lib/app-utils";
import type { SchoolCategory, Shift } from "@/lib/app-types";

export async function POST(request: Request) {
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

  return NextResponse.json({ schools: db.schools });
}
