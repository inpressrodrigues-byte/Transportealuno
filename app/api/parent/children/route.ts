import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/server/app-db";
import { makeId, normalizeContact, todayIso } from "@/lib/app-utils";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parentId = String(body?.parentId || "");
  const name = String(body?.name || "").trim();
  const schoolId = String(body?.schoolId || "");

  if (!parentId || !name || !schoolId) {
    return NextResponse.json(
      { error: "Informe responsavel, nome do aluno e escola." },
      { status: 400 }
    );
  }

  const db = mutateDb((draft) => {
    const parent = draft.parents.find((item) => item.id === parentId && item.active);
    const school = draft.schools.find((item) => item.id === schoolId && item.active);
    if (!parent || !school) return;

    draft.children.push({
      id: makeId("child"),
      parentId,
      name,
      birthDate: String(body?.birthDate || ""),
      schoolId,
      grade: String(body?.grade || ""),
      responsiblePhone: normalizeContact(String(body?.responsiblePhone || parent.contact)),
      address: {
        cep: String(body?.address?.cep || ""),
        street: String(body?.address?.street || ""),
        number: String(body?.address?.number || ""),
        complement: String(body?.address?.complement || ""),
        neighborhood: String(body?.address?.neighborhood || ""),
        city: String(body?.address?.city || ""),
        state: String(body?.address?.state || ""),
        latitude: body?.address?.latitude,
        longitude: body?.address?.longitude,
      },
      notes: String(body?.notes || ""),
      active: true,
      createdAt: todayIso(),
    });
  });

  return NextResponse.json({
    children: db.children.filter((child) => child.parentId === parentId),
    payments: db.payments.filter((payment) => payment.parentId === parentId),
  });
}
