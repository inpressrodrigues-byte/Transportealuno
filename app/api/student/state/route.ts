import { NextResponse } from "next/server";
import { getStudentDashboard, prepareDb } from "@/lib/server/app-db";

export async function GET(request: Request) {
  await prepareDb();
  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId") || "";
  const payload = getStudentDashboard(childId);

  if (!payload) {
    return NextResponse.json({ error: "Aluno nao encontrado." }, { status: 404 });
  }

  return NextResponse.json(payload);
}
