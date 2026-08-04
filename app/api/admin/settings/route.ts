import { NextResponse } from "next/server";
import { persistDb, prepareDb, storageErrorMessage, updateCompanyProfile } from "@/lib/server/app-db";
import type { CompanySettings, ThemeSettings } from "@/lib/app-types";

export async function PUT(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "");
  const settings = body?.settings as Partial<CompanySettings> | undefined;
  const theme = body?.theme as Partial<ThemeSettings> | undefined;

  const result = updateCompanyProfile(companyId || undefined, settings, theme);

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json({
    settings: result.settings,
    theme: result.theme,
    currentCompany: result.currentCompany,
  });
}
