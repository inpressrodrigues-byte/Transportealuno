import { NextResponse } from "next/server";
import { getContract, signContract } from "@/lib/server/app-db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const payload = getContract(id);

  if (!payload) {
    return NextResponse.json({ error: "Contrato nao encontrado." }, { status: 404 });
  }

  return NextResponse.json(payload);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const { error, contract } = signContract({
    id,
    signerName: String(body?.signerName || ""),
    signerDocument: String(body?.signerDocument || ""),
  });

  if (error || !contract) {
    return NextResponse.json({ error: error || "Nao foi possivel assinar." }, { status: 400 });
  }

  return NextResponse.json({ contract });
}
