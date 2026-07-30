import { NextResponse } from "next/server";
import { hashSecret, readDb } from "@/lib/server/app-db";
import { normalizeContact } from "@/lib/app-utils";
import type { SessionUser } from "@/lib/app-types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const contact = normalizeContact(String(body?.contact || ""));
  const password = String(body?.password || "");

  if (!contact || !password) {
    return NextResponse.json({ error: "Informe contato e senha." }, { status: 400 });
  }

  const db = readDb();
  const passwordHash = hashSecret(password);

  const admin = db.admins.find(
    (item) => normalizeContact(item.contact) === contact && item.passwordHash === passwordHash
  );

  if (admin) {
    const user: SessionUser = {
      id: admin.id,
      role: "admin",
      name: admin.name,
      contact: admin.contact,
    };

    return NextResponse.json({ user });
  }

  const parent = db.parents.find(
    (item) =>
      item.active &&
      normalizeContact(item.contact) === contact &&
      item.cpfHash === passwordHash
  );

  if (!parent) {
    return NextResponse.json({ error: "Contato ou senha invalidos." }, { status: 401 });
  }

  const user: SessionUser = {
    id: parent.id,
    role: "parent",
    name: parent.name,
    contact: parent.contact,
  };

  return NextResponse.json({ user });
}
