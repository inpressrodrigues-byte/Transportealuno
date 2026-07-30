import type { PaymentStatus, SchoolCategory, Shift } from "@/lib/app-types";

export const shifts: Shift[] = ["manha", "tarde", "noite"];

export const schoolCategories: SchoolCategory[] = [
  "cmei",
  "municipal",
  "estadual",
  "particular",
  "faculdade",
];

export function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeContact(value: string) {
  const digits = normalizeDigits(value);
  return digits.startsWith("55") ? digits.slice(2) : digits;
}

export function normalizeCpf(value: string) {
  return normalizeDigits(value).slice(0, 11);
}

export function formatPhone(value: string) {
  const digits = normalizeContact(value);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}

export function formatCpf(value: string) {
  return normalizeCpf(value)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function paymentStatusLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    pending_proof: "Aguardando comprovante",
    proof_received: "Comprovante recebido",
    approved: "Pagamento aprovado",
    rejected: "Comprovante recusado",
  };

  return labels[status];
}

export function shiftLabel(shift: Shift | string) {
  const labels: Record<Shift, string> = {
    manha: "Manha",
    tarde: "Tarde",
    noite: "Noite",
  };

  return labels[shift as Shift] || shift;
}

export function schoolCategoryLabel(category: SchoolCategory | string) {
  const labels: Record<SchoolCategory, string> = {
    cmei: "CMEI",
    municipal: "Municipal",
    estadual: "Estadual",
    particular: "Particular",
    faculdade: "Faculdade",
  };

  return labels[category as SchoolCategory] || category;
}

export function shiftsLabel(values: Shift[] | string[]) {
  if (!values.length) return "Nenhum turno";
  return values.map(shiftLabel).join(", ");
}

export function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function todayIso() {
  return new Date().toISOString();
}
