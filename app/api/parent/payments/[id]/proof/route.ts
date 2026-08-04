import { NextResponse } from "next/server";
import { createReceipt, mutateDb, persistDb, prepareDb, storageErrorMessage } from "@/lib/server/app-db";
import { todayIso } from "@/lib/app-utils";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await prepareDb();
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parentId = String(body?.parentId || "");
  const fileName = String(body?.fileName || "");
  const fileType = String(body?.fileType || "");
  const fileData = String(body?.fileData || "");

  if (!parentId || !fileName || !fileData) {
    return NextResponse.json(
      { error: "Anexe o comprovante para liberar o recibo." },
      { status: 400 }
    );
  }

  if (fileData.length > 1_800_000) {
    return NextResponse.json(
      { error: "Comprovante muito grande. Envie uma imagem ou PDF menor." },
      { status: 400 }
    );
  }

  let error = "";

  const db = mutateDb((draft) => {
    const payment = draft.payments.find(
      (item) => item.id === id && item.parentId === parentId
    );

    if (!payment) {
      error = "Pagamento nao encontrado.";
      return;
    }
    if (!payment.chargeEnabled) {
      error = "Esta mensalidade esta sem cobranca e nao precisa de comprovante.";
      return;
    }

    const parent = draft.parents.find((item) => item.id === parentId);
    const child = draft.children.find((item) => item.id === payment.childId);
    const company = draft.companies.find((item) => item.id === payment.companyId);

    if (!parent || !child) {
      error = "Dados do recibo incompletos.";
      return;
    }

    payment.proof = {
      fileName,
      fileType,
      fileData,
      uploadedAt: todayIso(),
    };
    payment.status = "proof_received";
    payment.receipt = createReceipt(payment, parent, child, company?.settings || draft.settings);
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json({
    payments: db.payments.filter((payment) => payment.parentId === parentId),
  });
}
