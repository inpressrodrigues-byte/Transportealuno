import { NextResponse } from "next/server";
import { getStudentDashboard, persistDb, prepareDb, readDb, storageErrorMessage, updateChildAbsence } from "@/lib/server/app-db";
import type { ChildAbsenceStatus } from "@/lib/app-types";

const statuses: ChildAbsenceStatus[] = ["going", "not_going", "not_returning"];

export async function PUT(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const childId = String(body?.childId || "");
  const status = body?.status as ChildAbsenceStatus;

  if (!childId || !statuses.includes(status)) {
    return NextResponse.json({ error: "Informe aluno e status valido." }, { status: 400 });
  }

  const child = readDb().children.find((item) => item.id === childId && item.active);
  if (!child) {
    return NextResponse.json({ error: "Aluno nao encontrado." }, { status: 404 });
  }

  const { error } = updateChildAbsence(child.parentId, child.id, status);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(getStudentDashboard(child.id));
}
