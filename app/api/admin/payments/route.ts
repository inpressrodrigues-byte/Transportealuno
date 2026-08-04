import { NextResponse } from "next/server";
import { getAdminPayload, mutateDb, persistDb, prepareDb, readDb, storageErrorMessage } from "@/lib/server/app-db";
import { makeId, todayIso } from "@/lib/app-utils";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const id = String(body?.id || "");
  const parentId = String(body?.parentId || "");
  const childId = String(body?.childId || "");
  const month = String(body?.month || "").trim();
  const dueDate = String(body?.dueDate || "").trim();
  const amount = Number(body?.amount || 0);
  const chargeEnabled = body?.chargeEnabled !== false;
  const paymentMethod = ["pix", "boleto", "card", "cash"].includes(String(body?.paymentMethod || ""))
    ? String(body.paymentMethod) as "pix" | "boleto" | "card" | "cash"
    : "pix";
  const externalReference = String(body?.externalReference || "").trim();
  const requestedCompanyId = String(body?.companyId || "");
  const currentDb = readDb();
  const activeCompanyId =
    currentDb.companies.find((company) => company.id === requestedCompanyId)?.id ||
    currentDb.currentCompanyId ||
    currentDb.companies[0]?.id;

  if (!parentId || !childId || !month || !dueDate || (chargeEnabled && amount <= 0)) {
    return NextResponse.json(
      { error: "Informe responsavel, aluno, mes, vencimento e valor." },
      { status: 400 }
    );
  }

  let error = "";
  mutateDb((draft) => {
    const companyId = activeCompanyId || draft.currentCompanyId || draft.companies[0]?.id;
    const parent = draft.parents.find((item) => item.id === parentId && (item.companyId || companyId) === companyId);
    const child = draft.children.find(
      (item) => item.id === childId && item.parentId === parentId && (item.companyId || companyId) === companyId
    );
    if (!parent || !child) {
      error = "Responsavel ou aluno nao encontrado.";
      return;
    }

    const existing = id
      ? draft.payments.find((payment) => payment.id === id && (payment.companyId || companyId) === companyId)
      : undefined;
    if (id && !existing) {
      error = "Mensalidade nao encontrada.";
      return;
    }

    if (existing) {
      existing.parentId = parentId;
      existing.childId = childId;
      existing.month = month;
      existing.dueDate = dueDate;
      existing.amount = amount;
      existing.chargeEnabled = chargeEnabled;
      existing.paymentMethod = paymentMethod;
      existing.externalReference = externalReference;
      if (existing.receipt) {
        existing.receipt.amount = amount;
        existing.receipt.month = month;
        existing.receipt.payerName = parent.name;
        existing.receipt.childName = child.name;
      }
      return;
    }

    const duplicate = draft.payments.find(
      (payment) =>
        payment.childId === childId &&
        (payment.companyId || companyId) === companyId &&
        (payment.month.toLowerCase() === month.toLowerCase() || payment.dueDate.slice(0, 7) === dueDate.slice(0, 7))
    );
    if (duplicate) {
      error = "Ja existe uma mensalidade deste aluno para o mes informado.";
      return;
    }

    draft.payments.push({
      id: makeId("pay"),
      companyId,
      parentId,
      childId,
      month,
      dueDate,
      amount,
      chargeEnabled,
      automatic: false,
      paymentMethod,
      externalReference,
      status: "pending_proof",
      createdAt: todayIso(),
    });
  });

  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    await persistDb();
  } catch (storageError) {
    return NextResponse.json({ error: storageErrorMessage(storageError) }, { status: 503 });
  }
  return NextResponse.json(getAdminPayload(activeCompanyId));
}

export async function DELETE(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const id = String(body?.id || "");
  const companyId = String(body?.companyId || "");
  if (!id) return NextResponse.json({ error: "Informe a mensalidade." }, { status: 400 });

  let error = "";
  mutateDb((draft) => {
    const activeCompanyId =
      draft.companies.find((company) => company.id === companyId)?.id ||
      draft.currentCompanyId ||
      draft.companies[0]?.id;
    const found = draft.payments.find(
      (payment) => payment.id === id && (payment.companyId || activeCompanyId) === activeCompanyId
    );
    if (!found) {
      error = "Mensalidade nao encontrada.";
      return;
    }
    draft.payments = draft.payments.filter((payment) => payment.id !== id);
    draft.notifications = draft.notifications.filter(
      (notification) => !(notification.type === "payment" && notification.parentId === found.parentId && notification.childId === found.childId)
    );
  });

  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    await persistDb();
  } catch (storageError) {
    return NextResponse.json({ error: storageErrorMessage(storageError) }, { status: 503 });
  }
  return NextResponse.json(getAdminPayload(companyId || undefined));
}
