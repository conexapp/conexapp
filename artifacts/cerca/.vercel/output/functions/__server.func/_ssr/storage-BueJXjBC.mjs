import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { i as dbSource } from "./helpers-AwcxVs0A.mjs";
import path from "node:path";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
//#region node_modules/.nitro/vite/services/ssr/assets/storage-BueJXjBC.js
function sniffImageType(bytes) {
	if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
	if (bytes.length >= 8 && bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71 && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10) return "image/png";
	if (bytes.length >= 12 && bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70 && bytes[8] === 87 && bytes[9] === 69 && bytes[10] === 66 && bytes[11] === 80) return "image/webp";
	return null;
}
function imageRejection(input) {
	if (!Number.isInteger(input.byteSize) || input.byteSize <= 0) return "La imagen está vacía.";
	if (input.byteSize > 4194304) return "La imagen supera 4 MB.";
	if (input.existingCount >= 8) return "Un producto admite hasta 8 imágenes.";
	if (input.declaredType === "image/svg+xml" || !input.sniffed) return "Solo se aceptan JPEG, PNG o WebP.";
	if (input.declaredType !== input.sniffed) return "El tipo del archivo no coincide con su contenido.";
	return null;
}
function imageObjectDisposition(input) {
	return input.referencedByOrders > 0 ? "retain" : "delete";
}
/** Clave opaca. No acepta rutas, `..` ni otro prefijo. */
function assertStorageKey(key) {
	if (typeof key !== "string" || key.includes("..") || key.includes("\\") || key.includes("\0")) throw new Error("Clave de imagen inválida.");
	if (!/^listings\/[0-9a-f-]{36}\/[0-9a-f-]{36}$/.test(key)) throw new Error("Clave de imagen inválida.");
	return key;
}
var storage_exports = /* @__PURE__ */ __exportAll({
	assertStorageKey: () => assertStorageKey,
	createUploadUrl: () => createUploadUrl,
	deleteObject: () => deleteObject,
	inspectStoredObject: () => inspectStoredObject,
	mediaPath: () => mediaPath,
	readObject: () => readObject,
	readStorageEnv: () => readStorageEnv,
	storageMode: () => storageMode,
	writeLocalObject: () => writeLocalObject
});
function readStorageEnv(env = process.env) {
	const value = (key) => {
		return env[key]?.trim() || void 0;
	};
	return {
		endpoint: value("S3_ENDPOINT"),
		bucket: value("S3_BUCKET"),
		accessKey: value("S3_ACCESS_KEY"),
		secretKey: value("S3_SECRET_KEY")
	};
}
function storageMode(source = dbSource, env = readStorageEnv()) {
	if (env.endpoint && env.bucket && env.accessKey && env.secretKey) return "r2";
	if (source === "pglite") return "local";
	return "unconfigured";
}
var LOCAL_ROOT = path.resolve(process.cwd(), "data", "uploads");
function localPath(key) {
	const safe = assertStorageKey(key);
	const full = path.resolve(LOCAL_ROOT, safe);
	if (!full.startsWith(LOCAL_ROOT + path.sep)) throw new Error("Clave de imagen inválida.");
	return full;
}
async function r2Client() {
	const env = readStorageEnv();
	if (storageMode() !== "r2" || !env.endpoint || !env.bucket || !env.accessKey || !env.secretKey) throw new Error("Cloudflare R2 no está configurado.");
	const { S3Client } = await import("../_libs/@aws-sdk/client-s3+[...].mjs").then((n) => n.t);
	return {
		client: new S3Client({
			region: "auto",
			endpoint: env.endpoint,
			credentials: {
				accessKeyId: env.accessKey,
				secretAccessKey: env.secretKey
			}
		}),
		bucket: env.bucket
	};
}
async function createUploadUrl(input) {
	const mode = storageMode();
	if (mode === "unconfigured") throw new Error("No hay almacenamiento de imágenes. En producción hace falta Cloudflare R2.");
	assertStorageKey(input.key);
	if (mode === "local") return { mode: "direct" };
	const { client, bucket } = await r2Client();
	const { PutObjectCommand } = await import("../_libs/@aws-sdk/client-s3+[...].mjs").then((n) => n.t);
	const { getSignedUrl } = await import("../_libs/aws-sdk__s3-request-presigner.mjs").then((n) => n.t);
	return {
		mode: "presigned",
		uploadUrl: await getSignedUrl(client, new PutObjectCommand({
			Bucket: bucket,
			Key: input.key,
			ContentType: input.contentType,
			ContentLength: input.byteSize
		}), { expiresIn: 120 }),
		headers: { "Content-Type": input.contentType }
	};
}
async function writeLocalObject(key, bytes) {
	if (storageMode() !== "local") throw new Error("La subida directa solo existe en desarrollo.");
	const full = localPath(key);
	await mkdir(path.dirname(full), { recursive: true });
	await writeFile(full, bytes);
}
async function readObject(key) {
	const mode = storageMode();
	if (mode === "local") try {
		const full = localPath(key);
		if (!(await stat(full)).isFile()) return null;
		const bytes = new Uint8Array(await readFile(full));
		const contentType = sniffImageType(bytes);
		if (!contentType) return null;
		return {
			bytes,
			contentType
		};
	} catch {
		return null;
	}
	if (mode !== "r2") return null;
	const { client, bucket } = await r2Client();
	const { GetObjectCommand } = await import("../_libs/@aws-sdk/client-s3+[...].mjs").then((n) => n.t);
	try {
		const raw = await (await client.send(new GetObjectCommand({
			Bucket: bucket,
			Key: assertStorageKey(key)
		}))).Body?.transformToByteArray();
		if (!raw) return null;
		const bytes = new Uint8Array(raw);
		const contentType = sniffImageType(bytes);
		if (!contentType) return null;
		return {
			bytes,
			contentType
		};
	} catch {
		return null;
	}
}
async function inspectStoredObject(key, expectedType, expectedSize) {
	if (storageMode() === "local") {
		const stored = await readObject(key);
		if (!stored) throw new Error("La imagen no llegó al almacenamiento.");
		if (stored.bytes.byteLength !== expectedSize || stored.contentType !== expectedType) {
			await deleteObject(key);
			throw new Error("La imagen guardada no coincide con el archivo declarado.");
		}
		return;
	}
	const { client, bucket } = await r2Client();
	const { HeadObjectCommand, GetObjectCommand } = await import("../_libs/@aws-sdk/client-s3+[...].mjs").then((n) => n.t);
	if ((await client.send(new HeadObjectCommand({
		Bucket: bucket,
		Key: key
	}))).ContentLength !== expectedSize) {
		await deleteObject(key);
		throw new Error("El tamaño subido no coincide.");
	}
	const ranged = await client.send(new GetObjectCommand({
		Bucket: bucket,
		Key: key,
		Range: "bytes=0-31"
	}));
	if (sniffImageType(new Uint8Array(await ranged.Body?.transformToByteArray() ?? [])) !== expectedType) {
		await deleteObject(key);
		throw new Error("El archivo subido no es una imagen válida.");
	}
}
async function deleteObject(key) {
	const mode = storageMode();
	if (mode === "local") {
		await rm(localPath(key), { force: true });
		return;
	}
	if (mode !== "r2") return;
	const { client, bucket } = await r2Client();
	const { DeleteObjectCommand } = await import("../_libs/@aws-sdk/client-s3+[...].mjs").then((n) => n.t);
	await client.send(new DeleteObjectCommand({
		Bucket: bucket,
		Key: assertStorageKey(key)
	}));
}
function mediaPath(key) {
	return `/api/media/${assertStorageKey(key)}`;
}
//#endregion
export { readObject as a, writeLocalObject as c, imageRejection as d, sniffImageType as f, mediaPath as i, deleteObject as n, storageMode as o, inspectStoredObject as r, storage_exports as s, createUploadUrl as t, imageObjectDisposition as u };
