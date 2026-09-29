import { f as sql, l as id, n as assertString, r as audit, t as asInt, u as loadAccess } from "./helpers-AwcxVs0A.mjs";
import { i as slugify, n as likeContains, t as fold } from "./text-BUH6vDdb.mjs";
import { c as writeLocalObject, d as imageRejection, f as sniffImageType, i as mediaPath, n as deleteObject, o as storageMode, r as inspectStoredObject, t as createUploadUrl, u as imageObjectDisposition } from "./storage-BueJXjBC.mjs";
import { t as businessMutation } from "./ownership-GOJqhWNU.mjs";
import { c as normalizePaymentMethods, u as readStoredMethods } from "./payment-methods-BtOKvucv.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as enforceRateLimit } from "./rate-limit-BoqWzxCk.mjs";
import { t as assertCanSell } from "./seller-gate-vy9ULUrk.mjs";
import { i as statusAfterStock, n as listingRemoval, r as publishBlockers } from "./listings-C06er98N.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listings-BdS5o4kX.js
var IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp"
];
var LIST_FILTERS = [
	"all",
	"published",
	"paused",
	"out_of_stock",
	"draft",
	"archived"
];
function optionalText(value, label, max) {
	if (value == null) return "";
	if (typeof value !== "string") throw new Error(`${label} es inválido.`);
	const trimmed = value.trim();
	if (trimmed.length > max) throw new Error(`${label} es demasiado largo.`);
	return trimmed;
}
function assertCount(value, label, min, max) {
	if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) throw new Error(`${label} inválido.`);
	return value;
}
function parseListingWrite(input) {
	if (!input) throw new Error("Faltan los datos del producto.");
	const standard = optionalText(input.standardProductId, "Ancla", 80);
	return {
		businessId: optionalText(input.businessId, "Negocio", 80),
		name: assertString(input.name, "Nombre", 140),
		description: optionalText(input.description, "Descripción", 4e3),
		brand: optionalText(input.brand, "Marca", 80),
		model: optionalText(input.model, "Modelo", 80),
		sku: optionalText(input.sku, "SKU", 64),
		categoryId: assertString(input.categoryId, "Categoría", 80),
		standardProductId: standard || null,
		priceCents: assertCount(input.priceCents, "Precio", 1, 5e10),
		unit: assertString(input.unit, "Unidad", 40),
		referenceUnit: optionalText(input.referenceUnit, "Unidad de referencia", 40),
		referencePriceCents: input.referencePriceCents == null ? null : assertCount(input.referencePriceCents, "Precio de referencia", 1, 5e10),
		stockUnits: assertCount(input.stockUnits, "Stock", 0, 1e6),
		minStock: assertCount(input.minStock, "Stock mínimo", 0, 1e6),
		pickup: input.pickup === true,
		delivery: input.delivery === true,
		shippingCents: assertCount(input.shippingCents, "Envío", 0, 5e10),
		leadTimeHours: assertCount(input.leadTimeHours, "Plazo", 0, 2160)
	};
}
function asStatus(value) {
	if (value === "draft" || value === "published" || value === "paused" || value === "out_of_stock" || value === "archived") return value;
	throw new Error("Estado de producto inválido.");
}
function hasChildCategory(value) {
	return value === true || value === "t" || value === 1;
}
async function requireOwnedListing(db, userId, listingId) {
	if (!listingId || listingId === "nuevo") throw new Error("Producto inexistente.");
	const listing = (await db`
    select l.id, l.business_id, b.owner_user_id, b.status as business_status, l.is_demo,
      l.status, l.category_id, l.price_cents::text, l.unit, l.stock_units, l.pickup, l.delivery, l.name
    from listings l
    join businesses b on b.id = l.business_id
    where l.id = ${listingId}
  `)[0];
	if (!listing) throw new Error("Producto inexistente.");
	const decision = businessMutation({
		actorUserId: userId,
		ownerUserId: listing.owner_user_id,
		isDemo: listing.is_demo,
		businessStatus: listing.business_status
	});
	if (!decision.ok) throw new Error(decision.reason);
	return listing;
}
async function categoryIsLeaf(db, categoryId) {
	const category = (await db`
    select c.parent_id,
      exists(select 1 from categories child where child.parent_id = c.id) as has_children
    from categories c
    where c.id = ${categoryId} and c.active = true
  `)[0];
	if (!category?.parent_id) return false;
	return !hasChildCategory(category.has_children);
}
async function readyImageCount(db, listingId) {
	return (await db`
    select count(*)::int as n from listing_images
    where listing_id = ${listingId} and status = 'ready'
  `)[0]?.n ?? 0;
}
async function assertCategory(db, categoryId) {
	if (!(await db`
    select id from categories where id = ${categoryId} and active = true
  `)[0]) throw new Error("Esa categoría no existe.");
}
async function assertStandard(db, standardProductId) {
	if (!standardProductId) return;
	if (!(await db`
    select id from standard_products where id = ${standardProductId} and active = true
  `)[0]) throw new Error("Esa ancla de comparación no existe.");
}
async function assertOwnedBusiness(db, userId, businessId) {
	const business = (await db`
    select owner_user_id, status, is_demo from businesses where id = ${businessId}
  `)[0];
	if (!business || business.owner_user_id !== userId) throw new Error("No podés cargar productos en un negocio que no es tuyo.");
	if (business.is_demo) throw new Error("Los negocios de ejemplo no publican.");
	if (business.status === "suspended") throw new Error("El negocio está suspendido.");
}
function searchText(input) {
	return fold(`${input.name} ${input.brand} ${input.model} ${input.sku} ${input.description}`).slice(0, 2e3);
}
async function publishOrExplain(db, userId, listingId) {
	const listing = await requireOwnedListing(db, userId, listingId);
	if (listing.status === "archived") throw new Error("Un producto archivado no se vuelve a publicar.");
	const blockers = publishBlockers({
		businessStatus: listing.business_status,
		categoryIsLeaf: await categoryIsLeaf(db, listing.category_id),
		priceCents: asInt(listing.price_cents),
		unit: listing.unit,
		readyImages: await readyImageCount(db, listing.id),
		stockUnits: listing.stock_units
	});
	if (!listing.pickup && !listing.delivery) blockers.push("Indicá retiro, envío o ambos.");
	if (blockers.length > 0) throw new Error(blockers.join(" "));
	return listing;
}
async function requireOwnedImage(db, userId, imageId) {
	const image = (await db`
    select i.id, i.listing_id, i.storage_key, i.content_type, i.byte_size, i.status, i.is_primary,
      l.status as listing_status, b.owner_user_id, b.status as business_status, l.is_demo
    from listing_images i
    join listings l on l.id = i.listing_id
    join businesses b on b.id = l.business_id
    where i.id = ${imageId} and i.status <> 'deleted'
  `)[0];
	if (!image) throw new Error("Imagen inexistente.");
	const decision = businessMutation({
		actorUserId: userId,
		ownerUserId: image.owner_user_id,
		isDemo: image.is_demo,
		businessStatus: image.business_status
	});
	if (!decision.ok) throw new Error(decision.reason);
	if (image.listing_status === "archived") throw new Error("Un producto archivado no se edita.");
	return image;
}
async function markImageReady(db, image) {
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
var listListingOptions_createServerFn_handler = createServerRpc({
	id: "bb4c716e95da024a696aa67577c657d5537ccbd4a9b1dd2ba3be364881d5633e",
	name: "listListingOptions",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => listListingOptions.__executeServer(opts));
var listListingOptions = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listListingOptions_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	return {
		categories: await db`
      select c.id, c.name, p.name as parent_name, c.slug, c.icon, p.icon as parent_icon
      from categories c
      join categories p on p.id = c.parent_id
      where c.active = true
        and not exists (select 1 from categories child where child.parent_id = c.id)
      order by p.name, c.name
    `,
		standards: await db`
      select id, name, unit from standard_products where active = true order by name
    `,
		storage: storageMode()
	};
});
var listMyListings_createServerFn_handler = createServerRpc({
	id: "2a70852ea57fd033f20ca36f2662dbc32fd30e433a4191af12ccd2e20848bdcb",
	name: "listMyListings",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => listMyListings.__executeServer(opts));
var listMyListings = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => {
	return {
		status: LIST_FILTERS.find((item) => item === input?.status) ?? "all",
		q: typeof input?.q === "string" ? input.q.trim().slice(0, 80) : ""
	};
}).handler(listMyListings_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const like = data.q ? likeContains(data.q) : "%";
	return (await db`
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
    `).map((row) => ({
		...row,
		price_cents: asInt(row.price_cents)
	}));
});
var getMyListing_createServerFn_handler = createServerRpc({
	id: "b1451e68a15c7cc347fb61a9daa7f4ed6a555933fbcb345198a8e701ff37cf43",
	name: "getMyListing",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => getMyListing.__executeServer(opts));
var getMyListing = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((listingId) => {
	if (typeof listingId !== "string" || listingId.length < 8) throw new Error("Producto inválido.");
	return listingId;
}).handler(getMyListing_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const listing = await requireOwnedListing(db, context.userId, data);
	const row = (await db`
      select l.business_id, l.name, l.brand, l.model, l.sku, l.description, l.category_id, l.standard_product_id,
        l.price_cents::text, l.unit, l.stock_units, l.min_stock, l.pickup, l.delivery, l.shipping_cents::text,
        l.lead_time_hours, l.status, l.payment_methods, b.payment_methods as business_methods
      from listings l
      join businesses b on b.id = l.business_id
      where l.id = ${listing.id}
    `)[0];
	if (!row) throw new Error("Producto inexistente.");
	const images = await db`
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
		paymentMethods: row.payment_methods == null ? readStoredMethods(row.business_methods) : readStoredMethods(row.payment_methods),
		businessPaymentMethods: readStoredMethods(row.business_methods),
		images: images.map((image) => ({
			id: image.id,
			url: image.status === "ready" ? mediaPath(image.storage_key) : null,
			isPrimary: image.is_primary,
			status: image.status
		}))
	};
});
var createListing_createServerFn_handler = createServerRpc({
	id: "22372a2aa8e20de22e83c803aaeaf499586dace933d4a2728b3c4226dbcbdb14",
	name: "createListing",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => createListing.__executeServer(opts));
var createListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = parseListingWrite(input);
	if (!data.businessId) throw new Error("Elegí el negocio.");
	return data;
}).handler(createListing_createServerFn_handler, async ({ context, data }) => {
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
	return {
		id: listingId,
		status: "draft"
	};
});
var updateListing_createServerFn_handler = createServerRpc({
	id: "c22079f48edf6c411ab370efa8697f79ce29925275f299ee03f5f086d8503679",
	name: "updateListing",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => updateListing.__executeServer(opts));
var updateListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.listingId) throw new Error("Falta el producto.");
	return {
		listingId: input.listingId,
		...parseListingWrite(input)
	};
}).handler(updateListing_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const listing = await requireOwnedListing(db, context.userId, data.listingId);
	if (listing.status === "archived") throw new Error("Un producto archivado no se edita.");
	await assertCategory(db, data.categoryId);
	await assertStandard(db, data.standardProductId);
	let next = statusAfterStock(asStatus(listing.status), data.stockUnits);
	if (next === "published" && listing.business_status !== "active") next = asStatus(listing.status);
	const slug = `${slugify(data.name)}-${listing.id.slice(0, 8)}`;
	const updated = await db`
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
	if (asInt(listing.price_cents) !== data.priceCents) await audit(db, context.userId, "change_price", "listing", listing.id, {
		from: asInt(listing.price_cents),
		to: data.priceCents
	});
	if (listing.stock_units !== data.stockUnits) await audit(db, context.userId, "change_stock", "listing", listing.id, {
		from: listing.stock_units,
		to: data.stockUnits
	});
	await audit(db, context.userId, "update_listing", "listing", listing.id, {
		priceCents: data.priceCents,
		stockUnits: data.stockUnits,
		status: updated[0].status
	});
	return { status: updated[0].status };
});
var setListingPaymentMethods_createServerFn_handler = createServerRpc({
	id: "fe5e44ce154d000eeba91a11f5e3c419567ce869572065098ca503e8ecd66641",
	name: "setListingPaymentMethods",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => setListingPaymentMethods.__executeServer(opts));
var setListingPaymentMethods = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.listingId || input.listingId.length > 80) throw new Error("Falta el producto.");
	const inherit = input.inherit === true;
	return {
		listingId: input.listingId,
		inherit,
		methods: inherit ? [] : normalizePaymentMethods(input.methods ?? [])
	};
}).handler(setListingPaymentMethods_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const listing = await requireOwnedListing(db, context.userId, data.listingId);
	if (listing.status === "archived") throw new Error("Un producto archivado no se edita.");
	if (!(await db`
      update listings
      set payment_methods = ${data.inherit ? null : JSON.stringify(data.methods)}::jsonb, updated_at = now()
      where id = ${listing.id} and business_id = ${listing.business_id} and status <> 'archived'
      returning id
    `)[0]) throw new Error("No se guardaron los medios de este producto.");
	await audit(db, context.userId, "set_listing_payment_methods", "listing", listing.id, {
		inherit: data.inherit,
		methods: data.methods
	});
	return {
		ok: true,
		inherit: data.inherit,
		methods: data.inherit ? null : data.methods
	};
});
var publishListing_createServerFn_handler = createServerRpc({
	id: "c9f157dbae3f0d63c0517ef48555e6eeb32b32fad0022267e4cfb2c07c9ee5ab",
	name: "publishListing",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => publishListing.__executeServer(opts));
var publishListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((listingId) => {
	if (typeof listingId !== "string" || listingId.length < 8) throw new Error("Producto inválido.");
	return listingId;
}).handler(publishListing_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	await enforceRateLimit(db, "sensitive", context.userId);
	await assertCanSell(db, context.userId);
	const listing = await publishOrExplain(db, context.userId, data);
	const updated = await db`
      update listings set status = 'published', updated_at = now()
      where id = ${listing.id} and status <> 'archived'
      returning status
    `;
	if (!updated[0]) throw new Error("No se publicó.");
	await audit(db, context.userId, "publish_listing", "listing", listing.id, {});
	return { status: updated[0].status };
});
var setListingStatus_createServerFn_handler = createServerRpc({
	id: "d5ecea687019526196135fc48aaa424b07016597d0a00f0ce09fa8d0416da692",
	name: "setListingStatus",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => setListingStatus.__executeServer(opts));
var setListingStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.listingId) throw new Error("Falta el producto.");
	if (input.action !== "pause" && input.action !== "reactivate") throw new Error("Acción inválida.");
	return input;
}).handler(setListingStatus_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const listing = await requireOwnedListing(db, context.userId, data.listingId);
	if (data.action === "pause") {
		if (listing.status !== "published" && listing.status !== "out_of_stock") throw new Error("Solo se pausa un producto publicado.");
		await db`
        update listings set status = 'paused', updated_at = now()
        where id = ${listing.id} and status in ('published', 'out_of_stock')
      `;
		await audit(db, context.userId, "pause_listing", "listing", listing.id, {});
		return { status: "paused" };
	}
	if (listing.status !== "paused") throw new Error("Solo se reactiva un producto pausado.");
	await publishOrExplain(db, context.userId, listing.id);
	if (!(await db`
      update listings set status = 'published', updated_at = now()
      where id = ${listing.id} and status = 'paused'
      returning status
    `)[0]) throw new Error("No se reactivó.");
	await audit(db, context.userId, "reactivate_listing", "listing", listing.id, {});
	return { status: "published" };
});
var removeListing_createServerFn_handler = createServerRpc({
	id: "fbd90881f4deb394008d7046631e48abc9fdf348851e1d7244d6c58efa2533ab",
	name: "removeListing",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => removeListing.__executeServer(opts));
var removeListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((listingId) => {
	if (typeof listingId !== "string" || listingId.length < 8) throw new Error("Producto inválido.");
	return listingId;
}).handler(removeListing_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const listing = await requireOwnedListing(db, context.userId, data);
	const refs = await db`
      select
        (select count(*)::int from order_items where listing_id = ${listing.id}) as orders,
        (select count(*)::int from quote_requests where listing_id = ${listing.id}) as quotes
    `;
	if (listingRemoval({
		orderRefs: refs[0]?.orders ?? 0,
		quoteRefs: refs[0]?.quotes ?? 0
	}) === "archive") {
		await db`
        update listings set status = 'archived', updated_at = now()
        where id = ${listing.id}
      `;
		await audit(db, context.userId, "archive_listing", "listing", listing.id, {});
		return {
			deleted: false,
			message: "Este producto ya tiene cotizaciones o pedidos. Se archivó y el historial quedó intacto."
		};
	}
	const images = await db`
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
			message: "Este producto ya tiene cotizaciones o pedidos. Se archivó y el historial quedó intacto."
		};
	}
	for (const image of images) await deleteObject(image.storage_key).catch(() => void 0);
	await audit(db, context.userId, "delete_listing", "listing", listing.id, {});
	return {
		deleted: true,
		message: "Producto eliminado."
	};
});
var prepareListingImage_createServerFn_handler = createServerRpc({
	id: "9a40844b8d2c384bc24049390203a1a74774e3312dd1c8ed919aa1b402f6794c",
	name: "prepareListingImage",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => prepareListingImage.__executeServer(opts));
var prepareListingImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.listingId) throw new Error("Falta el producto.");
	if (!IMAGE_TYPES.includes(input.contentType)) throw new Error("Solo se aceptan JPEG, PNG o WebP.");
	if (!Number.isInteger(input.byteSize) || input.byteSize <= 0) throw new Error("La imagen está vacía.");
	if (input.byteSize > 4194304) throw new Error("La imagen supera 4 MB.");
	return {
		listingId: input.listingId,
		contentType: input.contentType,
		byteSize: input.byteSize
	};
}).handler(prepareListingImage_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	await enforceRateLimit(db, "image_upload", context.userId);
	const listing = await requireOwnedListing(db, context.userId, data.listingId);
	if (listing.status === "archived") throw new Error("Un producto archivado no se edita.");
	const stale = await db`
      select id, storage_key from listing_images
      where listing_id = ${listing.id} and status = 'pending' and created_at < now() - interval '2 hours'
    `;
	for (const row of stale) {
		await deleteObject(row.storage_key).catch(() => void 0);
		await db`delete from listing_images where id = ${row.id} and status = 'pending'`;
	}
	if (storageMode() === "unconfigured") throw new Error("No hay almacenamiento de imágenes. En producción hace falta Cloudflare R2.");
	const count = await db`
      select count(*)::int as n from listing_images
      where listing_id = ${listing.id} and status <> 'deleted'
    `;
	if ((count[0]?.n ?? 0) >= 8) throw new Error("Un producto admite hasta 8 imágenes.");
	const imageId = id();
	const key = `listings/${/^[0-9a-f-]{36}$/.test(listing.id) ? listing.id : id()}/${imageId}`;
	const position = count[0]?.n ?? 0;
	await db`
      insert into listing_images (id, listing_id, storage_key, content_type, byte_size, position, status)
      values (${imageId}, ${listing.id}, ${key}, ${data.contentType}, ${data.byteSize}, ${position}, 'pending')
    `;
	try {
		const upload = await createUploadUrl({
			key,
			contentType: data.contentType,
			byteSize: data.byteSize
		});
		if (upload.mode === "direct") return {
			mode: "direct",
			imageId
		};
		return {
			mode: "presigned",
			imageId,
			uploadUrl: upload.uploadUrl,
			headers: upload.headers
		};
	} catch (error) {
		await db`delete from listing_images where id = ${imageId} and status = 'pending'`;
		throw error;
	}
});
var saveListingImage_createServerFn_handler = createServerRpc({
	id: "966a226e22f8e8c39446a3d3a9570fdbfa2579ca2dd644241d4d38e681a84aea",
	name: "saveListingImage",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => saveListingImage.__executeServer(opts));
var saveListingImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.imageId || typeof input.base64 !== "string") throw new Error("Falta la imagen.");
	const compact = input.base64.replace(/\s/g, "");
	if (!compact || compact.length > Math.ceil(4194304 / 3) * 4 + 16) throw new Error("La imagen supera 4 MB.");
	return {
		imageId: input.imageId,
		base64: compact
	};
}).handler(saveListingImage_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const image = await requireOwnedImage(db, context.userId, data.imageId);
	if (image.status !== "pending") throw new Error("Esa imagen ya fue confirmada.");
	const bytes = new Uint8Array(Buffer.from(data.base64, "base64"));
	const others = await db`
      select count(*)::int as n from listing_images
      where listing_id = ${image.listing_id} and id <> ${image.id} and status <> 'deleted'
    `;
	const rejection = imageRejection({
		byteSize: bytes.byteLength,
		declaredType: image.content_type,
		sniffed: sniffImageType(bytes),
		existingCount: others[0]?.n ?? 0
	});
	if (rejection || bytes.byteLength !== image.byte_size) {
		await db`delete from listing_images where id = ${image.id} and status = 'pending'`;
		throw new Error(rejection ?? "La imagen no coincide con el archivo declarado.");
	}
	try {
		await writeLocalObject(image.storage_key, bytes);
		await inspectStoredObject(image.storage_key, image.content_type, image.byte_size);
		await markImageReady(db, image);
	} catch (error) {
		await deleteObject(image.storage_key).catch(() => void 0);
		await db`delete from listing_images where id = ${image.id} and status = 'pending'`;
		throw error;
	}
	return { ok: true };
});
var confirmListingImage_createServerFn_handler = createServerRpc({
	id: "13dc6501e7cc47f82aea7fdb5c0e58c4b4997e462704b0607d027b2de980036b",
	name: "confirmListingImage",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => confirmListingImage.__executeServer(opts));
var confirmListingImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((imageId) => {
	if (typeof imageId !== "string" || imageId.length < 8) throw new Error("Imagen inválida.");
	return imageId;
}).handler(confirmListingImage_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const image = await requireOwnedImage(db, context.userId, data);
	if (image.status !== "pending") throw new Error("Esa imagen ya fue confirmada.");
	try {
		await inspectStoredObject(image.storage_key, image.content_type, image.byte_size);
		await markImageReady(db, image);
	} catch (error) {
		await deleteObject(image.storage_key).catch(() => void 0);
		await db`delete from listing_images where id = ${image.id} and status = 'pending'`;
		throw error;
	}
	return { ok: true };
});
var setPrimaryImage_createServerFn_handler = createServerRpc({
	id: "c511238cf4adef3703b302f0a76b8e7dc39e56bd6ecfed687a96e20e0c24d8d8",
	name: "setPrimaryImage",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => setPrimaryImage.__executeServer(opts));
var setPrimaryImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((imageId) => {
	if (typeof imageId !== "string" || imageId.length < 8) throw new Error("Imagen inválida.");
	return imageId;
}).handler(setPrimaryImage_createServerFn_handler, async ({ context, data }) => {
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
	return { ok: true };
});
var deleteListingImage_createServerFn_handler = createServerRpc({
	id: "6d7ed0e34794dd41d8fb6c8444ceac9867b427aa0c82f4f99d16dfbc52488b6c",
	name: "deleteListingImage",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => deleteListingImage.__executeServer(opts));
var deleteListingImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((imageId) => {
	if (typeof imageId !== "string" || imageId.length < 8) throw new Error("Imagen inválida.");
	return imageId;
}).handler(deleteListingImage_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const image = await requireOwnedImage(db, context.userId, data);
	if (image.status === "ready") {
		if (await readyImageCount(db, image.listing_id) <= 1 && (image.listing_status === "published" || image.listing_status === "out_of_stock")) throw new Error("No podés quitar la última imagen de un producto publicado. Pausalo primero.");
	}
	const refs = await db`
      select count(*)::int as n from order_items where image_key = ${image.storage_key}
    `;
	if (imageObjectDisposition({ referencedByOrders: refs[0]?.n ?? 0 }) === "delete") await deleteObject(image.storage_key).catch(() => void 0);
	else await audit(db, context.userId, "retain_order_image", "listing_image", image.id, { key: image.storage_key });
	await db`
      update listing_images set status = 'deleted', is_primary = false
      where id = ${image.id}
    `;
	if (image.is_primary) await db`
        update listing_images set is_primary = true
        where id = (
          select id from listing_images
          where listing_id = ${image.listing_id} and status = 'ready'
          order by position, created_at
          limit 1
        )
      `;
	return { ok: true };
});
var moveListingImage_createServerFn_handler = createServerRpc({
	id: "b7f1c30ac12bee335dfcb34ff5a791a74cdd10bc4bcb6bc0cdac0c7e96c9d644",
	name: "moveListingImage",
	filename: "src/lib/cerca/server/listings.ts"
}, (opts) => moveListingImage.__executeServer(opts));
var moveListingImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.imageId) throw new Error("Imagen inválida.");
	if (input.direction !== "up" && input.direction !== "down") throw new Error("Dirección inválida.");
	return input;
}).handler(moveListingImage_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const image = await requireOwnedImage(db, context.userId, data.imageId);
	const rows = await db`
      select id from listing_images
      where listing_id = ${image.listing_id} and status <> 'deleted'
      order by position, created_at
    `;
	const index = rows.findIndex((row) => row.id === image.id);
	const target = data.direction === "up" ? index - 1 : index + 1;
	if (index < 0 || target < 0 || target >= rows.length) return { ok: true };
	const ordered = rows.map((row) => row.id);
	const [moved] = ordered.splice(index, 1);
	ordered.splice(target, 0, moved);
	for (let position = 0; position < ordered.length; position += 1) await db`update listing_images set position = ${position} where id = ${ordered[position]}`;
	return { ok: true };
});
//#endregion
export { confirmListingImage_createServerFn_handler, createListing_createServerFn_handler, deleteListingImage_createServerFn_handler, getMyListing_createServerFn_handler, listListingOptions_createServerFn_handler, listMyListings_createServerFn_handler, moveListingImage_createServerFn_handler, prepareListingImage_createServerFn_handler, publishListing_createServerFn_handler, removeListing_createServerFn_handler, saveListingImage_createServerFn_handler, setListingPaymentMethods_createServerFn_handler, setListingStatus_createServerFn_handler, setPrimaryImage_createServerFn_handler, updateListing_createServerFn_handler };
