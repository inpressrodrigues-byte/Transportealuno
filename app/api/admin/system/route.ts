import { NextResponse } from "next/server";
import {
  createCompanyTestData,
  createSupabaseBackup,
  getAdminPayload,
  passwordMatches,
  persistDb,
  prepareDb,
  readDb,
  removeCompanyTestData,
  resetCompanyOperationalData,
  storageErrorMessage,
} from "@/lib/server/app-db";

export async function POST(request: Request) {
  await prepareDb();
  const body = await request.json().catch(() => null);
  const action = String(body?.action || "");
  const companyId = String(body?.companyId || "") || undefined;

  if (action === "seed_test_data" || action === "delete_test_data") {
    if (request.headers.get("x-rota-role") !== "admin") {
      return NextResponse.json({ error: "Apenas o administrador pode gerenciar dados de teste." }, { status: 403 });
    }

    try {
      const testData = action === "seed_test_data"
        ? createCompanyTestData(companyId).created
        : removeCompanyTestData(companyId).removed;
      await persistDb();
      return NextResponse.json({
        ...getAdminPayload(companyId),
        testData,
        testDataAction: action,
      });
    } catch (error) {
      return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
    }
  }

  const login = String(body?.login || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const admin = readDb().admins.find(
    (item) =>
      (item.login || item.contact).trim().toLowerCase() === login &&
      passwordMatches(item.passwordHash, password)
  );

  if (!admin) {
    return NextResponse.json({ error: "Senha administrativa incorreta." }, { status: 401 });
  }

  try {
    if (action === "backup") {
      const backup = await createSupabaseBackup("manual", true);
      return NextResponse.json({ backup });
    }

    if (action !== "reset" || String(body?.confirmation || "").trim().toUpperCase() !== "ZERAR") {
      return NextResponse.json({ error: "Digite ZERAR para confirmar a limpeza." }, { status: 400 });
    }

    await createSupabaseBackup("before_reset", true);
    resetCompanyOperationalData(companyId);
    await persistDb();
    return NextResponse.json(getAdminPayload(companyId));
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
}
