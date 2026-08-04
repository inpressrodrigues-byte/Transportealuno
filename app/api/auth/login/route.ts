import { NextResponse } from "next/server";
import { hashSecret, passwordMatches, prepareDb, readDb } from "@/lib/server/app-db";
import { normalizeContact, normalizeDigits } from "@/lib/app-utils";
import type { SessionUser } from "@/lib/app-types";

export async function POST(request: Request) {
  await prepareDb();
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
    return (sameLogin || sameContact) && passwordMatches(item.passwordHash, password);
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
      passwordMatches(item.passwordHash, password)
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

  const childCpf = normalizeDigits(rawLogin).slice(0, 11);
  const child = db.children.find(
    (item) =>
      item.active &&
      Boolean(childCpf) &&
      item.cpfHash === hashSecret(childCpf) &&
      birthDateMatches(item.birthDate, password)
  );

  if (child) {
    const parent = db.parents.find((item) => item.id === child.parentId);
    const user: SessionUser = {
      id: child.id,
      role: "child",
      name: child.name,
      contact: parent?.contact || child.responsiblePhone,
      companyId: child.companyId || parent?.companyId,
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

function birthDateMatches(stored: string, password: string) {
  const raw = password.trim();
  const digits = normalizeDigits(raw);
  const storedDigits = normalizeDigits(stored);
  const ddmmyyyy = digits.length === 8 ? `${digits.slice(4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}` : "";
  const yyyymmdd = digits.length === 8 ? `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}` : "";

  return Boolean(stored && (raw === stored || digits === storedDigits || ddmmyyyy === stored || yyyymmdd === stored));
}
