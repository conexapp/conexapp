export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const MAX_LISTING_IMAGES = 8;

export type ImageContentType = "image/jpeg" | "image/png" | "image/webp";

export function sniffImageType(bytes: Uint8Array): ImageContentType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export function imageRejection(input: {
  byteSize: number;
  declaredType: string;
  sniffed: ImageContentType | null;
  existingCount: number;
}): string | null {
  if (!Number.isInteger(input.byteSize) || input.byteSize <= 0) return "La imagen está vacía.";
  if (input.byteSize > MAX_IMAGE_BYTES) return "La imagen supera 4 MB.";
  if (input.existingCount >= MAX_LISTING_IMAGES) return "Un producto admite hasta 8 imágenes.";
  if (input.declaredType === "image/svg+xml" || !input.sniffed) return "Solo se aceptan JPEG, PNG o WebP.";
  if (input.declaredType !== input.sniffed) return "El tipo del archivo no coincide con su contenido.";
  return null;
}

export function imageObjectDisposition(input: { referencedByOrders: number }): "retain" | "delete" {
  return input.referencedByOrders > 0 ? "retain" : "delete";
}

/** Clave opaca. No acepta rutas, `..` ni otro prefijo. */
export function assertStorageKey(key: string): string {
  if (typeof key !== "string" || key.includes("..") || key.includes("\\") || key.includes("\0")) {
    throw new Error("Clave de imagen inválida.");
  }
  if (!/^listings\/[0-9a-f-]{36}\/[0-9a-f-]{36}$/.test(key)) {
    throw new Error("Clave de imagen inválida.");
  }
  return key;
}
