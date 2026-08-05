import { NextResponse } from "next/server";
import {
  generateUpcomingPayments,
  persistDb,
  prepareDb,
  storageErrorMessage,
} from "@/lib/server/app-db";
import { scopedAdminPayload } from "@/lib/server/admin-request";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "") || undefined;
  const result = generateUpcomingPayments({ companyId, force: true });

  if (result.created > 0) {
    try {
      await persistDb();
    } catch (error) {
      return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
    }
  }

  return NextResponse.json({
    ...scopedAdminPayload(request, companyId),
    generated: result.created,
    month: result.month,
    eligible: result.eligible,
    skippedDuplicates: result.skippedDuplicates,
    skippedMissingParent: result.skippedMissingParent,
  });
}
