import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/server/app-db";
import type { CompanySettings, ThemeSettings } from "@/lib/app-types";

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const settings = body?.settings as Partial<CompanySettings> | undefined;
  const theme = body?.theme as Partial<ThemeSettings> | undefined;

  const db = mutateDb((draft) => {
    if (settings) {
      draft.settings = {
        ...draft.settings,
        ...settings,
        brandName: settings.brandName?.trim() || draft.settings.brandName,
        businessName: settings.businessName?.trim() || draft.settings.businessName,
        pixKey: settings.pixKey?.trim() || draft.settings.pixKey,
      };
    }

    if (theme) {
      draft.theme = {
        ...draft.theme,
        ...theme,
      };
    }
  });

  return NextResponse.json({
    settings: db.settings,
    theme: db.theme,
  });
}
