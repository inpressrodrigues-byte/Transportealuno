import { NextResponse } from "next/server";
import { generateRoutePlan } from "@/lib/server/app-db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { error, routePlan } = generateRoutePlan({
    driverId: String(body?.driverId || ""),
    companyId: String(body?.companyId || "") || undefined,
  });

  if (error || !routePlan) {
    return NextResponse.json({ error: error || "Nao foi possivel gerar a rota." }, { status: 400 });
  }

  return NextResponse.json({ routePlan });
}
