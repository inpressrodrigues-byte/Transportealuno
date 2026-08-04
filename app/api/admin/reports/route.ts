import { NextResponse } from "next/server";
import { getAdminPayload, prepareDb } from "@/lib/server/app-db";

function cell(value: unknown) {
  const raw = String(value ?? "");
  const protectedValue = typeof value === "string" && (/^[=+@]/.test(raw) || /^-\D/.test(raw)) ? `'${raw}` : raw;
  const text = protectedValue.replace(/"/g, '""');
  return `"${text}"`;
}

function csv(rows: unknown[][]) {
  return `\uFEFF${rows.map((row) => row.map(cell).join(";")).join("\r\n")}`;
}

export async function GET(request: Request) {
  await prepareDb();
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId") || undefined;
  const type = url.searchParams.get("type") || "financial";
  const data = getAdminPayload(companyId);
  const parentName = (id: string) => data.parents.find((parent) => parent.id === id)?.name || "";
  const childName = (id: string) => data.children.find((child) => child.id === id)?.name || "";
  const driverName = (id?: string) => data.drivers.find((driver) => driver.id === id)?.name || "";
  const vanName = (id?: string) => data.vans.find((van) => van.id === id)?.label || "";
  let rows: unknown[][];
  let fileName: string;

  if (type === "students") {
    rows = [
      ["Aluno", "Responsavel", "Telefone", "Escola", "Bairro", "Turno", "Motorista", "Van", "Ativo"],
      ...data.children.map((child) => [
        child.name,
        parentName(child.parentId),
        child.responsiblePhone,
        data.schools.find((school) => school.id === child.schoolId)?.name || "",
        child.address.neighborhood,
        child.shift || "",
        driverName(child.driverId),
        vanName(child.vanId),
        child.active ? "Sim" : "Nao",
      ]),
    ];
    fileName = "relatorio-alunos.csv";
  } else if (type === "fleet") {
    rows = [
      ["Veiculo", "Placa", "Modelo", "Lugares", "Motorista", "Ativo", "Manutencoes pendentes", "Custo abastecimento"],
      ...data.vans.map((van) => [
        van.label,
        van.plate,
        van.model,
        van.seats,
        driverName(van.driverId),
        van.active ? "Sim" : "Nao",
        data.vehicleMaintenances.filter((maintenance) => maintenance.vanId === van.id && maintenance.status === "pending").length,
        data.fuelRecords.filter((fuel) => fuel.vanId === van.id).reduce((total, fuel) => total + fuel.amount, 0).toFixed(2),
      ]),
    ];
    fileName = "relatorio-frota.csv";
  } else if (type === "attendance") {
    rows = [
      ["Data", "Horario", "Aluno", "Responsavel", "Tipo", "Van", "Motorista", "Latitude", "Longitude"],
      ...data.checkins.map((checkin) => {
        const date = new Date(checkin.scannedAt);
        return [
          date.toLocaleDateString("pt-BR"),
          date.toLocaleTimeString("pt-BR"),
          childName(checkin.childId),
          parentName(checkin.parentId),
          checkin.type === "returning" ? "Desembarque" : "Embarque",
          vanName(checkin.vanId),
          driverName(checkin.driverId),
          checkin.latitude ?? "",
          checkin.longitude ?? "",
        ];
      }),
    ];
    fileName = "relatorio-presenca.csv";
  } else {
    rows = [
      ["Tipo", "Descricao", "Responsavel", "Aluno", "Vencimento", "Valor", "Forma", "Situacao"],
      ...data.payments.map((payment) => [
        "Receita",
        payment.month,
        parentName(payment.parentId),
        childName(payment.childId),
        payment.dueDate,
        payment.amount,
        payment.paymentMethod,
        payment.status,
      ]),
      ...data.expenses.map((expense) => [
        "Despesa",
        expense.description,
        "",
        "",
        expense.dueDate,
        -expense.amount,
        "",
        expense.status,
      ]),
    ];
    fileName = "relatorio-financeiro.csv";
  }

  return new NextResponse(csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
