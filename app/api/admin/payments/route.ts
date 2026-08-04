import { NextResponse } from "next/server";
import { getAdminPayload, mutateDb, persistDb, prepareDb, readDb } from "@/lib/server/app-db";
import { makeId, todayIso } from "@/lib/app-utils";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const parentId = String(body?.parentId || "");
  const childId = String(body?.childId || "");
  const month = String(body?.month || "").trim();
  const dueDate = String(body?.dueDate || "").trim();
  const amount = Number(body?.amount || 0);
  const requestedCompanyId = String(body?.companyId || "");
  const currentDb = readDb();
  const activeCompanyId =
    currentDb.companies.find((company) => company.id === requestedCompanyId)?.id ||
    currentDb.currentCompanyId ||
    currentDb.companies[0]?.id;

  if (!parentId || !childId || !month || !dueDate || amount <= 0) {
    return NextResponse.json(
      { error: "Informe responsavel, aluno, mes, vencimento e valor." },
      { status: 400 }
    );
  }

  mutateDb((draft) => {
    const companyId = activeCompanyId || draft.currentCompanyId || draft.companies[0]?.id;
    const parent = draft.parents.find((item) => item.id === parentId && (item.companyId || companyId) === companyId);
    const child = draft.children.find(
      (item) => item.id === childId && item.parentId === parentId && (item.companyId || companyId) === companyId
    );
    if (!parent || !child) return;

    draft.payments.push({
      id: makeId("pay"),
      companyId,
      parentId,
      childId,
      month,
      dueDate,
      amount,
      status: "pending_proof",
      createdAt: todayIso(),
    });
  });

  await persistDb();
  return NextResponse.json(getAdminPayload(activeCompanyId));
}
