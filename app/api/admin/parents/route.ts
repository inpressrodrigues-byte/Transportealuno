import { NextResponse } from "next/server";
import { getAdminPayload, hashSecret, mutateDb } from "@/lib/server/app-db";
import { makeId, normalizeContact, normalizeCpf, todayIso } from "@/lib/app-utils";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name || "").trim();
  const contact = normalizeContact(String(body?.contact || ""));
  const cpf = normalizeCpf(String(body?.cpf || ""));

  if (!name || !contact || cpf.length !== 11) {
    return NextResponse.json(
      { error: "Informe nome, contato e CPF com 11 digitos." },
      { status: 400 }
    );
  }

  mutateDb((draft) => {
    const existing = draft.parents.find((parent) => normalizeContact(parent.contact) === contact);
    if (existing) {
      existing.name = name;
      existing.email = String(body?.email || existing.email || "");
      existing.cpfHash = hashSecret(cpf);
      existing.cpfLast4 = cpf.slice(-4);
      existing.active = body?.active ?? true;
      return;
    }

    draft.parents.push({
      id: makeId("parent"),
      name,
      contact,
      email: String(body?.email || ""),
      cpfHash: hashSecret(cpf),
      cpfLast4: cpf.slice(-4),
      active: true,
      createdAt: todayIso(),
    });
  });

  return NextResponse.json(getAdminPayload());
}
