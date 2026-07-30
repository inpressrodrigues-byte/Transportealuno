import { NextResponse } from "next/server";
import { hashSecret, mutateDb } from "@/lib/server/app-db";
import { makeId, normalizeContact, normalizeCpf, todayIso } from "@/lib/app-utils";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parentId = String(body?.parentId || "");
  const name = String(body?.name || "").trim();
  const cpf = normalizeCpf(String(body?.cpf || ""));
  const birthDate = String(body?.birthDate || "");
  const schoolId = String(body?.schoolId || "");

  if (!parentId || !name || cpf.length !== 11 || !birthDate || !schoolId) {
    return NextResponse.json(
      { error: "Informe responsavel, nome, CPF, nascimento e escola do aluno." },
      { status: 400 }
    );
  }

  const cpfHash = hashSecret(cpf);
  let error = "";

  const db = mutateDb((draft) => {
    const parent = draft.parents.find((item) => item.id === parentId && item.active);
    const school = draft.schools.find((item) => item.id === schoolId && item.active);
    if (!parent) {
      error = "Responsavel nao encontrado. Entre novamente na area dos pais.";
      return;
    }
    if (!school) {
      error = "Escola nao encontrada. Selecione outra escola.";
      return;
    }

    const duplicated = draft.children.find(
      (child) => child.parentId === parentId && child.cpfHash === cpfHash && child.active
    );
    if (duplicated) {
      error = "Este aluno ja esta cadastrado neste perfil.";
      return;
    }

    draft.children.push({
      id: makeId("child"),
      companyId: parent.companyId,
      parentId,
      name,
      cpfHash,
      cpfLast4: cpf.slice(-4),
      birthDate,
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
      absenceStatus: "going",
      absenceDate: todayIso().slice(0, 10),
      absenceUpdatedAt: todayIso(),
      active: true,
      createdAt: todayIso(),
    });
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({
    children: db.children.filter((child) => child.parentId === parentId),
    payments: db.payments.filter((payment) => payment.parentId === parentId),
  });
}
