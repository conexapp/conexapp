import { createServerFn } from "@tanstack/react-start";
import type { Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { imageRejection, MAX_IMAGE_BYTES, MAX_LISTING_IMAGES, imageObjectDisposition, sniffImageType, type ImageContentType } from "../domain/images";
import { businessMutation } from "../domain/ownership";
import { listingRemoval, publishBlockers, statusAfterStock, type ListingStatus } from "../domain/listings";
import { fold, likeContains, slugify } from "../domain/text";
import { normalizePaymentMethods, readStoredMethods } from "../domain/payment-methods";
import { createUploadUrl, deleteObject, inspectStoredObject, mediaPath, storageMode, writeLocalObject } from "../storage";
import { assertString, audit, asInt, id, loadAccess, sql } from "./helpers";
import { enforceRateLimit } from "./rate-limit";
import { assertCanSell } from "./seller-gate";

const IMAGE_TYPES: readonly ImageContentType[] = ["image/jpeg", "image/png", "image/webp"];
const LIST_FILTERS = ["all", "published", "paused", "out_of_stock", "draft", "archived"] as const;

type ListingWrite = {
  businessId: string;
  name: string;
  description: string;
  brand: string;
  model: string;
  sku: string;
  categoryId: string;
  standardProductId: string | null;
  priceCents: number;
  unit: string;
  referenceUnit: string;
  referencePriceCents: number | null;
  stockUnits: number;
  minStock: number;
  pickup: boolean;
  delivery: boolean;
  shippingCents: number;
  leadTimeHours: number;
};

type OwnedListing = {
  id: string;
  business_id: string;
  owner_user_id: string;
  business_status: string;
  is_demo: boolean;
  status: string;
  category_id: string;
  price_cents: string;
  unit: string;
  stock_units: number;
  pickup: boolean;
  delivery: boolean;
  name: string;
};

function optionalText(value: unknown, label: string, max: number): string {
  if (value == null) return "";
  if (typeof value !== "string") throw new Error(`${label} es inválido.`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} es demasiado largo.`);
  return trimmed;
}

function assertCount(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${label} inválido.`);
  }
  return value;
}

function parseListingWrite(input: Partial<ListingWrite> | null | undefined): ListingWrite {
  if (!input) throw new Error("Faltan los datos del producto.");
  const standard = optionalText(input.standardProductId, "Ancla", 80);
  return {
    businessId: optionalText(input.businessId, "Negocio", 80),
    name: assertString(input.name, "Nombre", 140),
    description: optionalText(input.description, "Descripción", 4000),
    brand: optionalText(input.brand, "Marca", 80),
    model: optionalText(input.model, "Modelo", 80),
    sku: optionalText(input.sku, "SKU", 64),
    categoryId: assertString(input.categoryId, "Categoría", 80),
    standardProductId: standard || null,
    priceCents: assertCount(input.priceCents, "Precio", 1, 50_000_000_000),
    unit: assertString(input.unit, "Unidad", 40),
    referenceUnit: optionalText(input.referenceUnit, "Unidad de referencia", 40),
    referencePriceCents:
      input.referencePriceCents == null
        ? null
        : assertCount(input.referencePriceCents, "Precio de referencia", 1, 50_000_000_000),
    stockUnits: assertCount(input.stockUnits, "Stock", 0, 1_000_000),
    minStock: assertCount(input.minStock, "Stock mínimo", 0, 1_000_000),
    pickup: input.pickup === true,
    delivery: input.delivery === true,
    shippingCents: assertCount(input.shippingCents, "Envío", 0, 50_000_000_000),
    leadTimeHours: assertCount(input.leadTimeHours, "Plazo", 0, 24 * 90),
  };
}

function asStatus(value: string): ListingStatus {
  if (
    value === "draft" ||
    value === "published" ||
    value === "paused" ||
    value === "out_of_stock" ||
    value === "archived"
  ) {
    return value;
  }
  throw new Error("Estado de producto inválido.");
}

function hasChildCategory(value: unknown): boolean {
  return value === true || value === "t" || value === 1;
}

async function requireOwnedListing(db: Sql, userId: string, listingId: string): Promise<OwnedListing> {
  if (!listingId || listingId === "nuevo") throw new Error("Producto inexistente.");
  const rows = await db<OwnedListing>`
    select l.id, l.business_id, b.owner_user_id, b.status as business_status, l.is_demo,
      l.status, l.category_id, l.price_cents::text, l.unit, l.stock_units, l.pickup, l.delivery, l.name
    from listings l
    join businesses b on b.id = l.business_id
    where l.id = ${listingId}
  `;
  const listing = rows[0];
  if (!listing) throw new Error("Producto inexistente.");
  const decision = businessMutation({
    actorUserId: userId,
    ownerUserId: listing.owner_user_id,
    isDemo: listing.is_demo,
    businessStatus: listing.business_status,
  });
  if (!decision.ok) throw new Error(decision.reason);
  return listing;
}

async function categoryIsLeaf(db: Sql, categoryId: string): Promise<boolean> {
  const rows = await db<{ parent_id: string | null; has_children: boolean }>`
    select c.parent_id,
      exists(select 1 from categories child where child.parent_id = c.id) as has_children
    from categories c
    where c.id = ${categoryId} and c.active = true
  `;
  const category = rows[0];
  if (!category?.parent_id) return false;
  return !hasChildCategory(category.has_children);
}

async function readyImageCount(db: Sql, listingId: string): Promise<number> {
  const rows = await db<{ n: number }>`
    select count(*)::int as n from listing_images
    where listing_id = ${listingId} and status = 'ready'
  `;
  return rows[0]?.n ?? 0;
}

async function assertCategory(db: Sql, categoryId: string): Promise<void> {
  const rows = await db<{ id: string }>`
    select id from categories where id = ${categoryId} and active = true
  `;
  if (!rows[0]) throw new Error("Esa categoría no existe.");
}

async function assertStandard(db: Sql, standardProductId: string | null): Promise<void> {
  if (!standardProductId) return;
  const rows = await db<{ id: string }>`
    select id from standard_products where id = ${standardProductId} and active = true
  `;
  if (!rows[0]) throw new Error("Esa ancla de comparación no existe.");
}

async function assertOwnedBusiness(db: Sql, userId: string, businessId: string): Promise<void> {
  const rows = await db<{ owner_user_id: string; status: string; is_demo: boolean }>`
    select owner_user_id, status, is_demo from businesses where id = ${businessId}
  `;
  const business = rows[0];
  if (!business || business.owner_user_id !== userId) {
    throw new Error("No podés cargar productos en un negocio que no es tuyo.");
  }
  if (business.is_demo) throw new Error("Los negocios de ejemplo no publican.");
  if (business.status === "suspended") throw new Error("El negocio está suspendido.");
}

function searchText(input: ListingWrite): string {
  return fold(`${input.name} ${input.brand} ${input.model} ${input.sku} ${input.description}`).slice(0, 2000);
}

async function publishOrExplain(db: Sql, userId: string, listingId: string): Promise<OwnedListing> {
  const listing = await requireOwnedListing(db, userId, listingId);
  if (listing.status === "archived") throw new Error("Un producto archivado no se vuelve a publicar.");
  const blockers = publishBlockers({
    businessStatus: listing.business_status,
    categoryIsLeaf: await categoryIsLeaf(db, listing.category_id),
    priceCents: asInt(listing.price_cents),
    unit: listing.unit,
    readyImages: await readyImageCount(db, listing.id),
    stockUnits: listing.stock_units,
  });
  if (!listing.pickup && !listing.delivery) blockers.push("Indicá retiro, envío o ambos.");
  if (blockers.length > 0) throw new Error(blockers.join(" "));
  return listing;
}

type OwnedImage = {
  id: string;
  listing_id: string;
  storage_key: string;
  content_type: string;
  byte_size: number;
  status: string;
  is_primary: boolean;
  listing_status: string;
  owner_user_id: string;
  business_status: string;
  is_demo: boolean;
};

async function requireOwnedImage(db: Sql, userId: string, imageId: string): Promise<OwnedImage> {
  const rows = await db<OwnedImage>`
    select i.id, i.listing_id, i.storage_key, i.content_type, i.byte_size, i.status, i.is_primary,
      l.status as listing_status, b.owner_user_id, b.status as business_status, l.is_demo
    from listing_images i
    join listings l on l.id = i.listing_id
    join businesses b on b.id = l.business_id
    where i.id = ${imageId} and i.status <> 'deleted'
  `;
  const image = rows[0];
  if (!image) throw new Error("Imagen inexistente.");
  const decision = businessMutation({
    actorUserId: userId,
    ownerUserId: image.owner_user_id,
    isDemo: image.is_demo,
    businessStatus: image.business_status,
  });
  if (!decision.ok) throw new Error(decision.reason);
  if (image.listing_status === "archived") throw new Error("Un producto archivado no se edita.");
  return image;
}

async function markImageReady(db: Sql, image: OwnedImage): Promise<void> {
  await db`
    update listing_images
    set status = 'ready',
        is_primary = not exists (
          select 1 from listing_images other
          where other.listing_id = ${image.listing_id}
            and other.id <> ${image.id}
            and other.status = 'ready'
            and other.is_primary = true
        )
    where id = ${image.id} and status = 'pending'
  `;
}

export const listListingOptions = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const categories = await db<{ id: string; name: string; parent_name: string; slug: string; icon: string | null; parent_icon: string | null }>`
      select c.id, c.name, p.name as parent_name, c.slug, c.icon, p.icon as parent_icon
      from categories c
      join categories p on p.id = c.parent_id
      where c.active = true
        and not exists (select 1 from categories child where child.parent_id = c.id)
      order by p.name, c.name
    `;
    const standards = await db<{ id: string; name: string; unit: string }>`
      select id, name, unit from standard_products where active = true order by name
    `;
    return { categories, standards, storage: storageMode() };
  });

export const listMyListings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { status?: string; q?: string } | undefined) => {
    const status = LIST_FILTERS.find((item) => item === input?.status) ?? "all";
    const q = typeof input?.q === "string" ? input.q.trim().slice(0, 80) : "";
    return { status, q };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const like = data.q ? likeContains(data.q) : "%";
    const rows = await db<{
      id: string;
      name: string;
      trade_name: string;
      brand: string;
      sku: string;
      status: string;
      stock_units: number;
      price_cents: string;
      image_key: string | null;
    }>`
      select l.id, l.name, b.trade_name, l.brand, l.sku, l.status, l.stock_units, l.price_cents::text,
        (
          select i.storage_key from listing_images i
          where i.listing_id = l.id and i.status = 'ready'
          order by i.is_primary desc, i.position
          limit 1
        ) as image_key
      from listings l
      join businesses b on b.id = l.business_id
      where b.owner_user_id = ${context.userId}
        and b.is_demo = false
        and l.is_demo = false
        and (${data.status} = 'all' or l.status = ${data.status})
        and (${data.q} = '' or l.search_text ilike ${like} escape '\\')
      order by l.updated_at desc
      limit 100
    `;
    return rows.map((row) => ({ ...row, price_cents: asInt(row.price_cents) }));
  });

export const getMyListing = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((listingId: string) => {
    if (typeof listingId !== "string" || listingId.length < 8) throw new Error("Producto inválido.");
    return listingId;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const listing = await requireOwnedListing(db, context.userId, data);
    const rows = await db<{
      business_id: string;
      name: string;
      brand: string;
      model: string;
      sku: string;
      description: string;
      category_id: string;
      standard_product_id: string | null;
      price_cents: string;
      unit: string;
      stock_units: number;
      min_stock: number;
      pickup: boolean;
      delivery: boolean;
      shipping_cents: string;
      lead_time_hours: number | null;
      status: string;
      payment_methods: unknown;
      business_methods: unknown;
    }>`
      select l.business_id, l.name, l.brand, l.model, l.sku, l.description, l.category_id, l.standard_product_id,
        l.price_cents::text, l.unit, l.stock_units, l.min_stock, l.pickup, l.delivery, l.shipping_cents::text,
        l.lead_time_hours, l.status, l.payment_methods, b.payment_methods as business_methods
      from listings l
      join businesses b on b.id = l.business_id
      where l.id = ${listing.id}
    `;
    const row = rows[0];
    if (!row) throw new Error("Producto inexistente.");
    const images = await db<{ id: string; storage_key: string; is_primary: boolean; status: string }>`
      select id, storage_key, is_primary, status
      from listing_images
      where listing_id = ${listing.id} and status <> 'deleted'
      order by position, created_at
    `;
    return {
      business_id: row.business_id,
      name: row.name,
      brand: row.brand,
      model: row.model,
      sku: row.sku,
      description: row.description,
      category_id: row.category_id,
      standard_product_id: row.standard_product_id,
      priceCents: asInt(row.price_cents),
      unit: row.unit,
      stock_units: row.stock_units,
      min_stock: row.min_stock,
      pickup: row.pickup,
      delivery: row.delivery,
      shippingCents: asInt(row.shipping_cents),
      lead_time_hours: row.lead_time_hours ?? 48,
      status: row.status,
      paymentInherit: row.payment_methods == null,
      paymentMethods:
        row.payment_methods == null
          ? readStoredMethods(row.business_methods)
          : readStoredMethods(row.payment_methods),
      businessPaymentMethods: readStoredMethods(row.business_methods),
      images: images.map((image) => ({
        id: image.id,
        url: image.status === "ready" ? mediaPath(image.storage_key) : null,
        isPrimary: image.is_primary,
        status: image.status,
      })),
    };
  });

export const createListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ListingWrite) => {
    const data = parseListingWrite(input);
    if (!data.businessId) throw new Error("Elegí el negocio.");
    return data;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    await enforceRateLimit(db, "listing_create", context.userId);
    await assertCanSell(db, context.userId);
    await assertOwnedBusiness(db, context.userId, data.businessId);
    await assertCategory(db, data.categoryId);
    await assertStandard(db, data.standardProductId);
    const listingId = id();
    const slug = `${slugify(data.name)}-${listingId.slice(0, 8)}`;
    await db`
      insert into listings (
        id, business_id, category_id, standard_product_id, slug, name, description, brand, model, sku,
        price_cents, unit, reference_unit, reference_price_cents, stock_units, min_stock,
        pickup, delivery, shipping_cents, lead_time_hours, status, search_text, is_demo
      ) values (
        ${listingId}, ${data.businessId}, ${data.categoryId}, ${data.standardProductId}, ${slug},
        ${data.name}, ${data.description}, ${data.brand}, ${data.model}, ${data.sku},
        ${data.priceCents}, ${data.unit}, ${data.referenceUnit || null}, ${data.referencePriceCents},
        ${data.stockUnits}, ${data.minStock}, ${data.pickup}, ${data.delivery}, ${data.shippingCents},
        ${data.leadTimeHours}, 'draft', ${searchText(data)}, false
      )
    `;
    await audit(db, context.userId, "create_listing", "listing", listingId, { name: data.name });
    return { id: listingId, status: "draft" as const };
  });

export const updateListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ListingWrite & { listingId: string }) => {
    if (!input?.listingId) throw new Error("Falta el producto.");
    return { listingId: input.listingId, ...parseListingWrite(input) };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const listing = await requireOwnedListing(db, context.userId, data.listingId);
    if (listing.status === "archived") throw new Error("Un producto archivado no se edita.");
    await assertCategory(db, data.categoryId);
    await assertStandard(db, data.standardProductId);
    let next = statusAfterStock(asStatus(listing.status), data.stockUnits);
    if (next === "published" && listing.business_status !== "active") next = asStatus(listing.status);
    const slug = `${slugify(data.name)}-${listing.id.slice(0, 8)}`;
    const updated = await db<{ status: string }>`
      update listings set
        category_id = ${data.categoryId},
        standard_product_id = ${data.standardProductId},
        slug = ${slug},
        name = ${data.name},
        description = ${data.description},
        brand = ${data.brand},
        model = ${data.model},
        sku = ${data.sku},
        price_cents = ${data.priceCents},
        unit = ${data.unit},
        reference_unit = ${data.referenceUnit || null},
        reference_price_cents = ${data.referencePriceCents},
        stock_units = ${data.stockUnits},
        min_stock = ${data.minStock},
        pickup = ${data.pickup},
        delivery = ${data.delivery},
        shipping_cents = ${data.shippingCents},
        lead_time_hours = ${data.leadTimeHours},
        status = ${next},
        search_text = ${searchText(data)},
        updated_at = now()
      where id = ${listing.id}
        and business_id = ${listing.business_id}
        and status <> 'archived'
      returning status
    `;
    if (!updated[0]) throw new Error("No se guardó el producto.");
    if (asInt(listing.price_cents) !== data.priceCents) {
      await audit(db, context.userId, "change_price", "listing", listing.id, {
        from: asInt(listing.price_cents),
        to: data.priceCents,
      });
    }
    if (listing.stock_units !== data.stockUnits) {
      await audit(db, context.userId, "change_stock", "listing", listing.id, {
        from: listing.stock_units,
        to: data.stockUnits,
      });
    }
    await audit(db, context.userId, "update_listing", "listing", listing.id, {
      priceCents: data.priceCents,
      stockUnits: data.stockUnits,
      status: updated[0].status,
    });
    return { status: updated[0].status };
  });

export const setListingPaymentMethods = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { listingId: string; inherit: boolean; methods?: unknown }) => {
    if (!input?.listingId || input.listingId.length > 80) throw new Error("Falta el producto.");
    const inherit = input.inherit === true;
    return {
      listingId: input.listingId,
      inherit,
      methods: inherit ? [] : normalizePaymentMethods(input.methods ?? []),
    };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const listing = await requireOwnedListing(db, context.userId, data.listingId);
    if (listing.status === "archived") throw new Error("Un producto archivado no se edita.");
    const stored = data.inherit ? null : JSON.stringify(data.methods);
    const updated = await db<{ id: string }>`
      update listings
      set payment_methods = ${stored}::jsonb, updated_at = now()
      where id = ${listing.id} and business_id = ${listing.business_id} and status <> 'archived'
      returning id
    `;
    if (!updated[0]) throw new Error("No se guardaron los medios de este producto.");
    await audit(db, context.userId, "set_listing_payment_methods", "listing", listing.id, {
      inherit: data.inherit,
      methods: data.methods,
    });
    return { ok: true as const, inherit: data.inherit, methods: data.inherit ? null : data.methods };
  });

export const publishListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((listingId: string) => {
    if (typeof listingId !== "string" || listingId.length < 8) throw new Error("Producto inválido.");
    return listingId;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    await enforceRateLimit(db, "sensitive", context.userId);
    await assertCanSell(db, context.userId);
    const listing = await publishOrExplain(db, context.userId, data);
    const updated = await db<{ status: string }>`
      update listings set status = 'published', updated_at = now()
      where id = ${listing.id} and status <> 'archived'
      returning status
    `;
    if (!updated[0]) throw new Error("No se publicó.");
    await audit(db, context.userId, "publish_listing", "listing", listing.id, {});
    return { status: updated[0].status };
  });

export const setListingStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { listingId: string; action: "pause" | "reactivate" }) => {
    if (!input?.listingId) throw new Error("Falta el producto.");
    if (input.action !== "pause" && input.action !== "reactivate") throw new Error("Acción inválida.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const listing = await requireOwnedListing(db, context.userId, data.listingId);
    if (data.action === "pause") {
      if (listing.status !== "published" && listing.status !== "out_of_stock") {
        throw new Error("Solo se pausa un producto publicado.");
      }
      await db`
        update listings set status = 'paused', updated_at = now()
        where id = ${listing.id} and status in ('published', 'out_of_stock')
      `;
      await audit(db, context.userId, "pause_listing", "listing", listing.id, {});
      return { status: "paused" as const };
    }
    if (listing.status !== "paused") throw new Error("Solo se reactiva un producto pausado.");
    await publishOrExplain(db, context.userId, listing.id);
    const updated = await db<{ status: string }>`
      update listings set status = 'published', updated_at = now()
      where id = ${listing.id} and status = 'paused'
      returning status
    `;
    if (!updated[0]) throw new Error("No se reactivó.");
    await audit(db, context.userId, "reactivate_listing", "listing", listing.id, {});
    return { status: "published" as const };
  });

export const removeListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((listingId: string) => {
    if (typeof listingId !== "string" || listingId.length < 8) throw new Error("Producto inválido.");
    return listingId;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const listing = await requireOwnedListing(db, context.userId, data);
    const refs = await db<{ orders: number; quotes: number }>`
      select
        (select count(*)::int from order_items where listing_id = ${listing.id}) as orders,
        (select count(*)::int from quote_requests where listing_id = ${listing.id}) as quotes
    `;
    const decision = listingRemoval({
      orderRefs: refs[0]?.orders ?? 0,
      quoteRefs: refs[0]?.quotes ?? 0,
    });
    if (decision === "archive") {
      await db`
        update listings set status = 'archived', updated_at = now()
        where id = ${listing.id}
      `;
      await audit(db, context.userId, "archive_listing", "listing", listing.id, {});
      return {
        deleted: false,
        message: "Este producto ya tiene cotizaciones o pedidos. Se archivó y el historial quedó intacto.",
      };
    }
    const images = await db<{ storage_key: string }>`
      select storage_key from listing_images where listing_id = ${listing.id}
    `;
    try {
      await db`delete from listings where id = ${listing.id}`;
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      const message = error instanceof Error ? error.message : "";
      if (code !== "23503" && !/foreign key/i.test(message)) throw error;
      await db`update listings set status = 'archived', updated_at = now() where id = ${listing.id}`;
      await audit(db, context.userId, "archive_listing", "listing", listing.id, { reason: "foreign_key" });
      return {
        deleted: false,
        message: "Este producto ya tiene cotizaciones o pedidos. Se archivó y el historial quedó intacto.",
      };
    }
    for (const image of images) {
      await deleteObject(image.storage_key).catch(() => undefined);
    }
    await audit(db, context.userId, "delete_listing", "listing", listing.id, {});
    return { deleted: true, message: "Producto eliminado." };
  });

export const prepareListingImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { listingId: string; contentType: string; byteSize: number }) => {
    if (!input?.listingId) throw new Error("Falta el producto.");
    if (!IMAGE_TYPES.includes(input.contentType as ImageContentType)) {
      throw new Error("Solo se aceptan JPEG, PNG o WebP.");
    }
    if (!Number.isInteger(input.byteSize) || input.byteSize <= 0) throw new Error("La imagen está vacía.");
    if (input.byteSize > MAX_IMAGE_BYTES) throw new Error("La imagen supera 4 MB.");
    return {
      listingId: input.listingId,
      contentType: input.contentType as ImageContentType,
      byteSize: input.byteSize,
    };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    await enforceRateLimit(db, "image_upload", context.userId);
    const listing = await requireOwnedListing(db, context.userId, data.listingId);
    if (listing.status === "archived") throw new Error("Un producto archivado no se edita.");
    const stale = await db<{ id: string; storage_key: string }>`
      select id, storage_key from listing_images
      where listing_id = ${listing.id} and status = 'pending' and created_at < now() - interval '2 hours'
    `;
    for (const row of stale) {
      await deleteObject(row.storage_key).catch(() => undefined);
      await db`delete from listing_images where id = ${row.id} and status = 'pending'`;
    }
    if (storageMode() === "unconfigured") {
      throw new Error("No hay almacenamiento de imágenes. En producción hace falta Cloudflare R2.");
    }
    const count = await db<{ n: number }>`
      select count(*)::int as n from listing_images
      where listing_id = ${listing.id} and status <> 'deleted'
    `;
    if ((count[0]?.n ?? 0) >= MAX_LISTING_IMAGES) throw new Error("Un producto admite hasta 8 imágenes.");
    const imageId = id();
    const folder = /^[0-9a-f-]{36}$/.test(listing.id) ? listing.id : id();
    const key = `listings/${folder}/${imageId}`;
    const position = count[0]?.n ?? 0;
    await db`
      insert into listing_images (id, listing_id, storage_key, content_type, byte_size, position, status)
      values (${imageId}, ${listing.id}, ${key}, ${data.contentType}, ${data.byteSize}, ${position}, 'pending')
    `;
    try {
      const upload = await createUploadUrl({ key, contentType: data.contentType, byteSize: data.byteSize });
      if (upload.mode === "direct") return { mode: "direct" as const, imageId };
      return { mode: "presigned" as const, imageId, uploadUrl: upload.uploadUrl, headers: upload.headers };
    } catch (error) {
      await db`delete from listing_images where id = ${imageId} and status = 'pending'`;
      throw error;
    }
  });

export const saveListingImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { imageId: string; base64: string }) => {
    if (!input?.imageId || typeof input.base64 !== "string") throw new Error("Falta la imagen.");
    const compact = input.base64.replace(/\s/g, "");
    if (!compact || compact.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 16) {
      throw new Error("La imagen supera 4 MB.");
    }
    return { imageId: input.imageId, base64: compact };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const image = await requireOwnedImage(db, context.userId, data.imageId);
    if (image.status !== "pending") throw new Error("Esa imagen ya fue confirmada.");
    const bytes = new Uint8Array(Buffer.from(data.base64, "base64"));
    const others = await db<{ n: number }>`
      select count(*)::int as n from listing_images
      where listing_id = ${image.listing_id} and id <> ${image.id} and status <> 'deleted'
    `;
    const rejection = imageRejection({
      byteSize: bytes.byteLength,
      declaredType: image.content_type,
      sniffed: sniffImageType(bytes),
      existingCount: others[0]?.n ?? 0,
    });
    if (rejection || bytes.byteLength !== image.byte_size) {
      await db`delete from listing_images where id = ${image.id} and status = 'pending'`;
      throw new Error(rejection ?? "La imagen no coincide con el archivo declarado.");
    }
    try {
      await writeLocalObject(image.storage_key, bytes);
      await inspectStoredObject(image.storage_key, image.content_type as ImageContentType, image.byte_size);
      await markImageReady(db, image);
    } catch (error) {
      await deleteObject(image.storage_key).catch(() => undefined);
      await db`delete from listing_images where id = ${image.id} and status = 'pending'`;
      throw error;
    }
    return { ok: true as const };
  });

export const confirmListingImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((imageId: string) => {
    if (typeof imageId !== "string" || imageId.length < 8) throw new Error("Imagen inválida.");
    return imageId;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const image = await requireOwnedImage(db, context.userId, data);
    if (image.status !== "pending") throw new Error("Esa imagen ya fue confirmada.");
    try {
      await inspectStoredObject(image.storage_key, image.content_type as ImageContentType, image.byte_size);
      await markImageReady(db, image);
    } catch (error) {
      await deleteObject(image.storage_key).catch(() => undefined);
      await db`delete from listing_images where id = ${image.id} and status = 'pending'`;
      throw error;
    }
    return { ok: true as const };
  });

export const setPrimaryImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((imageId: string) => {
    if (typeof imageId !== "string" || imageId.length < 8) throw new Error("Imagen inválida.");
    return imageId;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const image = await requireOwnedImage(db, context.userId, data);
    if (image.status !== "ready") throw new Error("La imagen todavía no está lista.");
    await db`
      with cleared as (
        update listing_images set is_primary = false
        where listing_id = ${image.listing_id} and status = 'ready'
        returning id
      )
      update listing_images set is_primary = true
      where id = ${image.id} and status = 'ready'
    `;
    return { ok: true as const };
  });

export const deleteListingImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((imageId: string) => {
    if (typeof imageId !== "string" || imageId.length < 8) throw new Error("Imagen inválida.");
    return imageId;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const image = await requireOwnedImage(db, context.userId, data);
    if (image.status === "ready") {
      const ready = await readyImageCount(db, image.listing_id);
      if (ready <= 1 && (image.listing_status === "published" || image.listing_status === "out_of_stock")) {
        throw new Error("No podés quitar la última imagen de un producto publicado. Pausalo primero.");
      }
    }
    const refs = await db<{ n: number }>`
      select count(*)::int as n from order_items where image_key = ${image.storage_key}
    `;
    if (imageObjectDisposition({ referencedByOrders: refs[0]?.n ?? 0 }) === "delete") {
      await deleteObject(image.storage_key).catch(() => undefined);
    } else {
      await audit(db, context.userId, "retain_order_image", "listing_image", image.id, { key: image.storage_key });
    }
    await db`
      update listing_images set status = 'deleted', is_primary = false
      where id = ${image.id}
    `;
    if (image.is_primary) {
      await db`
        update listing_images set is_primary = true
        where id = (
          select id from listing_images
          where listing_id = ${image.listing_id} and status = 'ready'
          order by position, created_at
          limit 1
        )
      `;
    }
    return { ok: true as const };
  });

export const moveListingImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { imageId: string; direction: "up" | "down" }) => {
    if (!input?.imageId) throw new Error("Imagen inválida.");
    if (input.direction !== "up" && input.direction !== "down") throw new Error("Dirección inválida.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const image = await requireOwnedImage(db, context.userId, data.imageId);
    const rows = await db<{ id: string }>`
      select id from listing_images
      where listing_id = ${image.listing_id} and status <> 'deleted'
      order by position, created_at
    `;
    const index = rows.findIndex((row) => row.id === image.id);
    const target = data.direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= rows.length) return { ok: true as const };
    const ordered = rows.map((row) => row.id);
    const [moved] = ordered.splice(index, 1);
    ordered.splice(target, 0, moved);
    for (let position = 0; position < ordered.length; position += 1) {
      await db`update listing_images set position = ${position} where id = ${ordered[position]}`;
    }
    return { ok: true as const };
  });
