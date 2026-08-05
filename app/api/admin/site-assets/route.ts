import { NextResponse } from "next/server";
import {
  getAdminPayload,
  persistDb,
  prepareDb,
  storageErrorMessage,
  updateCompanyProfile,
} from "@/lib/server/app-db";
import { scopedAdminPayload } from "@/lib/server/admin-request";
import {
  deleteStoredGalleryImage,
  galleryStorageErrorMessage,
  MAX_GALLERY_IMAGE_BYTES,
  uploadGalleryImage,
} from "@/lib/server/gallery-storage";
import { emptySiteAsset } from "@/lib/site-content";
import { makeId, todayIso } from "@/lib/app-utils";
import type { SiteAssetSettings } from "@/lib/app-types";

export const runtime = "nodejs";

type AssetKind = "business-card" | "driver-photo";
type SupportedImage = {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
};

function identifyImage(bytes: ArrayBuffer): SupportedImage | null {
  const data = new Uint8Array(bytes);
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return { contentType: "image/jpeg", extension: "jpg" };
  }
  if (
    data.length >= 8 &&
    data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47 &&
    data[4] === 0x0d && data[5] === 0x0a && data[6] === 0x1a && data[7] === 0x0a
  ) {
    return { contentType: "image/png", extension: "png" };
  }
  if (
    data.length >= 12 &&
    String.fromCharCode(...data.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...data.slice(8, 12)) === "WEBP"
  ) {
    return { contentType: "image/webp", extension: "webp" };
  }
  return null;
}

function adminOnly(request: Request) {
  return request.headers.get("x-rota-role") === "admin";
}

function parseKind(value: FormDataEntryValue | null): AssetKind | null {
  return value === "business-card" || value === "driver-photo" ? value : null;
}

function fieldFor(kind: AssetKind) {
  return kind === "business-card" ? "businessCard" : "driverPhoto";
}

export async function POST(request: Request) {
  if (!adminOnly(request)) {
    return NextResponse.json({ error: "Esta configuracao e exclusiva do administrador geral." }, { status: 403 });
  }

  await prepareDb();
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const companyId = String(form?.get("companyId") || "");
  const kind = parseKind(form?.get("kind") || null);

  if (!kind || !companyId) {
    return NextResponse.json({ error: "Selecione a empresa e o tipo de imagem." }, { status: 400 });
  }
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Selecione uma imagem." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_GALLERY_IMAGE_BYTES) {
    return NextResponse.json({ error: "A imagem deve ter no maximo 4 MB." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const image = identifyImage(bytes);
  if (!image) {
    return NextResponse.json({ error: "Formato invalido. Envie uma imagem JPG, PNG ou WEBP." }, { status: 400 });
  }

  const currentSettings = getAdminPayload(companyId).settings;
  const field = fieldFor(kind);
  const previous = currentSettings[field];
  const assetId = `${kind}-${makeId("asset")}`;
  let stored: Awaited<ReturnType<typeof uploadGalleryImage>>;

  try {
    stored = await uploadGalleryImage({
      companyId,
      photoId: assetId,
      bytes,
      contentType: image.contentType,
      extension: image.extension,
    });
  } catch (error) {
    return NextResponse.json({ error: galleryStorageErrorMessage(error) }, { status: 503 });
  }

  const asset: SiteAssetSettings = {
    ...stored,
    fileName: file.name,
    contentType: image.contentType,
    updatedAt: todayIso(),
  };
  updateCompanyProfile(companyId, { [field]: asset });

  try {
    await persistDb();
  } catch (error) {
    await deleteStoredGalleryImage(asset).catch(() => {});
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }

  let warning = "";
  if (previous.url) {
    try {
      await deleteStoredGalleryImage(previous);
    } catch {
      warning = "A nova imagem foi publicada, mas o arquivo antigo nao pode ser removido.";
    }
  }

  return NextResponse.json({ ...scopedAdminPayload(request, companyId), warning });
}

export async function DELETE(request: Request) {
  if (!adminOnly(request)) {
    return NextResponse.json({ error: "Esta configuracao e exclusiva do administrador geral." }, { status: 403 });
  }

  await prepareDb();
  const body = await request.json().catch(() => null);
  const companyId = String(body?.companyId || "");
  const kind = body?.kind === "business-card" || body?.kind === "driver-photo" ? body.kind as AssetKind : null;
  if (!kind || !companyId) {
    return NextResponse.json({ error: "Imagem nao identificada." }, { status: 400 });
  }

  const field = fieldFor(kind);
  const previous = getAdminPayload(companyId).settings[field];
  updateCompanyProfile(companyId, { [field]: emptySiteAsset() });

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }

  let warning = "";
  if (previous.url) {
    try {
      await deleteStoredGalleryImage(previous);
    } catch {
      warning = "A imagem saiu do site, mas o arquivo antigo nao pode ser removido do armazenamento.";
    }
  }

  return NextResponse.json({ ...scopedAdminPayload(request, companyId), warning });
}
