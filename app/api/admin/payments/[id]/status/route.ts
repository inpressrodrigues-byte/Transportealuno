import { NextResponse } from "next/server";
import { createReceipt, mutateDb } from "@/lib/server/app-db";
import type { PaymentStatus } from "@/lib/app-types";

const statuses: PaymentStatus[] = ["pending_proof", "proof_received", "approved", "rejected"];

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ payments: db.payments });
}
