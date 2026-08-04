import { NextResponse } from "next/server";
import { generateRoutePlan, persistDb, prepareDb } from "@/lib/server/app-db";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const { error, routePlan } = generateRoutePlan({
    driverId: String(body?.driverId || ""),
    companyId: String(body?.companyId || "") || undefined,
  });

  if (error || !routePlan) {
    return NextResponse.json({ error: error || "Nao foi possivel gerar a rota." }, { status: 400 });
  }

  await persistDb();
  return NextResponse.json({ routePlan });
}
