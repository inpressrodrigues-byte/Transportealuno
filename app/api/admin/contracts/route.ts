import { NextResponse } from "next/server";
import { createContract, getAdminPayload, updateContractTemplate } from "@/lib/server/app-db";

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "");
  const { error } = updateContractTemplate(companyId || undefined, String(body?.template || ""));

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(getAdminPayload(companyId || undefined));
}

export async function POST(request: Request) {
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

  return NextResponse.json({ ...getAdminPayload(companyId || undefined), contract });
}
