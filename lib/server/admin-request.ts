import "server-only";
import type { AdminPayload } from "@/lib/app-types";
import { getAdminPayload } from "@/lib/server/app-db";

export function companyIdForRequest(request: Request, requestedCompanyId?: string) {
  return request.headers.get("x-rota-role") === "company"
    ? request.headers.get("x-rota-company-id") || undefined
    : requestedCompanyId;
}

export function scopedAdminPayload(request: Request, requestedCompanyId?: string): AdminPayload {
  const companyId = companyIdForRequest(request, requestedCompanyId);
  const payload = getAdminPayload(companyId);
  if (request.headers.get("x-rota-role") !== "company") return payload;

  return {
    ...payload,
    companies: payload.currentCompany ? [payload.currentCompany] : [],
    adminAccess: {
      id: "",
      name: "",
      login: "",
    },
  };
}
