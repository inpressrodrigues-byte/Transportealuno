import { NextResponse } from "next/server";
import {
  createGalleryPhoto,
  deleteGalleryPhoto,
  getAdminPayload,
  moveGalleryPhoto,
  persistDb,
  prepareDb,
  storageErrorMessage,
  updateGalleryPhoto,
} from "@/lib/server/app-db";
import { scopedAdminPayload } from "@/lib/server/admin-request";
import {
  deleteStoredGalleryImage,
  galleryStorageErrorMessage,
  MAX_GALLERY_IMAGE_BYTES,
  uploadGalleryImage,
} from "@/lib/server/gallery-storage";
import { makeId } from "@/lib/app-utils";

export const runtime = "nodejs";

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

export async function POST(request: Request) {
  if (!adminOnly(request)) {
    return NextResponse.json({ error: "Esta configuracao e exclusiva do administrador geral." }, { status: 403 });
  }

  await prepareDb();
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const companyId = String(form?.get("companyId") || "");
  const caption = String(form?.get("caption") || "").trim();

  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Selecione uma foto da van." }, { status: 400 });
  }
  if (!companyId) {
    return NextResponse.json({ error: "Selecione a empresa que recebera as fotos." }, { status: 400 });
  }
  if (getAdminPayload(companyId).galleryPhotos.length >= 4) {
    return NextResponse.json({ error: "Os quatro espacos de fotos da van ja estao preenchidos." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_GALLERY_IMAGE_BYTES) {
    return NextResponse.json({ error: "Cada foto deve ter no maximo 4 MB." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const image = identifyImage(bytes);
  if (!image) {
    return NextResponse.json({ error: "Formato invalido. Envie uma imagem JPG, PNG ou WEBP." }, { status: 400 });
  }

  const photoId = makeId("gallery");
  let stored: Awaited<ReturnType<typeof uploadGalleryImage>>;
  try {
    stored = await uploadGalleryImage({
      companyId,
      photoId,
      bytes,
      contentType: image.contentType,
      extension: image.extension,
    });
  } catch (error) {
    return NextResponse.json({ error: galleryStorageErrorMessage(error) }, { status: 503 });
  }

  const created = createGalleryPhoto({
    id: photoId,
    companyId,
    url: stored.url,
    storagePath: stored.storagePath,
    storageProvider: stored.storageProvider,
    caption: caption || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") || "Foto da van",
    alt: caption || `Van de transporte escolar - ${file.name.replace(/\.[^.]+$/, "")}`,
    active: true,
  });
  if (created.error || !created.photo) {
    await deleteStoredGalleryImage(stored).catch(() => {});
    return NextResponse.json({ error: created.error || "Nao foi possivel posicionar a foto." }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    await deleteStoredGalleryImage(stored).catch(() => {});
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }

  return NextResponse.json(scopedAdminPayload(request, companyId));
}

export async function PATCH(request: Request) {
  if (!adminOnly(request)) {
    return NextResponse.json({ error: "Esta configuracao e exclusiva do administrador geral." }, { status: 403 });
  }

  await prepareDb();
  const body = await request.json().catch(() => null);
  const id = String(body?.id || "");
  const companyId = String(body?.companyId || "");
  const direction = body?.direction === "up" || body?.direction === "down" ? body.direction : "";
  const result = direction
    ? moveGalleryPhoto(id, companyId, direction)
    : updateGalleryPhoto(id, companyId, {
        caption: String(body?.caption || ""),
        alt: String(body?.alt || ""),
        active: body?.active ?? true,
      });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (error) {
    return NextResponse.json({ error: storageErrorMessage(error) }, { status: 503 });
  }
  return NextResponse.json(scopedAdminPayload(request, companyId));
}

export async function DELETE(request: Request) {
  if (!adminOnly(request)) {
    return NextResponse.json({ error: "Esta configuracao e exclusiva do administrador geral." }, { status: 403 });
  }

  await prepareDb();
  const body = await request.json().catch(() => null);
  const id = String(body?.id || "");
  const companyId = String(body?.companyId || "");
  const { error, deletedPhoto } = deleteGalleryPhoto(id, companyId);
  if (error || !deletedPhoto) {
    return NextResponse.json({ error: error || "Foto nao encontrada." }, { status: 400 });
  }

  try {
    await persistDb();
  } catch (persistError) {
    return NextResponse.json({ error: storageErrorMessage(persistError) }, { status: 503 });
  }

  let warning = "";
  try {
    await deleteStoredGalleryImage(deletedPhoto);
  } catch {
    warning = "A foto saiu do site, mas o arquivo antigo nao pode ser removido do armazenamento.";
  }

  return NextResponse.json({ ...scopedAdminPayload(request, companyId), warning });
}
