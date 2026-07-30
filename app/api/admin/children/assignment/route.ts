import { NextResponse } from "next/server";
import { assignChildTransport, getAdminPayload } from "@/lib/server/app-db";
import type { Shift } from "@/lib/app-types";

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);

  const { error } = assignChildTransport({
    childId: String(body?.childId || ""),
    driverId: String(body?.driverId || ""),
    vanId: String(body?.vanId || ""),
    shift: String(body?.shift || "") as Shift | "",
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(getAdminPayload());
}
