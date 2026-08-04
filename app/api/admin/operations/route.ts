import { NextResponse } from "next/server";
import type {
  DriverDocumentRecord,
  DriverOccurrenceRecord,
  ExpenseRecord,
  FuelRecord,
  VehicleMaintenanceRecord,
} from "@/lib/app-types";
import {
  deleteOperationRecord,
  getAdminPayload,
  persistDb,
  prepareDb,
  upsertDriverDocument,
  upsertDriverOccurrence,
  upsertExpense,
  upsertFuelRecord,
  upsertVehicleMaintenance,
} from "@/lib/server/app-db";

type OperationEntity = "driverDocument" | "driverOccurrence" | "maintenance" | "fuel" | "expense";
const entities: OperationEntity[] = ["driverDocument", "driverOccurrence", "maintenance", "fuel", "expense"];

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const entity = String(body?.entity || "") as OperationEntity;
  const companyId = String(body?.companyId || "") || undefined;
  const record = body?.record || {};
  let result: { error: string };

  if (!entities.includes(entity)) {
    return NextResponse.json({ error: "Tipo de registro invalido." }, { status: 400 });
  }

  if (entity === "driverDocument") {
    result = upsertDriverDocument({ ...(record as Partial<DriverDocumentRecord>), driverId: String(record.driverId || ""), label: String(record.label || ""), companyId });
  } else if (entity === "driverOccurrence") {
    result = upsertDriverOccurrence({ ...(record as Partial<DriverOccurrenceRecord>), driverId: String(record.driverId || ""), title: String(record.title || ""), companyId });
  } else if (entity === "maintenance") {
    result = upsertVehicleMaintenance({ ...(record as Partial<VehicleMaintenanceRecord>), vanId: String(record.vanId || ""), title: String(record.title || ""), companyId });
  } else if (entity === "fuel") {
    result = upsertFuelRecord({ ...(record as Partial<FuelRecord>), vanId: String(record.vanId || ""), companyId });
  } else {
    result = upsertExpense({ ...(record as Partial<ExpenseRecord>), description: String(record.description || ""), companyId });
  }

  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  await persistDb();
  return NextResponse.json(getAdminPayload(companyId));
}

export async function DELETE(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const entity = String(body?.entity || "") as OperationEntity;
  const id = String(body?.id || "");
  const companyId = String(body?.companyId || "") || undefined;
  if (!id) return NextResponse.json({ error: "Informe o registro." }, { status: 400 });
  if (!entities.includes(entity)) return NextResponse.json({ error: "Tipo de registro invalido." }, { status: 400 });

  const result = deleteOperationRecord(entity, id, companyId);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  await persistDb();
  return NextResponse.json(getAdminPayload(companyId));
}
