import { NextResponse } from "next/server";
import { getLiveTracking, updateLiveTracking } from "@/lib/server/app-db";
import type { LiveTrackingState } from "@/lib/app-types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return NextResponse.json(getLiveTracking(searchParams.get("driverId") || undefined));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<LiveTrackingState> | null;
  if (!body) {
    return NextResponse.json({ error: "Envie os dados da rota." }, { status: 400 });
  }

  const db = updateLiveTracking({
    driverId: String(body.driverId || ""),
    vanId: String(body.vanId || ""),
    active: body.active,
    latitude: Number.isFinite(Number(body.latitude)) ? Number(body.latitude) : undefined,
    longitude: Number.isFinite(Number(body.longitude)) ? Number(body.longitude) : undefined,
    accuracy: Number.isFinite(Number(body.accuracy)) ? Number(body.accuracy) : undefined,
    speed: Number.isFinite(Number(body.speed)) ? Number(body.speed) : undefined,
    currentNeighborhood: String(body.currentNeighborhood || ""),
    nextStop: String(body.nextStop || ""),
    estimatedMinutes: Number(body.estimatedMinutes || 0),
    source: body.source || "gps",
  });

  return NextResponse.json(db.liveTracking);
}
