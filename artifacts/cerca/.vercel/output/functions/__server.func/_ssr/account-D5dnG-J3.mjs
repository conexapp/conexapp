import { h as readSellerIntent, p as parseSellerIntent } from "./seller-profile-B9jvPmNx.mjs";
import { f as sql, i as dbSource, l as id, n as assertString, r as audit, u as loadAccess } from "./helpers-AwcxVs0A.mjs";
import { i as slugify, t as fold } from "./text-BUH6vDdb.mjs";
import { r as profileMutation, t as businessMutation } from "./ownership-GOJqhWNU.mjs";
import { c as normalizePaymentMethods, u as readStoredMethods } from "./payment-methods-BtOKvucv.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { i as nominatimHitsInRosario, r as insideRosario } from "./geo-BwvVDJHB.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as enforceRateLimit } from "./rate-limit-BoqWzxCk.mjs";
import { t as checkedSellerCategoryIds } from "./seller-category-store-B2tuLE7W.mjs";
import { t as assertCanSell } from "./seller-gate-vy9ULUrk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-D5dnG-J3.js
/**
* El alta del primer admin no es "el primero que apriete el botón".
* Producción exige CERCA_BOOTSTRAP_ADMIN_EMAIL y un correo ya verificado.
* El preview (PGLite) sin esa variable conserva el reclamo de desarrollo.
* Si ya hay un admin, la decisión es siempre already_exists.
*/
function bootstrapAdminDecision(input) {
	if (input.adminCount > 0) return "already_exists";
	const bootstrap = normalizeEmail(input.bootstrapEmail);
	if (!bootstrap) return input.devClaimAllowed ? "allow" : "not_configured";
	if (normalizeEmail(input.callerEmail) !== bootstrap) return "email_mismatch";
	if (!input.emailVerified) return "unverified";
	return "allow";
}
function bootstrapAdminMessage(decision) {
	switch (decision) {
		case "already_exists": return "Ya existe un administrador. Nadie más puede autoasignarse el rol.";
		case "not_configured": return "En producción el primer administrador se define con CERCA_BOOTSTRAP_ADMIN_EMAIL durante el deploy.";
		case "email_mismatch": return "Esta cuenta no está autorizada para el alta inicial.";
		case "unverified": return "Confirmá el email antes de tomar la administración.";
	}
}
function normalizeEmail(value) {
	return (value ?? "").trim().toLowerCase();
}
var getMyAccount_createServerFn_handler = createServerRpc({
	id: "4aba93c8662aeff5a995730eae5280b597f453d9df364fbab0e5bcd9b3c092c0",
	name: "getMyAccount",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => getMyAccount.__executeServer(opts));
var getMyAccount = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMyAccount_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	const access = await loadAccess(db, context.userId);
	const users = await db`
      select name, email, "emailVerified" as email_verified from "user" where id = ${context.userId}
    `;
	const profile = await db`
      select phone, platform_role, seller_intent from profiles where user_id = ${context.userId}
    `;
	const businesses = await db`
      select id, trade_name, status, slug, lat, lng, address_line, neighborhood, location_visibility, is_demo,
        description, coverage_note, min_order_note, sells_wholesale, sells_retail, payment_methods
      from businesses where owner_user_id = ${context.userId}
      order by created_at
    `;
	const admins = await db`
      select count(*)::int as n from profiles where platform_role = 'admin'
    `;
	const unread = await db`
      select count(*)::int as n from notifications where user_id = ${context.userId} and read_at is null
    `;
	const completed = await db`
      select count(*)::int as n
      from orders o
      join businesses b on b.id = o.business_id
      where b.owner_user_id = ${context.userId} and o.status = 'COMPLETED'
    `;
	const categoryRows = await db`
      select bc.business_id, bc.category_id
      from business_categories bc
      join businesses b on b.id = bc.business_id
      where b.owner_user_id = ${context.userId}
    `;
	const categoriesByBusiness = /* @__PURE__ */ new Map();
	for (const row of categoryRows) {
		const list = categoriesByBusiness.get(row.business_id) ?? [];
		list.push(row.category_id);
		categoriesByBusiness.set(row.business_id, list);
	}
	return {
		userId: context.userId,
		name: users[0]?.name ?? "",
		email: users[0]?.email ?? "",
		emailVerified: users[0]?.email_verified === true,
		phone: profile[0]?.phone ?? "",
		sellerIntent: readSellerIntent(profile[0]?.seller_intent ?? null),
		platformRole: access.platformRole,
		businesses: businesses.map((business) => {
			const { payment_methods: stored, ...rest } = business;
			return {
				...rest,
				paymentMethods: readStoredMethods(stored),
				categoryIds: categoriesByBusiness.get(business.id) ?? []
			};
		}),
		canClaimAdmin: bootstrapAdminDecision({
			adminCount: admins[0]?.n ?? 0,
			callerEmail: users[0]?.email ?? "",
			emailVerified: users[0]?.email_verified === true,
			bootstrapEmail: process.env.CERCA_BOOTSTRAP_ADMIN_EMAIL ?? null,
			devClaimAllowed: dbSource === "pglite"
		}) === "allow",
		unread: unread[0]?.n ?? 0,
		completedOrders: completed[0]?.n ?? 0
	};
});
var updateMyPhone_createServerFn_handler = createServerRpc({
	id: "ae8d45090271869dc24f27778ba1febaaf6770f9494d2e536e22cd112c376fe5",
	name: "updateMyPhone",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => updateMyPhone.__executeServer(opts));
var updateMyPhone = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((phone) => {
	const value = assertString(phone, "Teléfono", 30);
	if (!/^[0-9+\s()-]{8,30}$/.test(value)) throw new Error("Teléfono argentino inválido.");
	return value;
}).handler(updateMyPhone_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const self = profileMutation(context.userId, context.userId);
	if (!self.ok) throw new Error(self.reason);
	await db`update profiles set phone = ${data}, updated_at = now() where user_id = ${context.userId}`;
	await audit(db, context.userId, "update_profile", "profile", context.userId, {});
	return { ok: true };
});
var saveSellerIntent_createServerFn_handler = createServerRpc({
	id: "15346e90f0b39728b0ccb2955f29dc93080e3e6a79366d1c5e68c8b9eb78558b",
	name: "saveSellerIntent",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => saveSellerIntent.__executeServer(opts));
var saveSellerIntent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parseSellerIntent(input)).handler(saveSellerIntent_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	await enforceRateLimit(db, "sensitive", context.userId);
	const self = profileMutation(context.userId, context.userId);
	if (!self.ok) throw new Error(self.reason);
	await db`
      update profiles
      set seller_intent = ${JSON.stringify(data)}::jsonb, updated_at = now()
      where user_id = ${context.userId}
    `;
	await audit(db, context.userId, "save_seller_intent", "profile", context.userId, {
		goal: data.goal,
		declaresMinor: data.declaresMinor
	});
	return {
		ok: true,
		intent: data
	};
});
var updateBusinessCommercial_createServerFn_handler = createServerRpc({
	id: "b6eb131d14db1869752997708341e09dbb163c98918cace2baea2c6fc64adfd1",
	name: "updateBusinessCommercial",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => updateBusinessCommercial.__executeServer(opts));
var updateBusinessCommercial = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.businessId || input.businessId.length > 80) throw new Error("Falta el negocio.");
	return {
		businessId: input.businessId,
		description: typeof input.description === "string" ? input.description.trim().slice(0, 600) : "",
		coverageNote: typeof input.coverageNote === "string" ? input.coverageNote.trim().slice(0, 160) : "",
		minOrderNote: typeof input.minOrderNote === "string" ? input.minOrderNote.trim().slice(0, 160) : "",
		sellsWholesale: input.sellsWholesale === true,
		sellsRetail: input.sellsRetail === true
	};
}).handler(updateBusinessCommercial_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	await assertCanSell(db, context.userId);
	const rows = await db`
      select owner_user_id, status, is_demo from businesses where id = ${data.businessId}
    `;
	const decision = businessMutation({
		actorUserId: context.userId,
		ownerUserId: rows[0]?.owner_user_id ?? null,
		isDemo: rows[0]?.is_demo,
		businessStatus: rows[0]?.status
	});
	if (!decision.ok) throw new Error(decision.reason);
	await db`
      update businesses
      set description = ${data.description},
          coverage_note = ${data.coverageNote},
          min_order_note = ${data.minOrderNote},
          sells_wholesale = ${data.sellsWholesale},
          sells_retail = ${data.sellsRetail},
          updated_at = now()
      where id = ${data.businessId}
    `;
	await audit(db, context.userId, "update_business_commercial", "business", data.businessId, {});
	return { ok: true };
});
var setBusinessPaymentMethods_createServerFn_handler = createServerRpc({
	id: "7ad231c7b09cfca4c0ec552124b11152c6a61e3134de51e7c4cad56bb5f9a024",
	name: "setBusinessPaymentMethods",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => setBusinessPaymentMethods.__executeServer(opts));
var setBusinessPaymentMethods = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.businessId || input.businessId.length > 80) throw new Error("Falta el negocio.");
	return {
		businessId: input.businessId,
		methods: normalizePaymentMethods(input.methods)
	};
}).handler(setBusinessPaymentMethods_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const rows = await db`
      select owner_user_id, status, is_demo from businesses where id = ${data.businessId}
    `;
	const decision = businessMutation({
		actorUserId: context.userId,
		ownerUserId: rows[0]?.owner_user_id ?? null,
		isDemo: rows[0]?.is_demo,
		businessStatus: rows[0]?.status
	});
	if (!decision.ok) throw new Error(decision.reason);
	if (!(await db`
      update businesses
      set payment_methods = ${JSON.stringify(data.methods)}::jsonb, updated_at = now()
      where id = ${data.businessId} and owner_user_id = ${context.userId}
      returning id
    `)[0]) throw new Error("No se guardaron los medios de pago.");
	await audit(db, context.userId, "set_payment_methods", "business", data.businessId, { methods: data.methods });
	return {
		ok: true,
		methods: data.methods
	};
});
var claimAdminIfNone_createServerFn_handler = createServerRpc({
	id: "09cbe489c341db73d7abaeae69d4e349f73e30314550014224a3ef143acc8d46",
	name: "claimAdminIfNone",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => claimAdminIfNone.__executeServer(opts));
var claimAdminIfNone = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(claimAdminIfNone_createServerFn_handler, async ({ context }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	await enforceRateLimit(db, "sensitive", context.userId);
	const users = await db`
      select email, "emailVerified" as email_verified from "user" where id = ${context.userId}
    `;
	const admins = await db`
      select count(*)::int as n from profiles where platform_role = 'admin'
    `;
	const bootstrapEmail = process.env.CERCA_BOOTSTRAP_ADMIN_EMAIL ?? null;
	const decision = bootstrapAdminDecision({
		adminCount: admins[0]?.n ?? 0,
		callerEmail: users[0]?.email ?? "",
		emailVerified: users[0]?.email_verified === true,
		bootstrapEmail,
		devClaimAllowed: dbSource === "pglite"
	});
	if (decision !== "allow") throw new Error(bootstrapAdminMessage(decision));
	const email = normalizeEmail(users[0]?.email);
	const bootstrap = normalizeEmail(bootstrapEmail);
	const devOpen = dbSource === "pglite" && !bootstrap;
	if (!(await db`
      update profiles p
      set platform_role = 'admin', updated_at = now()
      from "user" u
      where p.user_id = u.id
        and p.user_id = ${context.userId}
        and lower(u.email) = ${email}
        and (${devOpen} = true or (lower(u.email) = ${bootstrap} and u."emailVerified" = true))
        and (select count(*) from profiles where platform_role = 'admin') = 0
      returning p.user_id
    `)[0]) throw new Error("Ya existe un administrador o esta cuenta no puede tomarlo.");
	await audit(db, context.userId, "claim_admin", "profile", context.userId, {
		bootstrap: Boolean(bootstrap),
		devOpen
	});
	return { ok: true };
});
var createBusiness_createServerFn_handler = createServerRpc({
	id: "c3ab414d4fa41a17c10b6fe5f4ba285042f6c46200e868db660c87ced6e8a65e",
	name: "createBusiness",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => createBusiness.__executeServer(opts));
var createBusiness = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	tradeName: assertString(input?.tradeName, "Nombre comercial", 80),
	legalName: assertString(input?.legalName, "Razón social", 120),
	phone: assertString(input?.phone, "Teléfono", 30),
	address: assertString(input?.address, "Dirección", 160),
	neighborhood: assertString(input?.neighborhood, "Barrio", 80),
	categoryIds: Array.isArray(input?.categoryIds) ? input.categoryIds : [],
	description: typeof input?.description === "string" ? input.description.trim().slice(0, 600) : "",
	coverageNote: typeof input?.coverageNote === "string" ? input.coverageNote.trim().slice(0, 160) : "",
	minOrderNote: typeof input?.minOrderNote === "string" ? input.minOrderNote.trim().slice(0, 160) : "",
	sellsWholesale: input?.sellsWholesale === true,
	sellsRetail: input?.sellsRetail === true
})).handler(createBusiness_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	await enforceRateLimit(db, "sensitive", context.userId);
	await assertCanSell(db, context.userId);
	const categoryIds = await checkedSellerCategoryIds(data.categoryIds);
	const businessId = id();
	const slug = `${slugify(data.tradeName)}-${businessId.slice(0, 6)}`;
	const search = fold(`${data.tradeName} ${data.legalName} ${data.neighborhood} rosario`);
	await db`
      insert into businesses (
        id, owner_user_id, legal_name, trade_name, slug, phone, address_line, neighborhood,
        city, province, country, status, search_text, description, coverage_note, min_order_note,
        sells_wholesale, sells_retail
      ) values (
        ${businessId}, ${context.userId}, ${data.legalName}, ${data.tradeName}, ${slug}, ${data.phone},
        ${data.address}, ${data.neighborhood}, 'Rosario', 'Santa Fe', 'AR', 'pending_review', ${search},
        ${data.description}, ${data.coverageNote}, ${data.minOrderNote}, ${data.sellsWholesale}, ${data.sellsRetail}
      )
    `;
	await audit(db, context.userId, "create_business", "business", businessId, { tradeName: data.tradeName });
	for (const categoryId of categoryIds) await db`insert into business_categories (business_id, category_id) values (${businessId}, ${categoryId})`;
	return {
		id: businessId,
		status: "pending_review",
		categoryIds
	};
});
var setBusinessLocation_createServerFn_handler = createServerRpc({
	id: "bc2419c21c0938f4f49eeacc128c1b19f8b96ea62abe3a5e7e6e60a35a8687eb",
	name: "setBusinessLocation",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => setBusinessLocation.__executeServer(opts));
var setBusinessLocation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.businessId) throw new Error("Falta el negocio.");
	if (typeof input.lat !== "number" || typeof input.lng !== "number") throw new Error("Marcá el punto en el mapa.");
	if (!insideRosario(input.lat, input.lng)) throw new Error("El punto tiene que estar en el área de Rosario.");
	const visibility = input.visibility === "approximate" ? "approximate" : "exact";
	return {
		businessId: input.businessId,
		lat: input.lat,
		lng: input.lng,
		delivery: input.delivery === true,
		pickup: input.pickup !== false,
		address: typeof input.address === "string" ? input.address.trim().slice(0, 160) : "",
		neighborhood: typeof input.neighborhood === "string" ? input.neighborhood.trim().slice(0, 80) : "",
		visibility
	};
}).handler(setBusinessLocation_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await loadAccess(db, context.userId);
	const rows = await db`
      select owner_user_id, status, is_demo from businesses where id = ${data.businessId}
    `;
	const decision = businessMutation({
		actorUserId: context.userId,
		ownerUserId: rows[0]?.owner_user_id ?? null,
		isDemo: rows[0]?.is_demo,
		businessStatus: rows[0]?.status
	});
	if (!decision.ok) throw new Error(decision.reason);
	if (!(await db`
      update businesses
      set lat = ${data.lat}, lng = ${data.lng},
          location_visibility = ${data.visibility},
          address_line = case when ${data.address} = '' then address_line else ${data.address} end,
          neighborhood = case when ${data.neighborhood} = '' then neighborhood else ${data.neighborhood} end,
          city = 'Rosario', province = 'Santa Fe',
          offers_delivery = ${data.delivery},
          offers_pickup = ${data.pickup}, updated_at = now()
      where id = ${data.businessId} and owner_user_id = ${context.userId}
      returning id
    `)[0]) throw new Error("No se actualizó la ubicación.");
	await audit(db, context.userId, "update_business", "business", data.businessId, { visibility: data.visibility });
	return { ok: true };
});
var geocodeRosario_createServerFn_handler = createServerRpc({
	id: "fd92e9cf721d159c369b04672b2bb17af8818a20d5ccd3e4168204ec8758af33",
	name: "geocodeRosario",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => geocodeRosario.__executeServer(opts));
var geocodeRosario = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const query = typeof input?.query === "string" ? input.query.trim() : "";
	if (query.length < 4) throw new Error("Escribí una dirección de Rosario.");
	return query.slice(0, 160);
}).handler(geocodeRosario_createServerFn_handler, async ({ context, data }) => {
	const db = await sql();
	await enforceRateLimit(db, "sensitive", context.userId);
	const url = new URL("https://nominatim.openstreetmap.org/search");
	url.searchParams.set("format", "jsonv2");
	url.searchParams.set("limit", "5");
	url.searchParams.set("countrycodes", "ar");
	url.searchParams.set("q", `${data}, Rosario, Santa Fe, Argentina`);
	let payload = [];
	try {
		const response = await fetch(url, {
			headers: {
				Accept: "application/json",
				"User-Agent": "CONEX/1.0 (marketplace Rosario)"
			},
			signal: AbortSignal.timeout(8e3)
		});
		if (!response.ok) return {
			ok: false,
			results: [],
			message: "El buscador de direcciones no respondió. Mové el marcador en el mapa."
		};
		payload = await response.json();
	} catch {
		return {
			ok: false,
			results: [],
			message: "No se pudo consultar la dirección. Mové el marcador en el mapa."
		};
	}
	const results = nominatimHitsInRosario(payload);
	if (results.length === 0) return {
		ok: false,
		results: [],
		message: "No encontramos esa dirección en Rosario. Mové el marcador en el mapa."
	};
	return {
		ok: true,
		results,
		message: ""
	};
});
var listCatalogProducts_createServerFn_handler = createServerRpc({
	id: "48e541d21fb027f1f61e19b16e087a25efac3da8ff006201b813cd85d565e0e2",
	name: "listCatalogProducts",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => listCatalogProducts.__executeServer(opts));
var listCatalogProducts = createServerFn({ method: "GET" }).handler(listCatalogProducts_createServerFn_handler, async () => {
	throw new Error("Cerca no tiene un catálogo para vender. Cada proveedor publica sus propios productos.");
});
var upsertOffer_createServerFn_handler = createServerRpc({
	id: "08fba208bf348b1a61fc39c4a1c3029884ae5d837b102a3148995e1b821b12d6",
	name: "upsertOffer",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => upsertOffer.__executeServer(opts));
var upsertOffer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(upsertOffer_createServerFn_handler, async () => {
	throw new Error("Las ofertas sobre el catálogo de Cerca ya no se venden. Cargá el producto desde Mis productos.");
});
var loadDevelopmentSeed_createServerFn_handler = createServerRpc({
	id: "566256237164e949f12dd8a4dcbf5f6dbc4bffcbe7f08ffa786c06f29fd62701",
	name: "loadDevelopmentSeed",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => loadDevelopmentSeed.__executeServer(opts));
var loadDevelopmentSeed = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(loadDevelopmentSeed_createServerFn_handler, async ({ context }) => {
	if (dbSource !== "pglite") throw new Error("El seed de desarrollo está bloqueado cuando hay una base de producción.");
	const db = await sql();
	await loadAccess(db, context.userId);
	const examples = [
		{
			userId: "demo-user-central",
			email: "demo-central@cerca.invalid",
			name: "Ferretería Central (ejemplo)",
			businessId: "demo-biz-central",
			trade: "Ferretería Central",
			legal: "Ferretería Central SRL (ejemplo)",
			neighborhood: "Pichincha",
			lat: -32.9476,
			lng: -60.6432,
			offers: [
				[
					"prod-cemento-50",
					105e4,
					80
				],
				[
					"prod-tornillo",
					180,
					2e3
				],
				[
					"prod-disco",
					45e4,
					40
				]
			]
		},
		{
			userId: "demo-user-constru",
			email: "demo-constru@cerca.invalid",
			name: "ConstruMax (ejemplo)",
			businessId: "demo-biz-constru",
			trade: "ConstruMax",
			legal: "ConstruMax SA (ejemplo)",
			neighborhood: "Fisherton",
			lat: -32.9184,
			lng: -60.7125,
			offers: [
				[
					"prod-cemento-50",
					98e4,
					40
				],
				[
					"prod-ladrillo-hueco",
					42e3,
					5e3
				],
				[
					"prod-arena",
					48e5,
					12
				]
			]
		},
		{
			userId: "demo-user-tecno",
			email: "demo-tecno@cerca.invalid",
			name: "TecnoSur (ejemplo)",
			businessId: "demo-biz-tecno",
			trade: "TecnoSur",
			legal: "TecnoSur SRL (ejemplo)",
			neighborhood: "Centro",
			lat: -32.9448,
			lng: -60.6502,
			offers: [
				[
					"prod-cemento-50",
					102e4,
					120
				],
				[
					"prod-hierro-8",
					185e4,
					60
				],
				[
					"prod-pvc-110",
					22e5,
					25
				]
			]
		}
	];
	for (const example of examples) {
		await db`
        insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
        values (${example.userId}, ${example.name}, ${example.email}, false, now(), now())
        on conflict (id) do nothing
      `;
		await db`
        insert into profiles (user_id) values (${example.userId})
        on conflict (user_id) do nothing
      `;
		const search = fold(`${example.trade} ${example.neighborhood} rosario ejemplo`);
		await db`
        insert into businesses (
          id, owner_user_id, legal_name, trade_name, slug, neighborhood, city, lat, lng,
          status, offers_delivery, offers_pickup, is_demo, search_text, description
        ) values (
          ${example.businessId}, ${example.userId}, ${example.legal}, ${example.trade},
          ${slugify(example.trade)}, ${example.neighborhood}, 'Rosario', ${example.lat}, ${example.lng},
          'active', true, true, true, ${search},
          'Dato de desarrollo. No es un proveedor real.'
        )
        on conflict (id) do nothing
      `;
		for (const [productId, price, stock] of example.offers) {
			await db`
          insert into offers (id, business_id, product_id, price_cents, stock_units, delivery, pickup)
          values (${`${example.businessId}-${productId}`}, ${example.businessId}, ${productId}, ${price}, ${stock}, true, true)
          on conflict (business_id, product_id) do nothing
        `;
			const product = (await db`
          select category_id, name, unit, slug from products where id = ${productId}
        `)[0];
			if (!product) continue;
			const listingId = `${example.businessId}-${productId}`;
			await db`
          insert into listings (
            id, business_id, category_id, standard_product_id, slug, name, description,
            price_cents, unit, stock_units, pickup, delivery, status, search_text, is_demo
          ) values (
            ${listingId}, ${example.businessId}, ${product.category_id}, ${productId},
            ${`${product.slug}-${listingId.slice(0, 12)}`}, ${product.name},
            ${"Dato de desarrollo. No es una publicación real."},
            ${price}, ${product.unit}, ${stock}, true, true, 'published',
            ${fold(`${product.name} ${example.trade} ejemplo`)}, true
          )
          on conflict (id) do nothing
        `;
		}
	}
	await audit(db, context.userId, "load_dev_seed", "platform", null, {});
	return {
		ok: true,
		inserted: examples.length
	};
});
var listNotifications_createServerFn_handler = createServerRpc({
	id: "b566c1f8f028153ebeb77917e06004b3fc531022277a1ad52c4c78e17b8397a2",
	name: "listNotifications",
	filename: "src/lib/cerca/server/account.ts"
}, (opts) => listNotifications.__executeServer(opts));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listNotifications_createServerFn_handler, async ({ context }) => {
	return (await sql())`
      select id, title, body, href, kind, email_status, created_at::text, read_at::text
      from notifications
      where user_id = ${context.userId}
      order by created_at desc
      limit 30
    `;
});
//#endregion
export { claimAdminIfNone_createServerFn_handler, createBusiness_createServerFn_handler, geocodeRosario_createServerFn_handler, getMyAccount_createServerFn_handler, listCatalogProducts_createServerFn_handler, listNotifications_createServerFn_handler, loadDevelopmentSeed_createServerFn_handler, saveSellerIntent_createServerFn_handler, setBusinessLocation_createServerFn_handler, setBusinessPaymentMethods_createServerFn_handler, updateBusinessCommercial_createServerFn_handler, updateMyPhone_createServerFn_handler, upsertOffer_createServerFn_handler };
