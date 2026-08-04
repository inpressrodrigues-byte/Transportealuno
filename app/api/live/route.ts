import { NextResponse } from "next/server";
import { getLiveTracking, prepareDb, readDb } from "@/lib/server/app-db";

export async function GET(request: Request) {
  await prepareDb();
  const { searchParams } = new URL(request.url);
  const requestedDriverId = searchParams.get("driverId") || "";
  const role = request.headers.get("x-rota-role");
  const userId = request.headers.get("x-rota-user-id") || "";
  const companyId = request.headers.get("x-rota-company-id") || "";
  const db = readDb();

  if (role === "driver" && requestedDriverId && requestedDriverId !== userId) {
    return NextResponse.json({ error: "Acesso permitido somente a propria rota." }, { status: 403 });
  }

  if (role === "company" && requestedDriverId) {
    const driver = db.drivers.find((item) => item.id === requestedDriverId && item.companyId === companyId);
    if (!driver) {
      return NextResponse.json({ error: "Motorista nao pertence a esta empresa." }, { status: 403 });
    }
  }

  if ((role === "parent" || role === "child") && requestedDriverId) {
    const childIds = role === "child"
      ? new Set([userId])
      : new Set(db.children.filter((child) => child.parentId === userId).map((child) => child.id));
    const allowed = db.children.some(
      (child) => childIds.has(child.id) && child.driverId === requestedDriverId
    );
    if (!allowed) {
      return NextResponse.json({ error: "Esta rota nao esta vinculada ao aluno." }, { status: 403 });
    }
  }

  return NextResponse.json(getLiveTracking(requestedDriverId || (role === "driver" ? userId : undefined)));
}
