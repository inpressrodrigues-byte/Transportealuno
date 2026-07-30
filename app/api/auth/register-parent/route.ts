import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await request.json().catch(() => null);

  return NextResponse.json(
    { error: "O acesso dos responsaveis e criado somente pelo administrador." },
    { status: 403 }
  );
}
