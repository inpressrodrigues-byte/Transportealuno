import { NextResponse } from "next/server";
import { assignChildTransport, getAdminPayload, persistDb, prepareDb, storageErrorMessage } from "@/lib/server/app-db";
import type { Shift } from "@/lib/app-types";

export async function PATCH(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);

  const { error } = assignChildTransport({
    childId: String(body?.childId || ""),
    driverId: String(body?.driverId || ""),
    vanId: String(body?.vanId || ""),
    shift: String(body?.shift || "") as Shift | "",
    companyId: String(body?.companyId || ""),
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(getAdminPayload(String(body?.companyId || "") || undefined));
}
