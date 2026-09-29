import { f as sql, i as dbSource, t as asInt } from "./helpers-AwcxVs0A.mjs";
import { n as likeContains, t as fold } from "./text-BUH6vDdb.mjs";
import { i as acceptedMethods } from "./payment-methods-BtOKvucv.mjs";
import { l as readMercadoPagoEnv, s as missingMercadoPagoCredentials } from "./mercadopago-BrD8R2__.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { a as publicCoordinate, n as distanceKm, t as ROSARIO } from "./geo-BwvVDJHB.mjs";
import { t as activeMapTiles } from "./maps-PjfEszOE.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as comparableGroups } from "./listings-C06er98N.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/public-C7s5wK9S.js
function cleanSearch(input) {
	const sort = input.sort;
	return {
		q: typeof input.q === "string" ? input.q.trim().slice(0, 80) : "",
		category: typeof input.category === "string" ? input.category : "",
		maxPriceCents: typeof input.maxPriceCents === "number" && input.maxPriceCents > 0 ? Math.round(input.maxPriceCents) : null,
		maxDistanceKm: typeof input.maxDistanceKm === "number" && input.maxDistanceKm > 0 ? input.maxDistanceKm : null,
		delivery: input.delivery === true,
		pickup: input.pickup === true,
		inStock: input.inStock !== false,
		includeUnavailable: input.includeUnavailable === true,
		sort: sort === "price_desc" || sort === "distance" || sort === "price_asc" ? sort : "price_asc"
	};
}
function imageUrl(key) {
	if (!key || !/^listings\/[0-9a-f-]{36}\/[0-9a-f-]{36}$/.test(key)) return null;
	return `/api/media/${key}`;
}
var searchMarketplace_createServerFn_handler = createServerRpc({
	id: "595a8ab801994b6292bc300a91b651e567e2daae81ed0471d75b56f838b3f92d",
	name: "searchMarketplace",
	filename: "src/lib/cerca/server/public.ts"
}, (opts) => searchMarketplace.__executeServer(opts));
var searchMarketplace = createServerFn({ method: "GET" }).validator((input) => cleanSearch(input ?? {})).handler(searchMarketplace_createServerFn_handler, async ({ data }) => {
	const db = await sql();
	const like = data.q ? likeContains(data.q) : "%";
	const foldedCategory = data.category ? fold(data.category) : "";
	let listings = (await db`
      select
        l.id, l.name, l.slug, l.brand, l.model, l.sku, l.unit, l.description, l.price_cents::text, l.stock_units,
        l.delivery, l.pickup, l.shipping_cents::text, l.lead_time_hours,
        c.name as category_name, c.slug as category_slug,
        l.standard_product_id, s.name as standard_name,
        b.id as business_id, b.trade_name, b.slug as business_slug, b.lat, b.lng, b.location_visibility, b.neighborhood,
        b.verified_at::text as verified_at,
        (select count(*)::int from orders ord where ord.business_id = b.id and ord.status = 'COMPLETED') as completed_orders,
        (select count(*)::int from orders ord where ord.business_id = b.id and ord.status = 'CANCELLED') as cancelled_orders,
        (select avg(r.rating)::float8 from reviews r where r.business_id = b.id) as avg_rating,
        (select count(*)::int from reviews r where r.business_id = b.id) as review_count,
        (
          select i.storage_key from listing_images i
          where i.listing_id = l.id and i.status = 'ready'
          order by i.is_primary desc, i.position
          limit 1
        ) as image_key,
        b.payment_methods as business_methods,
        l.payment_methods as listing_methods
      from listings l
      join businesses b on b.id = l.business_id and b.status = 'active' and b.is_demo = false
      join categories c on c.id = l.category_id and c.active = true
      left join categories parent on parent.id = c.parent_id
      left join standard_products s on s.id = l.standard_product_id and s.active = true
      where (
          l.status = 'published'
          or (${data.includeUnavailable} = true and l.status = 'out_of_stock')
        )
        and l.is_demo = false
        and (${data.inStock} = false or l.stock_units > 0)
        and (${data.q} = '' or l.search_text ilike ${like} escape '\\' or b.search_text ilike ${like} escape '\\')
        and (
          ${foldedCategory} = ''
          or c.slug = ${foldedCategory}
          or parent.slug = ${foldedCategory}
        )
    `).map((row) => {
		const visibility = row.location_visibility === "approximate" ? "approximate" : "exact";
		const spot = row.lat === null || row.lng === null ? null : publicCoordinate(row.lat, row.lng, visibility);
		const distance = spot === null ? null : Math.round(distanceKm(ROSARIO.lat, ROSARIO.lng, spot.lat, spot.lng) * 10) / 10;
		return {
			id: row.id,
			name: row.name,
			slug: row.slug,
			brand: row.brand,
			model: row.model,
			sku: row.sku,
			unit: row.unit,
			description: row.description,
			priceCents: asInt(row.price_cents),
			stockUnits: row.stock_units,
			delivery: row.delivery,
			pickup: row.pickup,
			shippingCents: asInt(row.shipping_cents),
			leadTimeHours: row.lead_time_hours,
			categoryName: row.category_name,
			categorySlug: row.category_slug,
			standardProductId: row.standard_product_id,
			standardProductName: row.standard_name,
			businessId: row.business_id,
			businessName: row.trade_name,
			businessSlug: row.business_slug,
			lat: spot?.lat ?? null,
			lng: spot?.lng ?? null,
			neighborhood: row.neighborhood,
			distanceKm: distance,
			verified: Boolean(row.verified_at),
			completedOrders: row.completed_orders,
			cancelledOrders: row.cancelled_orders,
			avgRating: row.avg_rating,
			reviewCount: row.review_count,
			imageUrl: imageUrl(row.image_key),
			paymentMethods: acceptedMethods(row.business_methods, row.listing_methods)
		};
	});
	if (data.delivery) listings = listings.filter((listing) => listing.delivery);
	if (data.pickup) listings = listings.filter((listing) => listing.pickup);
	if (data.maxPriceCents !== null) listings = listings.filter((listing) => listing.priceCents <= data.maxPriceCents);
	if (data.maxDistanceKm !== null) listings = listings.filter((listing) => listing.distanceKm !== null && listing.distanceKm <= data.maxDistanceKm);
	listings.sort((a, b) => {
		if (data.sort === "distance") return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
		if (data.sort === "price_desc") return b.priceCents - a.priceCents;
		return a.priceCents - b.priceCents;
	});
	const nameByAnchor = new Map(listings.map((listing) => [listing.standardProductId, listing.standardProductName]));
	const comparisons = comparableGroups(listings).map((group) => ({
		...group,
		name: nameByAnchor.get(group.standardProductId) ?? "Ofertas comparables"
	}));
	const categories = await db`
      select id, slug, name, parent_id, is_featured, sort_order, icon
      from categories
      where active = true
      order by is_featured desc, sort_order, name
    `;
	return {
		listings,
		comparisons,
		categories: categories.map((row) => ({
			id: row.id,
			slug: row.slug,
			name: row.name,
			parentId: row.parent_id,
			featured: row.is_featured === true,
			sortOrder: row.sort_order,
			icon: row.icon
		})),
		origin: ROSARIO
	};
});
var getListing_createServerFn_handler = createServerRpc({
	id: "5e3c309d39c92021bb234d83940e34ecd99decd8e2a7617d1813c18486ed7202",
	name: "getListing",
	filename: "src/lib/cerca/server/public.ts"
}, (opts) => getListing.__executeServer(opts));
var getListing = createServerFn({ method: "GET" }).validator((listingId) => {
	if (typeof listingId !== "string" || listingId.length > 80) throw new Error("Publicación inválida.");
	return listingId;
}).handler(getListing_createServerFn_handler, async ({ data }) => {
	const result = await searchMarketplace({ data: {
		inStock: false,
		includeUnavailable: true
	} });
	const listing = result.listings.find((item) => item.id === data || item.slug === data);
	if (!listing) throw new Error("Esa publicación no está a la venta.");
	const comparable = result.comparisons.find((group) => group.listingIds.includes(listing.id));
	const siblings = comparable ? result.listings.filter((item) => comparable.listingIds.includes(item.id) && item.id !== listing.id && item.stockUnits > 0) : [];
	const images = await (await sql())`
      select storage_key, is_primary from listing_images
      where listing_id = ${listing.id} and status = 'ready'
      order by is_primary desc, position
    `;
	return {
		...listing,
		images: images.map((image) => imageUrl(image.storage_key)).filter((url) => Boolean(url)),
		siblings
	};
});
var getBusiness_createServerFn_handler = createServerRpc({
	id: "2cca906b0777e366fa01707ff8f41e6326b7a6364c15a7cb94b3fd62ba2b305f",
	name: "getBusiness",
	filename: "src/lib/cerca/server/public.ts"
}, (opts) => getBusiness.__executeServer(opts));
var getBusiness = createServerFn({ method: "GET" }).validator((businessId) => {
	if (typeof businessId !== "string" || businessId.length > 80) throw new Error("Negocio inválido.");
	return businessId;
}).handler(getBusiness_createServerFn_handler, async ({ data }) => {
	const db = await sql();
	const business = (await db`
      select b.id, b.trade_name, b.legal_name, b.slug, b.description, b.status, b.address_line, b.neighborhood,
        b.city, b.province, b.lat, b.lng, b.location_visibility, b.offers_delivery, b.offers_pickup, b.is_demo,
        b.verified_at::text, b.phone, b.created_at::text,
        b.coverage_note, b.min_order_note, b.sells_wholesale, b.sells_retail,
        (select count(*)::int from orders ord where ord.business_id = b.id and ord.status = 'COMPLETED') as completed_orders,
        (select count(*)::int from orders ord where ord.business_id = b.id and ord.status = 'CANCELLED') as cancelled_orders,
        (select count(*)::int from reviews r where r.business_id = b.id) as review_count,
        (select avg(r.rating)::float8 from reviews r where r.business_id = b.id) as avg_rating,
        (
          select count(*)::int from seller_payment_accounts spa
          where spa.business_id = b.id
            and spa.provider = 'mercadopago'
            and spa.status = 'connected'
            and spa.disconnected_at is null
        ) as mercado_pago_count,
        (
          select count(*)::int from disputes d
          join orders o on o.id = d.order_id
          where o.business_id = b.id
        ) as dispute_count
      from businesses b
      where (b.id = ${data} or b.slug = ${data}) and b.status = 'active' and b.is_demo = false
    `)[0];
	if (!business) throw new Error("Ese proveedor no está publicado.");
	const listings = await db`
      select l.id, l.name, l.unit, l.price_cents::text, l.stock_units, l.brand, c.name as category_name,
        (
          select i.storage_key from listing_images i
          where i.listing_id = l.id and i.status = 'ready'
          order by i.is_primary desc, i.position
          limit 1
        ) as image_key
      from listings l
      join categories c on c.id = l.category_id
      where l.business_id = ${business.id} and l.status = 'published' and l.is_demo = false
      order by l.name
    `;
	const visibility = business.location_visibility === "approximate" ? "approximate" : "exact";
	const spot = business.lat === null || business.lng === null ? null : publicCoordinate(business.lat, business.lng, visibility);
	const approximate = visibility === "approximate";
	const reviews = asInt(business.review_count);
	const rating = reviews > 0 && business.avg_rating !== null ? Number(business.avg_rating) : null;
	return {
		id: business.id,
		tradeName: business.trade_name,
		legalName: business.legal_name,
		slug: business.slug,
		description: business.description,
		addressLine: approximate ? null : business.address_line,
		neighborhood: business.neighborhood,
		city: business.city,
		province: business.province || "Santa Fe",
		approximate,
		lat: spot?.lat ?? null,
		lng: spot?.lng ?? null,
		offersDelivery: business.offers_delivery,
		offersPickup: business.offers_pickup,
		isDemo: business.is_demo,
		verified: Boolean(business.verified_at),
		phone: approximate ? null : business.phone,
		createdAt: business.created_at,
		completedOrders: asInt(business.completed_orders),
		cancelledOrders: asInt(business.cancelled_orders),
		reviewCount: reviews,
		avgRating: rating !== null && Number.isFinite(rating) ? rating : null,
		mercadoPago: asInt(business.mercado_pago_count) > 0,
		disputeCount: asInt(business.dispute_count),
		coverageNote: business.coverage_note ?? "",
		minOrderNote: business.min_order_note ?? "",
		sellsWholesale: business.sells_wholesale === true,
		sellsRetail: business.sells_retail === true,
		listings: listings.map((listing) => ({
			id: listing.id,
			name: listing.name,
			unit: listing.unit,
			brand: listing.brand,
			categoryName: listing.category_name,
			priceCents: asInt(listing.price_cents),
			stockUnits: listing.stock_units,
			imageUrl: imageUrl(listing.image_key)
		}))
	};
});
var listMapBusinesses_createServerFn_handler = createServerRpc({
	id: "a19c4c828fc9b807f1782a31aa30c9e10cc6f3d3cd5b31086d06d52a4648bc04",
	name: "listMapBusinesses",
	filename: "src/lib/cerca/server/public.ts"
}, (opts) => listMapBusinesses.__executeServer(opts));
var listMapBusinesses = createServerFn({ method: "GET" }).validator((input) => ({
	q: typeof input?.q === "string" ? input.q.trim().slice(0, 80) : "",
	category: typeof input?.category === "string" ? fold(input.category).slice(0, 80) : "",
	onlyWithProducts: input?.onlyWithProducts === true
})).handler(listMapBusinesses_createServerFn_handler, async ({ data }) => {
	const db = await sql();
	const like = data.q ? likeContains(data.q) : "%";
	return (await db`
      select b.id, b.trade_name, b.neighborhood, b.city, b.address_line, b.lat, b.lng, b.location_visibility,
        (
          select count(*)::int from listings l
          where l.business_id = b.id and l.status = 'published' and l.is_demo = false
        ) as products,
        (
          select c.name from business_categories bc
          join categories c on c.id = bc.category_id
          where bc.business_id = b.id
          order by c.name
          limit 1
        ) as category_name
      from businesses b
      where b.status = 'active' and b.is_demo = false and b.lat is not null and b.lng is not null
        and (${data.q} = '' or b.search_text ilike ${like} escape '\\' or b.trade_name ilike ${like} escape '\\')
        and (
          ${data.category} = ''
          or exists (
            select 1 from business_categories bc
            join categories c on c.id = bc.category_id
            left join categories parent on parent.id = c.parent_id
            where bc.business_id = b.id and (c.slug = ${data.category} or parent.slug = ${data.category})
          )
        )
    `).filter((row) => !data.onlyWithProducts || row.products > 0).map((row) => {
		const visibility = row.location_visibility === "approximate" ? "approximate" : "exact";
		const spot = publicCoordinate(row.lat, row.lng, visibility);
		const approximate = visibility === "approximate";
		const place = approximate ? [row.neighborhood, "ubicación aproximada"].filter((part) => part && part.trim()).join(" · ") : [
			row.address_line,
			row.neighborhood,
			row.city
		].filter((part) => part && part.trim()).join(" · ");
		return {
			id: row.id,
			name: row.trade_name,
			category: row.category_name,
			products: row.products,
			place: place || "Rosario",
			approximate,
			lat: spot.lat,
			lng: spot.lng
		};
	});
});
var listPublicBusinesses_createServerFn_handler = createServerRpc({
	id: "e6e4a234686fae5162494c65975c62a6db747c496e6bd0da868f2bbc6ba35c34",
	name: "listPublicBusinesses",
	filename: "src/lib/cerca/server/public.ts"
}, (opts) => listPublicBusinesses.__executeServer(opts));
var listPublicBusinesses = createServerFn({ method: "GET" }).validator((input) => ({
	q: typeof input?.q === "string" ? input.q.trim().slice(0, 80) : "",
	category: typeof input?.category === "string" ? fold(input.category).slice(0, 80) : ""
})).handler(listPublicBusinesses_createServerFn_handler, async ({ data }) => {
	const db = await sql();
	const like = data.q ? likeContains(data.q) : "%";
	return (await db`
      select b.id, b.trade_name, b.description, b.neighborhood, b.city, b.address_line,
        b.location_visibility, b.verified_at::text, b.offers_delivery, b.offers_pickup,
        (
          select count(*)::int from listings l
          where l.business_id = b.id and l.status = 'published' and l.is_demo = false and l.stock_units > 0
        ) as products,
        coalesce((
          select string_agg(c.name, ' · ')
          from business_categories bc
          join categories c on c.id = bc.category_id
          where bc.business_id = b.id
        ), '') as category_names
      from businesses b
      where b.status = 'active' and b.is_demo = false
        and (
          ${data.q} = ''
          or b.search_text ilike ${like} escape '\\'
          or b.trade_name ilike ${like} escape '\\'
          or exists (
            select 1 from listings l
            where l.business_id = b.id and l.status = 'published' and l.is_demo = false
              and l.search_text ilike ${like} escape '\\'
          )
        )
        and (
          ${data.category} = ''
          or exists (
            select 1 from business_categories bc
            join categories c on c.id = bc.category_id
            left join categories parent on parent.id = c.parent_id
            where bc.business_id = b.id and (c.slug = ${data.category} or parent.slug = ${data.category})
          )
          or exists (
            select 1 from listings l
            join categories c on c.id = l.category_id
            left join categories parent on parent.id = c.parent_id
            where l.business_id = b.id and l.status = 'published' and l.is_demo = false
              and (c.slug = ${data.category} or parent.slug = ${data.category})
          )
        )
      order by b.trade_name
      limit 80
    `).map((row) => {
		const approximate = row.location_visibility === "approximate";
		const place = approximate ? [
			row.neighborhood,
			row.city || "Rosario",
			"ubicación aproximada"
		].filter((part) => part && part.trim()).join(" · ") : [
			row.address_line,
			row.neighborhood,
			row.city || "Rosario"
		].filter((part) => part && part.trim()).join(" · ");
		return {
			id: row.id,
			name: row.trade_name,
			description: row.description,
			neighborhood: row.neighborhood,
			city: row.city || "Rosario",
			approximate,
			place: place || "Rosario",
			verified: Boolean(row.verified_at),
			products: row.products,
			categories: row.category_names ? row.category_names.split(" · ").filter(Boolean) : [],
			offersDelivery: row.offers_delivery,
			offersPickup: row.offers_pickup
		};
	});
});
async function publicCategories(db) {
	return (await db`
    select id, slug, name, parent_id, icon from categories where active = true order by sort_order, name
  `).map((row) => ({
		id: row.id,
		slug: row.slug,
		name: row.name,
		parentId: row.parent_id,
		icon: row.icon
	}));
}
function mapNeed(row) {
	return {
		id: row.id,
		title: row.title,
		notes: row.notes,
		quantity: row.quantity,
		delivery: row.delivery_required,
		city: row.city || "Rosario",
		status: row.status,
		createdAt: row.created_at,
		categoryName: row.category_name,
		categorySlug: row.category_slug
	};
}
var listPublicRequests_createServerFn_handler = createServerRpc({
	id: "e037490333ff983b784fb5fc311499b83e9bbbee89aec2f6611b5bd87d203310",
	name: "listPublicRequests",
	filename: "src/lib/cerca/server/public.ts"
}, (opts) => listPublicRequests.__executeServer(opts));
var listPublicRequests = createServerFn({ method: "GET" }).validator((input) => ({
	q: typeof input?.q === "string" ? input.q.trim().slice(0, 80) : "",
	category: typeof input?.category === "string" ? fold(input.category).slice(0, 80) : ""
})).handler(listPublicRequests_createServerFn_handler, async ({ data }) => {
	const db = await sql();
	const like = data.q ? likeContains(data.q) : "%";
	return {
		requests: (await db`
      select r.id, r.title, r.notes, r.quantity, r.delivery_required, r.city, r.status, r.created_at::text,
        c.name as category_name, c.slug as category_slug
      from quote_requests r
      left join categories c on c.id = r.category_id
      left join categories parent on parent.id = c.parent_id
      where r.listing_id is null
        and r.status in ('open', 'answered')
        and r.expires_at > now()
        and (
          ${data.q} = ''
          or r.title ilike ${like} escape '\\'
          or r.notes ilike ${like} escape '\\'
          or c.name ilike ${like} escape '\\'
        )
        and (
          ${data.category} = ''
          or c.slug = ${data.category}
          or parent.slug = ${data.category}
        )
      order by r.created_at desc
      limit 40
    `).map(mapNeed),
		categories: await publicCategories(db)
	};
});
var getPublicRequest_createServerFn_handler = createServerRpc({
	id: "3b02ed6fe2b63dc5d4da6791aabab8593e0625544802cb5db5dd94a895e61e14",
	name: "getPublicRequest",
	filename: "src/lib/cerca/server/public.ts"
}, (opts) => getPublicRequest.__executeServer(opts));
var getPublicRequest = createServerFn({ method: "GET" }).validator((requestId) => {
	if (typeof requestId !== "string" || requestId.length < 8 || requestId.length > 80) throw new Error("Solicitud inválida.");
	return requestId;
}).handler(getPublicRequest_createServerFn_handler, async ({ data }) => {
	const row = (await (await sql())`
      select r.id, r.title, r.notes, r.quantity, r.delivery_required, r.city, r.status, r.created_at::text,
        c.name as category_name, c.slug as category_slug
      from quote_requests r
      left join categories c on c.id = r.category_id
      where r.id = ${data}
        and r.listing_id is null
        and r.status in ('open', 'answered')
        and r.expires_at > now()
    `)[0];
	if (!row) throw new Error("Esa solicitud no está publicada.");
	return mapNeed(row);
});
var getPlatformStatus_createServerFn_handler = createServerRpc({
	id: "eb7a6e2652b1acce69d022bec5bb992294f4ce36f090057ad803bae6f6247612",
	name: "getPlatformStatus",
	filename: "src/lib/cerca/server/public.ts"
}, (opts) => getPlatformStatus.__executeServer(opts));
var getPlatformStatus = createServerFn({ method: "GET" }).handler(getPlatformStatus_createServerFn_handler, async () => {
	const payments = missingMercadoPagoCredentials(readMercadoPagoEnv());
	const emailMissing = [!process.env.RESEND_API_KEY ? "RESEND_API_KEY" : null, !process.env.RESEND_FROM ? "RESEND_FROM" : null].filter((item) => Boolean(item));
	const pepperReady = Boolean(process.env.CERCA_DELIVERY_PEPPER && process.env.CERCA_DELIVERY_PEPPER.length >= 16);
	const { storageMode, readStorageEnv } = await import("./storage-BueJXjBC.mjs").then((n) => n.s);
	const mode = storageMode();
	return {
		database: dbSource === "pglite" ? "embedded_preview" : "postgres",
		demoSeedAllowed: dbSource === "pglite",
		city: "Rosario",
		payments: {
			provider: "mercadopago_split_1_1",
			configured: payments.length === 0,
			missing: payments
		},
		email: {
			configured: emailMissing.length === 0,
			missing: emailMissing
		},
		maps: activeMapTiles(),
		deliveryPepperReady: pepperReady || dbSource === "pglite",
		storage: {
			mode,
			configured: mode === "r2",
			developmentOnly: mode === "local",
			missing: mode === "r2" ? [] : [
				"S3_ENDPOINT",
				"S3_BUCKET",
				"S3_ACCESS_KEY",
				"S3_SECRET_KEY"
			],
			note: mode === "r2" ? "Las imágenes van a Cloudflare R2." : mode === "local" ? "Desarrollo: las imágenes se guardan en disco local, no en la base. En producción hace falta R2." : "No hay almacenamiento. No se puede publicar un producto con fotos.",
			endpointHost: readStorageEnv().endpoint ? "configured" : null
		},
		adminBootstrap: process.env.CERCA_BOOTSTRAP_ADMIN_EMAIL?.trim() ? "configured" : dbSource === "pglite" ? "dev_claim" : "missing",
		devMailbox: dbSource === "pglite" && !(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM?.trim())
	};
});
//#endregion
export { getBusiness_createServerFn_handler, getListing_createServerFn_handler, getPlatformStatus_createServerFn_handler, getPublicRequest_createServerFn_handler, listMapBusinesses_createServerFn_handler, listPublicBusinesses_createServerFn_handler, listPublicRequests_createServerFn_handler, searchMarketplace_createServerFn_handler };
