import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/server/app-db";
import { makeId, todayIso } from "@/lib/app-utils";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parentId = String(body?.parentId || "");
  const childId = String(body?.childId || "");
  const month = String(body?.month || "").trim();
  const dueDate = String(body?.dueDate || "").trim();
  const amount = Number(body?.amount || 0);

  if (!parentId || !childId || !month || !dueDate || amount <= 0) {
    return NextResponse.json(
      { error: "Informe responsavel, aluno, mes, vencimento e valor." },
      { status: 400 }
    );
  }

  const db = mutateDb((draft) => {
    const parent = draft.parents.find((item) => item.id === parentId);
    const child = draft.children.find((item) => item.id === childId && item.parentId === parentId);
    if (!parent || !child) return;

    draft.payments.push({
      id: makeId("pay"),
      parentId,
      childId,
      month,
      dueDate,
      amount,
      status: "pending_proof",
      createdAt: todayIso(),
    });
  });

  return NextResponse.json({ payments: db.payments });
}
