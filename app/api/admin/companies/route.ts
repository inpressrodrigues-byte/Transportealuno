import { NextResponse } from "next/server";
import { getAdminPayload, persistDb, prepareDb, storageErrorMessage, upsertCompany } from "@/lib/server/app-db";
import type { CompanySettings, ThemeSettings } from "@/lib/app-types";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);

  const { error, companyId } = upsertCompany({
    id: String(body?.id || ""),
    name: String(body?.name || ""),
    document: String(body?.document || body?.settings?.document || ""),
    password: String(body?.password || ""),
    active: body?.active ?? true,
    settings: body?.settings as Partial<CompanySettings> | undefined,
    theme: body?.theme as Partial<ThemeSettings> | undefined,
    contractTemplate: String(body?.contractTemplate || ""),
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(getAdminPayload(companyId || undefined));
}
