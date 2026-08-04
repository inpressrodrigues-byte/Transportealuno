import { NextResponse } from "next/server";
import { createContract, persistDb, prepareDb, storageErrorMessage, updateContractTemplate } from "@/lib/server/app-db";
import { scopedAdminPayload } from "@/lib/server/admin-request";

export async function PUT(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "");
  const { error } = updateContractTemplate(companyId || undefined, String(body?.template || ""));

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(scopedAdminPayload(request, companyId || undefined));
}

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "");
  const { error, contract } = createContract({
    companyId: companyId || undefined,
    parentId: String(body?.parentId || ""),
    childId: String(body?.childId || ""),
    title: String(body?.title || ""),
  });

  if (error || !contract) {
    return NextResponse.json({ error: error || "Nao foi possivel gerar o contrato." }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json({ ...scopedAdminPayload(request, companyId || undefined), contract });
}
