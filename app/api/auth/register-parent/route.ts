import { NextResponse } from "next/server";
import { hashSecret, mutateDb } from "@/lib/server/app-db";
import { makeId, normalizeContact, normalizeCpf, todayIso } from "@/lib/app-utils";
import type { SessionUser } from "@/lib/app-types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name || "").trim();
  const contact = normalizeContact(String(body?.contact || ""));
  const email = String(body?.email || "").trim();
  const cpf = normalizeCpf(String(body?.cpf || ""));

  if (!name || contact.length < 10 || cpf.length !== 11) {
    return NextResponse.json(
      { error: "Informe nome, WhatsApp e CPF com 11 digitos." },
      { status: 400 }
    );
  }

  const cpfHash = hashSecret(cpf);
  let error = "";
  let user: SessionUser | null = null;

  mutateDb((draft) => {
    const existing = draft.parents.find((parent) => normalizeContact(parent.contact) === contact);

    if (existing && existing.cpfHash !== cpfHash) {
      error = "Este WhatsApp ja existe. Entre com o CPF cadastrado ou fale com a empresa.";
      return;
    }

    if (existing) {
      existing.name = name;
      existing.email = email || existing.email;
      existing.active = true;
      user = {
        id: existing.id,
        role: "parent",
        name: existing.name,
        contact: existing.contact,
      };
      return;
    }

    const id = makeId("parent");
    draft.parents.push({
      id,
      name,
      contact,
      email,
      cpfHash,
      cpfLast4: cpf.slice(-4),
      active: true,
      createdAt: todayIso(),
    });

    user = {
      id,
      role: "parent",
      name,
      contact,
    };
  });

  if (error || !user) {
    return NextResponse.json({ error: error || "Nao foi possivel criar o acesso." }, { status: 409 });
  }

  return NextResponse.json({ user });
}
