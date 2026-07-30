import { NextResponse } from "next/server";
import { hashSecret, readDb } from "@/lib/server/app-db";
import { normalizeContact, normalizeDigits } from "@/lib/app-utils";
import type { SessionUser } from "@/lib/app-types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawLogin = String(body?.contact || body?.login || "").trim();
  const contact = normalizeContact(rawLogin);
  const password = String(body?.password || "");

  if (!rawLogin || !password) {
    return NextResponse.json({ error: "Informe usuario e senha." }, { status: 400 });
  }

  const db = readDb();
  const passwordHash = hashSecret(password);

  const admin = db.admins.find((item) => {
    const adminLogin = String(item.login || item.contact || "").trim();
    const adminContact = normalizeContact(item.contact);
    const sameLogin = adminLogin.toLowerCase() === rawLogin.toLowerCase();
    const sameContact = Boolean(contact && adminContact && adminContact === contact);
    return (sameLogin || sameContact) && item.passwordHash === passwordHash;
  });

  if (admin) {
    const user: SessionUser = {
      id: admin.id,
      role: "admin",
      name: admin.name,
      contact: admin.login || admin.contact,
    };

    return NextResponse.json({ user });
  }

  const document = normalizeDigits(rawLogin);
  const company = db.companies.find(
    (item) =>
      item.active &&
      Boolean(document) &&
      normalizeDigits(item.document) === document &&
      item.passwordHash === passwordHash
  );

  if (company) {
    const user: SessionUser = {
      id: company.id,
      role: "company",
      name: company.name,
      contact: company.document,
      companyId: company.id,
    };

    return NextResponse.json({ user });
  }

  const driver = db.drivers.find(
    (item) =>
      item.active &&
      Boolean(contact) &&
      normalizeContact(item.contact) === contact &&
      item.cpfHash === passwordHash
  );

  if (driver) {
    const user: SessionUser = {
      id: driver.id,
      role: "driver",
      name: driver.name,
      contact: driver.contact,
      companyId: driver.companyId,
    };

    return NextResponse.json({ user });
  }

  const parent = db.parents.find(
    (item) =>
      item.active &&
      Boolean(contact) &&
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
    companyId: parent.companyId,
  };

  return NextResponse.json({ user });
}
