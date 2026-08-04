import { NextResponse } from "next/server";
import {
  createSupabaseBackup,
  generateUpcomingPayments,
  persistDb,
  prepareDb,
  storageErrorMessage,
} from "@/lib/server/app-db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  try {
    await prepareDb();
    const billing = generateUpcomingPayments();
    if (billing.created > 0) await persistDb();
    const backup = await createSupabaseBackup("daily");

    return NextResponse.json({
      success: true,
      generatedPayments: billing.created,
      billingMonth: billing.month,
      backup,
    });
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
}
