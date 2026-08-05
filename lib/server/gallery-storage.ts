import "server-only";

import { del, put } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";

const GALLERY_BUCKET = "site-gallery";
const MAX_GALLERY_IMAGE_BYTES = 4 * 1024 * 1024;

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/i, "");
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  return { url, key };
}

function hasSupabaseStorage() {
  const { url, key } = supabaseConfig();
  return Boolean(url && key);
}

function hasBlobStorage() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)
  );
}

function supabaseAdmin() {
  const { url, key } = supabaseConfig();
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

async function ensureGalleryBucket() {
  const client = supabaseAdmin();
  const { data } = await client.storage.getBucket(GALLERY_BUCKET);
  if (data) {
    if (!data.public) {
      const { error } = await client.storage.updateBucket(GALLERY_BUCKET, {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        fileSizeLimit: MAX_GALLERY_IMAGE_BYTES,
      });
      if (error) throw new Error(error.message);
    }
    return client;
  }

  const { error } = await client.storage.createBucket(GALLERY_BUCKET, {
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: MAX_GALLERY_IMAGE_BYTES,
  });
  if (error && !/already exists|duplicate/i.test(error.message)) {
    throw new Error(error.message);
  }
  return client;
}

export async function uploadGalleryImage(input: {
  companyId: string;
  photoId: string;
  bytes: ArrayBuffer;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
}) {
  const companyPath = input.companyId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const storagePath = `${companyPath}/${input.photoId}.${input.extension}`;

  if (hasSupabaseStorage()) {
    const client = await ensureGalleryBucket();
    const { error } = await client.storage.from(GALLERY_BUCKET).upload(storagePath, input.bytes, {
      cacheControl: "31536000",
      contentType: input.contentType,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = client.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath);
    return {
      url: data.publicUrl,
      storagePath,
      storageProvider: "supabase" as const,
    };
  }

  if (hasBlobStorage()) {
    const result = await put(`rota-segura/gallery/${storagePath}`, input.bytes, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false,
      cacheControlMaxAge: 31536000,
      contentType: input.contentType,
    });
    return {
      url: result.url,
      storagePath: result.pathname,
      storageProvider: "vercel-blob" as const,
    };
  }

  throw new Error("gallery-storage-unavailable");
}

export async function deleteStoredGalleryImage(
  photo: {
    url: string;
    storagePath: string;
    storageProvider: "supabase" | "vercel-blob" | "";
  }
) {
  if (!photo.storageProvider) return;
  if (photo.storageProvider === "supabase") {
    if (!hasSupabaseStorage()) throw new Error("gallery-storage-unavailable");
    const client = supabaseAdmin();
    const { error } = await client.storage.from(GALLERY_BUCKET).remove([photo.storagePath]);
    if (error) throw new Error(error.message);
    return;
  }

  if (!hasBlobStorage()) throw new Error("gallery-storage-unavailable");
  await del(photo.url || photo.storagePath);
}

export function galleryStorageErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  if (message.includes("gallery-storage-unavailable")) {
    return "O armazenamento de imagens ainda nao esta conectado na Vercel.";
  }
  if (/mime|content.?type|not supported/i.test(message)) {
    return "Formato de imagem nao permitido. Use JPG, PNG ou WEBP.";
  }
  if (/size|too large|maximum/i.test(message)) {
    return "A foto ultrapassa o limite de 4 MB.";
  }
  if (/unauthorized|forbidden|permission|jwt|api key/i.test(message)) {
    return "O Supabase recusou o envio. Confira a chave de acesso configurada na Vercel.";
  }
  return "Nao foi possivel armazenar a foto. Tente novamente em alguns instantes.";
}

export { MAX_GALLERY_IMAGE_BYTES };
