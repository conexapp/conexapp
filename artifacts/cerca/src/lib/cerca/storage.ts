import { createReadStream } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { dbSource } from "@/lib/db";
import { sniffImageType, assertStorageKey, type ImageContentType } from "./domain/images";

export type StorageMode = "r2" | "local" | "unconfigured";

type StorageEnv = {
  endpoint?: string;
  bucket?: string;
  accessKey?: string;
  secretKey?: string;
};

export function readStorageEnv(env: NodeJS.ProcessEnv = process.env): StorageEnv {
  const value = (key: string) => {
    const trimmed = env[key]?.trim();
    return trimmed || undefined;
  };
  return {
    endpoint: value("S3_ENDPOINT"),
    bucket: value("S3_BUCKET"),
    accessKey: value("S3_ACCESS_KEY"),
    secretKey: value("S3_SECRET_KEY"),
  };
}

export function storageMode(source: typeof dbSource = dbSource, env: StorageEnv = readStorageEnv()): StorageMode {
  if (env.endpoint && env.bucket && env.accessKey && env.secretKey) return "r2";
  if (source === "pglite") return "local";
  return "unconfigured";
}

const LOCAL_ROOT = path.resolve(process.cwd(), "data", "uploads");

export { assertStorageKey };

function localPath(key: string): string {
  const safe = assertStorageKey(key);
  const full = path.resolve(LOCAL_ROOT, safe);
  if (!full.startsWith(LOCAL_ROOT + path.sep)) throw new Error("Clave de imagen inválida.");
  return full;
}

async function r2Client() {
  const env = readStorageEnv();
  if (storageMode() !== "r2" || !env.endpoint || !env.bucket || !env.accessKey || !env.secretKey) {
    throw new Error("Cloudflare R2 no está configurado.");
  }
  const { S3Client } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: "auto",
    endpoint: env.endpoint,
    credentials: { accessKeyId: env.accessKey, secretAccessKey: env.secretKey },
  });
  return { client, bucket: env.bucket };
}

export async function createUploadUrl(input: {
  key: string;
  contentType: ImageContentType;
  byteSize: number;
}): Promise<{ mode: "presigned"; uploadUrl: string; headers: Record<string, string> } | { mode: "direct" }> {
  const mode = storageMode();
  if (mode === "unconfigured") {
    throw new Error("No hay almacenamiento de imágenes. En producción hace falta Cloudflare R2.");
  }
  assertStorageKey(input.key);
  if (mode === "local") return { mode: "direct" };
  const { client, bucket } = await r2Client();
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: input.key,
    ContentType: input.contentType,
    ContentLength: input.byteSize,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 120 });
  return {
    mode: "presigned",
    uploadUrl,
    headers: { "Content-Type": input.contentType },
  };
}

export async function writeLocalObject(key: string, bytes: Uint8Array): Promise<void> {
  if (storageMode() !== "local") throw new Error("La subida directa solo existe en desarrollo.");
  const full = localPath(key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes);
}

export async function readObject(key: string): Promise<{ bytes: Uint8Array; contentType: ImageContentType } | null> {
  const mode = storageMode();
  if (mode === "local") {
    try {
      const full = localPath(key);
      const info = await stat(full);
      if (!info.isFile()) return null;
      const bytes = new Uint8Array(await readFile(full));
      const contentType = sniffImageType(bytes);
      if (!contentType) return null;
      return { bytes, contentType };
    } catch {
      return null;
    }
  }
  if (mode !== "r2") return null;
  const { client, bucket } = await r2Client();
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  try {
    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: assertStorageKey(key) }));
    const raw = await response.Body?.transformToByteArray();
    if (!raw) return null;
    const bytes = new Uint8Array(raw);
    const contentType = sniffImageType(bytes);
    if (!contentType) return null;
    return { bytes, contentType };
  } catch {
    return null;
  }
}

export function openLocalStream(key: string) {
  return createReadStream(localPath(key));
}

export async function inspectStoredObject(key: string, expectedType: ImageContentType, expectedSize: number): Promise<void> {
  const mode = storageMode();
  if (mode === "local") {
    const stored = await readObject(key);
    if (!stored) throw new Error("La imagen no llegó al almacenamiento.");
    if (stored.bytes.byteLength !== expectedSize || stored.contentType !== expectedType) {
      await deleteObject(key);
      throw new Error("La imagen guardada no coincide con el archivo declarado.");
    }
    return;
  }
  const { client, bucket } = await r2Client();
  const { HeadObjectCommand, GetObjectCommand } = await import("@aws-sdk/client-s3");
  const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  if (head.ContentLength !== expectedSize) {
    await deleteObject(key);
    throw new Error("El tamaño subido no coincide.");
  }
  const ranged = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: "bytes=0-31" }));
  const sample = new Uint8Array((await ranged.Body?.transformToByteArray()) ?? []);
  if (sniffImageType(sample) !== expectedType) {
    await deleteObject(key);
    throw new Error("El archivo subido no es una imagen válida.");
  }
}

export async function deleteObject(key: string): Promise<void> {
  const mode = storageMode();
  if (mode === "local") {
    await rm(localPath(key), { force: true });
    return;
  }
  if (mode !== "r2") return;
  const { client, bucket } = await r2Client();
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: assertStorageKey(key) }));
}

export function mediaPath(key: string): string {
  return `/api/media/${assertStorageKey(key)}`;
}
