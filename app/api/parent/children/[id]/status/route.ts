import { NextResponse } from "next/server";
import { persistDb, prepareDb, storageErrorMessage, updateChildAbsence } from "@/lib/server/app-db";
import type { ChildAbsenceStatus } from "@/lib/app-types";

const statuses: ChildAbsenceStatus[] = ["going", "not_going", "not_returning"];

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await prepareDb();
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parentId = String(body?.parentId || "");
  const status = body?.status as ChildAbsenceStatus;

  if (!parentId || !statuses.includes(status)) {
    return NextResponse.json({ error: "Informe aluno e status valido." }, { status: 400 });
  }

  const { db, error } = updateChildAbsence(parentId, id, status);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json({
    children: db.children.filter((child) => child.parentId === parentId),
    checkins: db.checkins.filter((checkin) => checkin.parentId === parentId),
  });
}
