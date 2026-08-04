import { NextResponse } from "next/server";
import { createReceipt, mutateDb, persistDb, prepareDb, storageErrorMessage } from "@/lib/server/app-db";
import type { PaymentStatus } from "@/lib/app-types";
import { makeId, todayIso } from "@/lib/app-utils";

const statuses: PaymentStatus[] = ["pending_proof", "proof_received", "approved", "rejected"];

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await prepareDb();
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const status = String(body?.status || "") as PaymentStatus;

  if (!statuses.includes(status)) {
    return NextResponse.json({ error: "Status invalido." }, { status: 400 });
  }

  let error = "";

  const db = mutateDb((draft) => {
    const payment = draft.payments.find((item) => item.id === id);
    if (!payment) {
      error = "Pagamento nao encontrado.";
      return;
    }

    if (status === "approved" && !payment.proof) {
      error = "Anexe o comprovante antes de aprovar ou gerar recibo.";
      return;
    }

    payment.status = status;

    if ((status === "approved" || status === "proof_received") && payment.proof && !payment.receipt) {
      const parent = draft.parents.find((item) => item.id === payment.parentId);
      const child = draft.children.find((item) => item.id === payment.childId);
      const company = draft.companies.find((item) => item.id === payment.companyId);
      if (parent && child) {
        payment.receipt = createReceipt(payment, parent, child, company?.settings || draft.settings);
      }
    }

    const child = draft.children.find((item) => item.id === payment.childId);
    const labels: Record<PaymentStatus, string> = {
      pending_proof: "aguardando comprovante",
      proof_received: "comprovante recebido",
      approved: "pagamento aprovado e recibo liberado",
      rejected: "comprovante recusado",
    };
    draft.notifications = [
      {
        id: makeId("notification"),
        companyId: payment.companyId,
        parentId: payment.parentId,
        childId: payment.childId,
        driverId: child?.driverId,
        type: "payment" as const,
        title: "Mensalidade atualizada",
        message: `${payment.month}: ${labels[status]}.`,
        createdAt: todayIso(),
        readAt: "",
      },
      ...draft.notifications,
    ].slice(0, 1200);
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (storageError) {
    return NextResponse.json({ error: storageErrorMessage(storageError) }, { status: 503 });
  }
  return NextResponse.json({ payments: db.payments });
}
