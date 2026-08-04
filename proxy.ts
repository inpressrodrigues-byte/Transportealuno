import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

const companyAdminPaths = [
  "/api/admin/state",
  "/api/admin/settings",
  "/api/admin/contracts",
  "/api/admin/drivers",
  "/api/admin/vans",
  "/api/admin/children",
  "/api/admin/operations",
  "/api/admin/parents",
  "/api/admin/payments",
  "/api/admin/qr",
  "/api/admin/reports",
];

function denied(message = "Sessao expirada. Entre novamente.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

async function jsonBody(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") return null;
  if (!request.headers.get("content-type")?.includes("application/json")) return null;
  return request.clone().json().catch(() => null) as Promise<Record<string, unknown> | null>;
}

function forward(request: NextRequest, claims: NonNullable<ReturnType<typeof verifySessionToken>>) {
  const headers = new Headers(request.headers);
  headers.set("x-rota-role", claims.role);
  headers.set("x-rota-user-id", claims.sub);
  headers.set("x-rota-company-id", claims.companyId || "");
  return NextResponse.next({ request: { headers } });
}

export async function proxy(request: NextRequest) {
  const claims = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!claims) return denied();

  const path = request.nextUrl.pathname;
  const body = await jsonBody(request);

  if (path.startsWith("/api/admin/")) {
    if (claims.role === "admin") return forward(request, claims);
    if (claims.role !== "company" || !claims.companyId) return denied("Acesso administrativo negado.");
    if (!companyAdminPaths.some((allowed) => path === allowed || path.startsWith(`${allowed}/`))) {
      return denied("Esta configuracao e exclusiva do administrador geral.");
    }

    const requestedCompanyId =
      request.nextUrl.searchParams.get("companyId") ||
      String(body?.companyId || "");
    if (!requestedCompanyId || requestedCompanyId !== claims.companyId) {
      return denied("A empresa so pode acessar os proprios dados.");
    }
    return forward(request, claims);
  }

  if (path.startsWith("/api/parent/")) {
    if (claims.role !== "parent") return denied("Acesso de responsavel necessario.");
    const parentId =
      request.nextUrl.searchParams.get("parentId") ||
      String(body?.parentId || "");
    if (parentId !== claims.sub) return denied("Acesso permitido somente ao proprio perfil.");
    return forward(request, claims);
  }

  if (path.startsWith("/api/student/")) {
    if (claims.role !== "child") return denied("Acesso de aluno necessario.");
    const childId =
      request.nextUrl.searchParams.get("childId") ||
      String(body?.childId || "");
    if (childId !== claims.sub) return denied("Acesso permitido somente ao proprio perfil.");
    return forward(request, claims);
  }

  if (path.startsWith("/api/driver/")) {
    if (claims.role === "admin") return forward(request, claims);
    if (claims.role === "company") {
      const companyId = String(body?.companyId || claims.companyId || "");
      if (companyId !== claims.companyId) return denied("A empresa so pode acessar a propria rota.");
      return forward(request, claims);
    }
    if (claims.role !== "driver") return denied("Acesso de motorista necessario.");
    const driverId =
      request.nextUrl.searchParams.get("driverId") ||
      String(body?.driverId || "");
    if (driverId !== claims.sub) return denied("Acesso permitido somente ao proprio motorista.");
    return forward(request, claims);
  }

  if (path === "/api/checkin") {
    if (claims.role === "parent" && String(body?.parentId || "") === claims.sub) {
      return forward(request, claims);
    }
    if (claims.role === "child" && String(body?.childId || "") === claims.sub) {
      return forward(request, claims);
    }
    return denied("Entre como responsavel ou aluno para registrar o check-in.");
  }

  if (path === "/api/live") {
    if (["admin", "company", "parent", "child", "driver"].includes(claims.role)) {
      return forward(request, claims);
    }
    return denied();
  }

  return forward(request, claims);
}

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/api/parent/:path*",
    "/api/student/:path*",
    "/api/driver/:path*",
    "/api/checkin",
    "/api/live",
  ],
};
