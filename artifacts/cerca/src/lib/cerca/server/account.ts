import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { dbSource } from "@/lib/db";
import { bootstrapAdminDecision, bootstrapAdminMessage, normalizeEmail } from "../domain/bootstrap-admin";
import { businessMutation, profileMutation } from "../domain/ownership";
import { fold, slugify } from "../domain/text";
import { insideRosario, nominatimHitsInRosario, ROSARIO, type LocationVisibility } from "../domain/geo";
import { assertString, audit, id, loadAccess, sql } from "./helpers";
import { enforceRateLimit } from "./rate-limit";
import { checkedSellerCategoryIds } from "./seller-category-store";
import { assertCanSell } from "./seller-gate";
import { parseSellerIntent, readSellerIntent, type SellerIntent } from "../domain/seller-profile";
import { normalizePaymentMethods, readStoredMethods } from "../domain/payment-methods";

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = await sql();
    const access = await loadAccess(db, context.userId);
    const users = await db<{ name: string; email: string; email_verified: boolean }>`
      select name, email, "emailVerified" as email_verified from "user" where id = ${context.userId}
    `;
    const profile = await db<{ phone: string | null; platform_role: string; seller_intent: unknown }>`
      select phone, platform_role, seller_intent from profiles where user_id = ${context.userId}
    `;
    const businesses = await db<{
      id: string;
      trade_name: string;
      status: string;
      slug: string;
      lat: number | null;
      lng: number | null;
      address_line: string | null;
      neighborhood: string | null;
      location_visibility: string | null;
      is_demo: boolean | string | number;
      description: string;
      coverage_note: string;
      min_order_note: string;
      sells_wholesale: boolean | null;
      sells_retail: boolean | null;
      payment_methods: unknown;
    }>`
      select id, trade_name, status, slug, lat, lng, address_line, neighborhood, location_visibility, is_demo,
        description, coverage_note, min_order_note, sells_wholesale, sells_retail, payment_methods
      from businesses where owner_user_id = ${context.userId}
      order by created_at
    `;
    const admins = await db<{ n: number }>`
      select count(*)::int as n from profiles where platform_role = 'admin'
    `;
    const unread = await db<{ n: number }>`
      select count(*)::int as n from notifications where user_id = ${context.userId} and read_at is null
    `;
    const completed = await db<{ n: number }>`
      select count(*)::int as n
      from orders o
      join businesses b on b.id = o.business_id
      where b.owner_user_id = ${context.userId} and o.status = 'COMPLETED'
    `;
    const categoryRows = await db<{ business_id: string; category_id: string }>`
      select bc.business_id, bc.category_id
      from business_categories bc
      join businesses b on b.id = bc.business_id
      where b.owner_user_id = ${context.userId}
    `;
    const categoriesByBusiness = new Map<string, string[]>();
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
          categoryIds: categoriesByBusiness.get(business.id) ?? [],
        };
      }),
      canClaimAdmin:
        bootstrapAdminDecision({
          adminCount: admins[0]?.n ?? 0,
          callerEmail: users[0]?.email ?? "",
          emailVerified: users[0]?.email_verified === true,
          bootstrapEmail: process.env.CERCA_BOOTSTRAP_ADMIN_EMAIL ?? null,
          devClaimAllowed: dbSource === "pglite",
        }) === "allow",
      unread: unread[0]?.n ?? 0,
      completedOrders: completed[0]?.n ?? 0,
    };
  });

export const updateMyPhone = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((phone: string) => {
    const value = assertString(phone, "Teléfono", 30);
    if (!/^[0-9+\s()-]{8,30}$/.test(value)) throw new Error("Teléfono argentino inválido.");
    return value;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const self = profileMutation(context.userId, context.userId);
    if (!self.ok) throw new Error(self.reason);
    await db`update profiles set phone = ${data}, updated_at = now() where user_id = ${context.userId}`;
    await audit(db, context.userId, "update_profile", "profile", context.userId, {});
    return { ok: true as const };
  });

export const saveSellerIntent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => parseSellerIntent(input))
  .handler(async ({ context, data }) => {
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
      declaresMinor: data.declaresMinor,
    });
    return { ok: true as const, intent: data satisfies SellerIntent };
  });

export const updateBusinessCommercial = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    businessId: string;
    description?: string;
    coverageNote?: string;
    minOrderNote?: string;
    sellsWholesale?: boolean;
    sellsRetail?: boolean;
  }) => {
    if (!input?.businessId || input.businessId.length > 80) throw new Error("Falta el negocio.");
    return {
      businessId: input.businessId,
      description: typeof input.description === "string" ? input.description.trim().slice(0, 600) : "",
      coverageNote: typeof input.coverageNote === "string" ? input.coverageNote.trim().slice(0, 160) : "",
      minOrderNote: typeof input.minOrderNote === "string" ? input.minOrderNote.trim().slice(0, 160) : "",
      sellsWholesale: input.sellsWholesale === true,
      sellsRetail: input.sellsRetail === true,
    };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    await assertCanSell(db, context.userId);
    const rows = await db<{ owner_user_id: string; status: string; is_demo: boolean }>`
      select owner_user_id, status, is_demo from businesses where id = ${data.businessId}
    `;
    const decision = businessMutation({
      actorUserId: context.userId,
      ownerUserId: rows[0]?.owner_user_id ?? null,
      isDemo: rows[0]?.is_demo,
      businessStatus: rows[0]?.status,
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
    return { ok: true as const };
  });

export const setBusinessPaymentMethods = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { businessId: string; methods: unknown }) => {
    if (!input?.businessId || input.businessId.length > 80) throw new Error("Falta el negocio.");
    return { businessId: input.businessId, methods: normalizePaymentMethods(input.methods) };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const rows = await db<{ owner_user_id: string; status: string; is_demo: boolean }>`
      select owner_user_id, status, is_demo from businesses where id = ${data.businessId}
    `;
    const decision = businessMutation({
      actorUserId: context.userId,
      ownerUserId: rows[0]?.owner_user_id ?? null,
      isDemo: rows[0]?.is_demo,
      businessStatus: rows[0]?.status,
    });
    if (!decision.ok) throw new Error(decision.reason);
    const updated = await db<{ id: string }>`
      update businesses
      set payment_methods = ${JSON.stringify(data.methods)}::jsonb, updated_at = now()
      where id = ${data.businessId} and owner_user_id = ${context.userId}
      returning id
    `;
    if (!updated[0]) throw new Error("No se guardaron los medios de pago.");
    await audit(db, context.userId, "set_payment_methods", "business", data.businessId, { methods: data.methods });
    return { ok: true as const, methods: data.methods };
  });

export const claimAdminIfNone = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    await enforceRateLimit(db, "sensitive", context.userId);
    const users = await db<{ email: string; email_verified: boolean }>`
      select email, "emailVerified" as email_verified from "user" where id = ${context.userId}
    `;
    const admins = await db<{ n: number }>`
      select count(*)::int as n from profiles where platform_role = 'admin'
    `;
    const bootstrapEmail = process.env.CERCA_BOOTSTRAP_ADMIN_EMAIL ?? null;
    const decision = bootstrapAdminDecision({
      adminCount: admins[0]?.n ?? 0,
      callerEmail: users[0]?.email ?? "",
      emailVerified: users[0]?.email_verified === true,
      bootstrapEmail,
      devClaimAllowed: dbSource === "pglite",
    });
    if (decision !== "allow") throw new Error(bootstrapAdminMessage(decision));
    const email = normalizeEmail(users[0]?.email);
    const bootstrap = normalizeEmail(bootstrapEmail);
    const devOpen = dbSource === "pglite" && !bootstrap;
    const updated = await db<{ user_id: string }>`
      update profiles p
      set platform_role = 'admin', updated_at = now()
      from "user" u
      where p.user_id = u.id
        and p.user_id = ${context.userId}
        and lower(u.email) = ${email}
        and (${devOpen} = true or (lower(u.email) = ${bootstrap} and u."emailVerified" = true))
        and (select count(*) from profiles where platform_role = 'admin') = 0
      returning p.user_id
    `;
    if (!updated[0]) throw new Error("Ya existe un administrador o esta cuenta no puede tomarlo.");
    await audit(db, context.userId, "claim_admin", "profile", context.userId, {
      bootstrap: Boolean(bootstrap),
      devOpen,
    });
    return { ok: true as const };
  });

export const createBusiness = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    tradeName: string;
    legalName: string;
    phone: string;
    address: string;
    neighborhood: string;
    categoryIds: string[];
    description?: string;
    coverageNote?: string;
    minOrderNote?: string;
    sellsWholesale?: boolean;
    sellsRetail?: boolean;
  }) => ({
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
    sellsRetail: input?.sellsRetail === true,
  }))
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    await enforceRateLimit(db, "sensitive", context.userId);
    await assertCanSell(db, context.userId);
    const categoryIds = await checkedSellerCategoryIds(data.categoryIds);
    const businessId = id();
    const base = slugify(data.tradeName);
    const slug = `${base}-${businessId.slice(0, 6)}`;
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
    for (const categoryId of categoryIds) {
      await db`insert into business_categories (business_id, category_id) values (${businessId}, ${categoryId})`;
    }
    return { id: businessId, status: "pending_review" as const, categoryIds };
  });

export const setBusinessLocation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    businessId: string;
    lat: number;
    lng: number;
    delivery?: boolean;
    pickup?: boolean;
    address?: string;
    neighborhood?: string;
    visibility?: LocationVisibility;
  }) => {
    if (!input?.businessId) throw new Error("Falta el negocio.");
    if (typeof input.lat !== "number" || typeof input.lng !== "number") throw new Error("Marcá el punto en el mapa.");
    if (!insideRosario(input.lat, input.lng)) {
      throw new Error("El punto tiene que estar en el área de Rosario.");
    }
    const visibility: LocationVisibility = input.visibility === "approximate" ? "approximate" : "exact";
    return {
      businessId: input.businessId,
      lat: input.lat,
      lng: input.lng,
      delivery: input.delivery === true,
      pickup: input.pickup !== false,
      address: typeof input.address === "string" ? input.address.trim().slice(0, 160) : "",
      neighborhood: typeof input.neighborhood === "string" ? input.neighborhood.trim().slice(0, 80) : "",
      visibility,
    };
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const rows = await db<{ owner_user_id: string; status: string; is_demo: boolean }>`
      select owner_user_id, status, is_demo from businesses where id = ${data.businessId}
    `;
    const decision = businessMutation({
      actorUserId: context.userId,
      ownerUserId: rows[0]?.owner_user_id ?? null,
      isDemo: rows[0]?.is_demo,
      businessStatus: rows[0]?.status,
    });
    if (!decision.ok) throw new Error(decision.reason);
    const updated = await db<{ id: string }>`
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
    `;
    if (!updated[0]) throw new Error("No se actualizó la ubicación.");
    await audit(db, context.userId, "update_business", "business", data.businessId, {
      visibility: data.visibility,
    });
    return { ok: true as const };
  });

export const geocodeRosario = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { query?: string }) => {
    const query = typeof input?.query === "string" ? input.query.trim() : "";
    if (query.length < 4) throw new Error("Escribí una dirección de Rosario.");
    return query.slice(0, 160);
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await enforceRateLimit(db, "sensitive", context.userId);
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "5");
    url.searchParams.set("countrycodes", "ar");
    url.searchParams.set("q", `${data}, Rosario, Santa Fe, Argentina`);
    let payload: unknown = [];
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "CONEX/1.0 (marketplace Rosario)",
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) {
        return { ok: false as const, results: [], message: "El buscador de direcciones no respondió. Mové el marcador en el mapa." };
      }
      payload = await response.json();
    } catch {
      return { ok: false as const, results: [], message: "No se pudo consultar la dirección. Mové el marcador en el mapa." };
    }
    const results = nominatimHitsInRosario(payload);
    if (results.length === 0) {
      return { ok: false as const, results: [], message: "No encontramos esa dirección en Rosario. Mové el marcador en el mapa." };
    }
    return { ok: true as const, results, message: "" };
  });

export const listCatalogProducts = createServerFn({ method: "GET" }).handler(async () => {
  throw new Error("Cerca no tiene un catálogo para vender. Cada proveedor publica sus propios productos.");
});

export const upsertOffer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { businessId?: string }) => input)
  .handler(async () => {
    throw new Error("Las ofertas sobre el catálogo de Cerca ya no se venden. Cargá el producto desde Mis productos.");
  });

export const loadDevelopmentSeed = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (dbSource !== "pglite") {
      throw new Error("El seed de desarrollo está bloqueado cuando hay una base de producción.");
    }
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
          ["prod-cemento-50", 1_050_000, 80],
          ["prod-tornillo", 180, 2000],
          ["prod-disco", 450_000, 40],
        ],
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
          ["prod-cemento-50", 980_000, 40],
          ["prod-ladrillo-hueco", 42000, 5000],
          ["prod-arena", 4_800_000, 12],
        ],
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
          ["prod-cemento-50", 1_020_000, 120],
          ["prod-hierro-8", 1_850_000, 60],
          ["prod-pvc-110", 2_200_000, 25],
        ],
      },
    ] as const;

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
        const products = await db<{ category_id: string; name: string; unit: string; slug: string }>`
          select category_id, name, unit, slug from products where id = ${productId}
        `;
        const product = products[0];
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
    return { ok: true as const, inserted: examples.length };
  });

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = await sql();
    return db<{
      id: string;
      title: string;
      body: string;
      href: string | null;
      kind: string;
      email_status: string;
      created_at: string;
      read_at: string | null;
    }>`
      select id, title, body, href, kind, email_status, created_at::text, read_at::text
      from notifications
      where user_id = ${context.userId}
      order by created_at desc
      limit 30
    `;
  });
