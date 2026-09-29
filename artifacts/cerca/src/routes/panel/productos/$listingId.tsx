import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { formatArs, parseArsToCents } from "@/lib/cerca/domain/money";
import { getMyAccount } from "@/lib/cerca/server/account";
import {
  confirmListingImage,
  createListing,
  deleteListingImage,
  getMyListing,
  listListingOptions,
  moveListingImage,
  prepareListingImage,
  publishListing,
  removeListing,
  saveListingImage,
  setListingStatus,
  setListingPaymentMethods,
  setPrimaryImage,
  updateListing,
} from "@/lib/cerca/server/listings";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toast } from "sonner";
import { ConexSelect } from "@/components/cerca/controls";
import { CategoryGlyph } from "@/components/cerca/category-visual";
import { PaymentMethodChips, PaymentMethodToggles } from "@/components/cerca/payment-methods";
import { paymentMethodByCode } from "@/lib/cerca/domain/payment-methods";

export const Route = createFileRoute("/panel/productos/$listingId")({ component: EditorPage });

type Options = Awaited<ReturnType<typeof listListingOptions>>;
type Account = Awaited<ReturnType<typeof getMyAccount>>;
type Business = Account["businesses"][number];
type ListingImage = Awaited<ReturnType<typeof getMyListing>>["images"][number];

const STEPS = [
  { id: "producto", label: "Producto", title: "Producto", next: "Continuar con precio y disponibilidad" },
  { id: "precio", label: "Precio y disponibilidad", title: "Precio y disponibilidad", next: "Continuar con la entrega" },
  { id: "entrega", label: "Entrega", title: "¿Cómo puede recibirlo el comprador?", next: "Revisar y publicar" },
  { id: "revisar", label: "Revisar y publicar", title: "Así verán tu producto los compradores", next: "" },
] as const;

const control = "min-h-11 w-full rounded-2xl border border-line bg-foam px-3 text-base";

function EditorPage() {
  const { listingId } = Route.useParams();
  const creating = listingId === "nuevo";
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [options, setOptions] = useState<Options | null>(null);
  const [businesses, setBusinesses] = useState<Business[] | null>(null);
  const [accountError, setAccountError] = useState("");
  const [optionsError, setOptionsError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loaded, setLoaded] = useState(creating);
  const [stepIndex, setStepIndex] = useState(0);
  const [businessId, setBusinessId] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [standardProductId, setStandardProductId] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("unidad");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState(0);
  const [pickup, setPickup] = useState(true);
  const [delivery, setDelivery] = useState(false);
  const [shipping, setShipping] = useState("");
  const [hours, setHours] = useState("");
  const [status, setStatus] = useState("draft");
  const [images, setImages] = useState<ListingImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [inheritPayments, setInheritPayments] = useState(true);
  const [productMethods, setProductMethods] = useState<string[]>([]);

  function clearError(key: string) {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function payload(priceCents: number, shippingCents: number) {
    return {
      businessId,
      name,
      description,
      brand,
      model,
      sku,
      categoryId,
      standardProductId: standardProductId || null,
      priceCents,
      unit,
      referenceUnit: "",
      referencePriceCents: null,
      stockUnits: Number(stock),
      minStock,
      pickup,
      delivery,
      shippingCents,
      leadTimeHours: Number(hours),
    };
  }

  function validate(): { step: number; errors: Record<string, string> } | null {
    const next: Record<string, string> = {};
    if (!businessId) next.business = "Elegí un negocio antes de continuar.";
    if (!name.trim()) next.name = "Escribí el nombre que van a ver los compradores.";
    const priceCents = parseArsToCents(price);
    if (!priceCents) next.price = "Ingresá el precio en pesos. Por ejemplo, 125000 es $ 125.000.";
    if (!unit.trim()) next.unit = "Indicá la unidad de venta. Por ejemplo, unidad, kg o litro.";
    if (!/^\d+$/.test(stock.trim())) next.stock = "Indicá el stock disponible. Si no tenés, escribí 0.";
    if (delivery) {
      const ship = parseArsToCents(shipping) ?? (shipping.trim() === "0" ? 0 : null);
      if (ship === null) next.shipping = "Indicá el costo de envío en pesos. Si el envío no se cobra, escribí 0.";
    }
    if (!/^\d+$/.test(hours.trim())) next.hours = "Indicá el plazo en horas. Por ejemplo, 48 son dos días.";
    else if (Number(hours) > 24 * 90) next.hours = "El plazo máximo es 2160 horas.";
    if (!categoryId) next.category = "Elegí una categoría final para que los compradores puedan encontrar tu producto.";
    if (Object.keys(next).length === 0) return null;
    const step = next.business || next.name || next.category ? 0 : next.price || next.unit || next.stock ? 1 : 2;
    return { step, errors: next };
  }

  async function reload(id = listingId) {
    if (id === "nuevo") return;
    const listing = await getMyListing({ data: id });
    setBusinessId(listing.business_id);
    setName(listing.name);
    setBrand(listing.brand);
    setModel(listing.model);
    setSku(listing.sku);
    setDescription(listing.description);
    setCategoryId(listing.category_id);
    setStandardProductId(listing.standard_product_id ?? "");
    setPrice(centsToInput(listing.priceCents));
    setUnit(listing.unit);
    setStock(String(listing.stock_units));
    setMinStock(listing.min_stock);
    setPickup(listing.pickup);
    setDelivery(listing.delivery);
    setShipping(centsToInput(listing.shippingCents));
    setHours(listing.lead_time_hours == null ? "" : String(listing.lead_time_hours));
    setStatus(listing.status);
    setInheritPayments(listing.paymentInherit);
    setProductMethods(listing.paymentMethods);
    setImages(listing.images);
    setLoaded(true);
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setAccountError("");
    void listListingOptions()
      .then((next) => {
        if (!cancelled) setOptions(next);
      })
      .catch((error: unknown) => {
        if (!cancelled) setOptionsError(friendlyError(error));
      });
    void getMyAccount()
      .then((account) => {
        if (!cancelled) setBusinesses(account.businesses);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setBusinesses([]);
          setAccountError(friendlyError(error));
        }
      });
    if (!creating) {
      void reload().catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "No se pudo abrir.");
      });
    }
    return () => {
      cancelled = true;
    };
  }, [user, listingId]);

  useEffect(() => {
    if (!creating || !businesses) return;
    const usable = businesses.filter(canUseBusiness);
    if (usable.some((business) => business.id === businessId)) return;
    const preferred = usable.find((business) => business.status === "active") ?? usable[0];
    if (preferred) setBusinessId(preferred.id);
  }, [creating, businesses, businessId]);

  if (isPending) {
    return (
      <Shell>
        <p className="text-sm text-muted">Cargando tu cuenta…</p>
      </Shell>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!creating && loadError) {
    return (
      <Shell>
        <h1 className="text-4xl">No se puede abrir este producto</h1>
        <p className="mt-3 max-w-xl text-sm" role="alert">{loadError}</p>
        <Link to="/panel/productos" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-olive">
          Volver a mis productos
        </Link>
      </Shell>
    );
  }
  if (businesses === null || (!creating && !loaded)) {
    return (
      <Shell>
        <p className="text-sm text-muted">Cargando el formulario…</p>
      </Shell>
    );
  }

  const usable = businesses.filter(canUseBusiness);
  const selected = businesses.find((business) => business.id === businessId) ?? null;
  const suspendedOnly = usable.length === 0 && businesses.some((business) => !isDemo(business) && business.status === "suspended");

  if (creating && usable.length === 0) {
    return (
      <Shell>
        <h1 className="text-4xl">Agregar producto</h1>
        <section className="mt-6 max-w-xl rounded-card border border-line bg-foam p-4" role="status">
          {accountError ? (
            <>
              <h2 className="text-2xl">No pudimos cargar tus negocios.</h2>
              <p className="mt-2 text-sm" role="alert">{accountError}</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl">No tenés un negocio disponible para publicar.</h2>
              <p className="mt-2 text-sm text-muted">
                Primero creá tu negocio. Cuando esté disponible, vas a poder publicar productos desde acá.
              </p>
            </>
          )}
          {suspendedOnly ? (
            <p className="mt-3 text-sm">Tu negocio está suspendido. Mientras siga así no podés cargar productos.</p>
          ) : null}
          <Link to="/panel" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-ink">
            Crear mi negocio
          </Link>
        </section>
      </Shell>
    );
  }

  const pendingSelected = selected?.status === "pending_review";
  const archived = status === "archived";
  const readyImages = images.filter((image) => image.status === "ready" && image.url);
  const priceCents = parseArsToCents(price);
  const categoryLabel = categoryLabelOf(options, categoryId);
  const standardLabel = options?.standards.find((item) => item.id === standardProductId)?.name ?? "";

  async function save(publish: boolean) {
    const found = validate();
    if (found) {
      setErrors(found.errors);
      setStepIndex(found.step);
      setFormError("Revisá los campos marcados antes de guardar.");
      return;
    }
    if (publish) {
      if (pendingSelected || selected?.status !== "active") {
        setStepIndex(3);
        setFormError("Tu negocio está pendiente de aprobación. Cuando sea aprobado vas a poder publicar productos.");
        return;
      }
      if (Number(stock) <= 0) {
        setStepIndex(1);
        setErrors((current) => ({ ...current, stock: "No se puede publicar sin stock. Cargá al menos 1." }));
        setFormError("No se puede publicar sin stock.");
        return;
      }
      if (!pickup && !delivery) {
        setStepIndex(2);
        setErrors((current) => ({ ...current, delivery: "Indicá retiro, envío o ambos." }));
        setFormError("Indicá retiro, envío o ambos.");
        return;
      }
      if (readyImages.length < 1) {
        setStepIndex(0);
        setFormError("Agregá al menos una foto para publicar.");
        return;
      }
    }
    const parsedPrice = parseArsToCents(price);
    const parsedShipping = delivery ? (parseArsToCents(shipping) ?? (shipping.trim() === "0" ? 0 : null)) : 0;
    if (!parsedPrice) {
      setFormError("Revisá el precio.");
      setStepIndex(1);
      return;
    }
    if (parsedShipping === null) {
      setFormError("Revisá el costo de envío.");
      setStepIndex(2);
      return;
    }
    const body = payload(parsedPrice, parsedShipping);
    setFormError("");
    try {
      if (creating) {
        const created = await createListing({ data: body });
        await setListingPaymentMethods({
          data: { listingId: created.id, inherit: inheritPayments, methods: productMethods },
        });
        toast.success("Borrador guardado. Ahora podés subir las fotos.");
        await navigate({ to: "/panel/productos/$listingId", params: { listingId: created.id } });
        return;
      }
      if (archived) {
        setFormError("Un producto archivado no se edita.");
        return;
      }
      const updated = await updateListing({ data: { listingId, ...body } });
      await setListingPaymentMethods({
        data: { listingId, inherit: inheritPayments, methods: productMethods },
      });
      setStatus(updated.status);
      if (publish) {
        const published = await publishListing({ data: listingId });
        setStatus(published.status);
        toast.success("Tu producto ya está publicado.");
      } else {
        toast.success("Cambios guardados. Los pedidos anteriores no cambian.");
      }
      await reload();
    } catch (error) {
      setFormError(friendlyError(error));
    }
  }

  async function upload(file: File) {
    if (creating) {
      toast.error("Guardá el borrador antes de subir fotos.");
      return;
    }
    const prepared = await prepareListingImage({
      data: { listingId, contentType: file.type || "application/octet-stream", byteSize: file.size },
    });
    if (prepared.mode === "direct") {
      const base64 = await fileToBase64(file);
      await saveListingImage({ data: { imageId: prepared.imageId, base64 } });
    } else {
      const response = await fetch(prepared.uploadUrl, {
        method: "PUT",
        headers: prepared.headers,
        body: file,
      });
      if (!response.ok) throw new Error("El almacenamiento rechazó la imagen.");
      await confirmListingImage({ data: prepared.imageId });
    }
    await reload();
  }

  function continueStep() {
    if (stepIndex === 0) {
      const next: Record<string, string> = {};
      if (!name.trim()) next.name = "Escribí el nombre que van a ver los compradores.";
      if (!categoryId) next.category = "Elegí una categoría final para que los compradores puedan encontrar tu producto.";
      if (Object.keys(next).length > 0) {
        setErrors((current) => ({ ...current, ...next }));
        return;
      }
    }
    if (stepIndex === 1) {
      const next: Record<string, string> = {};
      if (!parseArsToCents(price)) next.price = "Ingresá el precio en pesos. Por ejemplo, 125000 es $ 125.000.";
      if (!unit.trim()) next.unit = "Indicá la unidad de venta. Por ejemplo, unidad, kg o litro.";
      if (!/^\d+$/.test(stock.trim())) next.stock = "Indicá el stock disponible. Si no tenés, escribí 0.";
      if (Object.keys(next).length > 0) {
        setErrors((current) => ({ ...current, ...next }));
        return;
      }
    }
    if (stepIndex === 2) {
      const next: Record<string, string> = {};
      if (delivery && (parseArsToCents(shipping) ?? (shipping.trim() === "0" ? 0 : null)) === null) {
        next.shipping = "Indicá el costo de envío en pesos. Si el envío no se cobra, escribí 0.";
      }
      if (!/^\d+$/.test(hours.trim())) next.hours = "Indicá el plazo en horas. Por ejemplo, 48 son dos días.";
      if (Object.keys(next).length > 0) {
        setErrors((current) => ({ ...current, ...next }));
        return;
      }
    }
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  }

  const step = STEPS[stepIndex] ?? STEPS[0];

  return (
    <Shell>
      <p className="text-sm text-muted">{creating ? "Nuevo borrador" : `Estado: ${statusLabel(status)}`}</p>
      <h1 className="mb-2 text-4xl">{creating ? "Agregar producto" : name || "Editar producto"}</h1>
      <ol className="mb-4 flex flex-wrap gap-2 text-sm">
        {STEPS.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              aria-current={index === stepIndex ? "step" : undefined}
              onClick={() => setStepIndex(index)}
              className={`min-h-11 rounded-full px-3 ${index === stepIndex ? "bg-ink font-semibold text-paper" : "border border-line bg-paper"}`}
            >
              {index + 1}. {item.label}
            </button>
          </li>
        ))}
      </ol>

      <form
        className="grid max-w-3xl gap-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void save(false);
        }}
      >
        <BusinessBlock
          businesses={creating ? usable : businesses.filter((business) => !isDemo(business))}
          businessId={businessId}
          creating={creating}
          error={errors.business}
          onChange={(value) => {
            setBusinessId(value);
            clearError("business");
          }}
        />
        {pendingSelected ? (
          <div className="rounded-2xl border border-line bg-paper p-3 text-sm" role="status">
            <p className="font-semibold">Tu negocio está pendiente de aprobación.</p>
            <p className="mt-1 text-muted">Cuando sea aprobado vas a poder publicar productos. Mientras tanto podés dejar el borrador listo.</p>
          </div>
        ) : null}
        {formError ? <p className="text-sm font-medium" role="alert">{formError}</p> : null}

        <section className="grid gap-4 rounded-card border border-line bg-foam p-4" aria-labelledby="conex-listing-step-title">
          <div>
            <p className="text-sm text-muted">Paso {stepIndex + 1} de {STEPS.length}</p>
            <h2 id="conex-listing-step-title" className="text-2xl">{step.title}</h2>
            <p className="mt-1 text-sm text-muted">{stepHelp(stepIndex, creating)}</p>
          </div>

          {stepIndex === 0 ? (
            <PhotoStep
              creating={creating}
              archived={archived}
              images={images}
              readyCount={readyImages.length}
              storage={options?.storage}
              onUpload={upload}
              onReload={() => void reload().catch((error: unknown) => setFormError(friendlyError(error)))}
            />
          ) : null}

          {stepIndex === 0 ? (
            <div className="grid gap-4">
              <Field id="conex-listing-name" label="Nombre del producto" hint="Es el nombre que verán los compradores." error={errors.name}>
                {({ id, describedBy, invalid }) => (
                  <input
                    id={id}
                    name="name"
                    required
                    maxLength={140}
                    value={name}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    placeholder="iPhone 13 128 GB"
                    onChange={(event) => {
                      setName(event.target.value);
                      clearError("name");
                    }}
                    className={control}
                  />
                )}
              </Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field id="conex-listing-brand" label="Marca" optional hint="Ejemplo: Samsung, Apple, Bosch. Si no aplica, podés dejarlo vacío.">
                  {({ id, describedBy }) => (
                    <input id={id} name="brand" maxLength={80} value={brand} aria-describedby={describedBy} onChange={(event) => setBrand(event.target.value)} placeholder="Apple" className={control} />
                  )}
                </Field>
                <Field id="conex-listing-model" label="Modelo" optional hint="Opcional. Ejemplo: 128 GB o GSR 120.">
                  {({ id, describedBy }) => (
                    <input id={id} name="model" maxLength={80} value={model} aria-describedby={describedBy} onChange={(event) => setModel(event.target.value)} placeholder="A2633" className={control} />
                  )}
                </Field>
                <Field id="conex-listing-sku" label="Código interno" optional hint="Opcional. Es un código para vos. Si lo completás, el comprador también puede verlo.">
                  {({ id, describedBy }) => (
                    <input id={id} name="sku" maxLength={64} value={sku} aria-describedby={describedBy} onChange={(event) => setSku(event.target.value)} placeholder="CEL-13-128" className={control} />
                  )}
                </Field>
              </div>
              <Field id="conex-listing-description" label="Descripción del producto" optional hint="Contá qué incluye, características importantes, estado y cualquier detalle que ayude al comprador a decidir.">
                {({ id, describedBy }) => (
                  <textarea
                    id={id}
                    name="description"
                    maxLength={4000}
                    value={description}
                    aria-describedby={describedBy}
                    placeholder="iPhone 13 sellado, 128 GB, color negro. Incluye caja y accesorios originales."
                    onChange={(event) => setDescription(event.target.value)}
                    className="min-h-28 w-full rounded-2xl border border-line bg-foam px-3 py-2 text-base"
                  />
                )}
              </Field>
            </div>
          ) : null}

          {stepIndex === 1 ? (
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field id="conex-listing-price" label="Precio" hint="Precio por unidad. 125000 significa $ 125.000." error={errors.price}>
                  {({ id, describedBy, invalid }) => (
                    <div className="flex min-h-11 items-center rounded-2xl border border-line bg-foam px-3">
                      <span aria-hidden="true" className="text-sm font-semibold">$</span>
                      <input
                        id={id}
                        name="price"
                        required
                        inputMode="decimal"
                        value={price}
                        aria-describedby={describedBy}
                        aria-invalid={invalid}
                        placeholder="125000"
                        onChange={(event) => {
                          setPrice(event.target.value);
                          clearError("price");
                        }}
                        className="min-h-11 w-full bg-transparent px-2 text-base outline-none"
                      />
                    </div>
                  )}
                </Field>
                <Field id="conex-listing-unit" label="Unidad" hint="Cómo se vende. Por ejemplo: unidad, kg, metro, litro o caja." error={errors.unit}>
                  {({ id, describedBy, invalid }) => (
                    <>
                      <input
                        id={id}
                        name="unit"
                        required
                        maxLength={40}
                        list="conex-listing-units"
                        value={unit}
                        aria-describedby={describedBy}
                        aria-invalid={invalid}
                        onChange={(event) => {
                          setUnit(event.target.value);
                          clearError("unit");
                        }}
                        className={control}
                      />
                      <datalist id="conex-listing-units">
                        <option value="unidad" />
                        <option value="kg" />
                        <option value="metro" />
                        <option value="litro" />
                        <option value="caja" />
                      </datalist>
                    </>
                  )}
                </Field>
              </div>
              {priceCents ? <p className="text-sm">El comprador va a ver {formatArs(priceCents)} por {unit.trim() || "unidad"}.</p> : null}
              <Field id="conex-listing-stock" label="Stock disponible" hint="Cantidad disponible para vender. Si es 0, el producto no se puede publicar." error={errors.stock}>
                {({ id, describedBy, invalid }) => (
                  <input
                    id={id}
                    name="stock"
                    required
                    inputMode="numeric"
                    min={0}
                    value={stock}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    placeholder="0"
                    onChange={(event) => {
                      setStock(event.target.value);
                      clearError("stock");
                    }}
                    className={control}
                  />
                )}
              </Field>
            </div>
          ) : null}

          {stepIndex === 2 ? (
            <div className="grid gap-4">
              <p className="text-sm text-muted">Elegí retiro, envío o los dos. Para publicar hace falta al menos uno.</p>
              <fieldset className="grid gap-3">
                <legend className="text-sm font-semibold">Cómo lo recibe el comprador</legend>
                <label htmlFor="conex-listing-pickup" className="flex min-h-11 items-start gap-3 text-sm">
                  <input
                    id="conex-listing-pickup"
                    name="pickup"
                    type="checkbox"
                    className="mt-1 size-4"
                    checked={pickup}
                    onChange={(event) => {
                      setPickup(event.target.checked);
                      clearError("delivery");
                    }}
                  />
                  <span>
                    <span className="font-semibold">Retiro en el local</span>
                    <span id="conex-listing-pickup-hint" className="mt-1 block text-muted">El comprador retira el producto en tu negocio.</span>
                  </span>
                </label>
                <label htmlFor="conex-listing-delivery" className="flex min-h-11 items-start gap-3 text-sm">
                  <input
                    id="conex-listing-delivery"
                    name="delivery"
                    type="checkbox"
                    className="mt-1 size-4"
                    checked={delivery}
                    aria-describedby="conex-listing-delivery-hint"
                    onChange={(event) => {
                      setDelivery(event.target.checked);
                      clearError("delivery");
                    }}
                  />
                  <span>
                    <span className="font-semibold">Envío</span>
                    <span id="conex-listing-delivery-hint" className="mt-1 block text-muted">Activá esta opción si entregás el producto a domicilio.</span>
                  </span>
                </label>
                {errors.delivery ? <p id="conex-listing-delivery-error" role="alert" className="text-sm font-medium">{errors.delivery}</p> : null}
              </fieldset>
              {delivery ? (
                <Field id="conex-listing-shipping" label="Costo de envío" hint="Indicá cuánto cuesta el envío, en pesos. Si no se cobra, escribí 0." error={errors.shipping}>
                  {({ id, describedBy, invalid }) => (
                    <div className="flex min-h-11 items-center rounded-2xl border border-line bg-foam px-3">
                      <span aria-hidden="true" className="text-sm font-semibold">$</span>
                      <input
                        id={id}
                        name="shipping"
                        inputMode="decimal"
                        value={shipping}
                        aria-describedby={describedBy}
                        aria-invalid={invalid}
                        placeholder="0"
                        onChange={(event) => {
                          setShipping(event.target.value);
                          clearError("shipping");
                        }}
                        className="min-h-11 w-full bg-transparent px-2 text-base outline-none"
                      />
                    </div>
                  )}
                </Field>
              ) : null}
              <Field id="conex-listing-hours" label="Tiempo estimado" hint="Horas hasta tener el producto listo. Por ejemplo, 48 son dos días. El comprador ve este número." error={errors.hours}>
                {({ id, describedBy, invalid }) => (
                  <div className="flex min-h-11 items-center gap-2 rounded-2xl border border-line bg-foam px-3">
                    <input
                      id={id}
                      name="hours"
                      required
                      inputMode="numeric"
                      min={0}
                      max={2160}
                      value={hours}
                      aria-describedby={describedBy}
                      aria-invalid={invalid}
                      placeholder="48"
                      onChange={(event) => {
                        setHours(event.target.value);
                        clearError("hours");
                      }}
                      className="min-h-11 w-full bg-transparent text-base outline-none"
                    />
                    <span className="text-sm text-muted">horas</span>
                  </div>
                )}
              </Field>
              <fieldset className="grid gap-3">
                <legend className="text-sm font-semibold">Medios de pago de este producto</legend>
                <label className="flex min-h-11 items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 size-4"
                    checked={inheritPayments}
                    onChange={(event) => {
                      const on = event.target.checked;
                      setInheritPayments(on);
                      if (!on && productMethods.length === 0) setProductMethods(selected?.paymentMethods ?? []);
                    }}
                  />
                  <span>
                    <span className="font-semibold">Usar medios de pago de mi negocio</span>
                    <span className="mt-1 block text-muted">Si lo dejás así, no tenés que repetirlos en cada producto.</span>
                  </span>
                </label>
                {inheritPayments ? (
                  <div>
                    <PaymentMethodChips codes={selected?.paymentMethods ?? []} />
                    <p className="mt-2 text-sm text-muted">
                      El comprador va a ver solo estos. CONEX no verifica que puedas cobrar con cada uno.
                    </p>
                  </div>
                ) : (
                  <PaymentMethodToggles selected={productMethods} onChange={setProductMethods} />
                )}
              </fieldset>
            </div>
          ) : null}

          {stepIndex === 0 ? (
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Categoría</h3>
              {optionsError ? <p className="text-sm" role="alert">{optionsError}</p> : null}
              <Field id="conex-listing-category" label="Categoría" hint="Elegí dónde se encuentra tu producto. Si hay subcategorías, elegí la más específica." error={errors.category}>
                {({ id, describedBy, invalid }) => (
                  <ConexSelect
                    id={id}
                    name="category"
                    required
                    value={categoryId}
                    describedBy={describedBy}
                    invalid={invalid}
                    placeholder="Elegir categoría"
                    onChange={(next) => {
                      setCategoryId(next);
                      clearError("category");
                    }}
                    options={[
                      { value: "", label: "Elegir categoría" },
                      ...categoryGroups(options?.categories ?? []).flatMap((group) =>
                        group.items.map((category) => ({
                          value: category.id,
                          label: category.name,
                          group: group.parent,
                          icon: <CategoryGlyph slug={category.slug} icon={category.icon} parentIcon={category.parent_icon} />,
                        })),
                      ),
                    ]}
                  />
                )}
              </Field>
              {options && options.standards.length > 0 ? (
                <Field id="conex-listing-standard" label="Comparar con otros productos" optional hint="Opcional. Si lo vinculás a una referencia existente, se puede mostrar junto a otros que eligieron la misma. Si no corresponde, dejá “No comparar”.">
                  {({ id, describedBy }) => (
                    <ConexSelect
                      id={id}
                      name="standard"
                      value={standardProductId}
                      describedBy={describedBy}
                      placeholder="No comparar"
                      onChange={setStandardProductId}
                      options={[
                        { value: "", label: "No comparar" },
                        ...options.standards.map((standard) => ({ value: standard.id, label: `${standard.name} (${standard.unit})` })),
                      ]}
                    />
                  )}
                </Field>
              ) : null}
            </div>
          ) : null}

          {stepIndex === 3 ? (
            <BuyerPreview
              images={readyImages}
              name={name}
              brand={brand}
              model={model}
              sku={sku}
              category={categoryLabel}
              priceCents={priceCents}
              unit={unit}
              stock={/^\d+$/.test(stock) ? Number(stock) : null}
              pickup={pickup}
              delivery={delivery}
              shipping={delivery ? (parseArsToCents(shipping) ?? (shipping.trim() === "0" ? 0 : null)) : null}
              hours={/^\d+$/.test(hours) ? Number(hours) : null}
              description={description}
              business={selected}
              paymentMethods={inheritPayments ? (selected?.paymentMethods ?? []) : productMethods}
            />
          ) : null}

          {stepIndex === 3 ? (
            <div className="grid gap-3 text-sm">
              {status === "published" ? (
                <div className="rounded-2xl border border-line bg-paper p-3">
                  <p className="font-semibold">Tu producto está publicado</p>
                  <p className="mt-1 text-muted">Los compradores ya pueden encontrarlo.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to="/producto/$productId" params={{ productId: listingId }} className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper">
                      Ver producto
                    </Link>
                    <Link to="/panel/productos/$listingId" params={{ listingId: "nuevo" }} className="inline-flex min-h-11 items-center rounded-full border border-ink px-4 text-sm font-semibold">
                      Publicar otro producto
                    </Link>
                    <Link to="/panel" className="inline-flex min-h-11 items-center text-sm font-semibold text-olive">
                      Ir a mi negocio
                    </Link>
                  </div>
                </div>
              ) : null}
              <dl className="grid gap-2">
                <Summary term="Producto" value={name.trim() || "Sin nombre"} />
                <Summary term="Precio" value={priceCents ? `${formatArs(priceCents)} / ${unit.trim() || "unidad"}` : "Sin precio"} />
                <Summary term="Stock" value={/^\d+$/.test(stock) ? `${stock} ${unit.trim() || "unidad"}` : "Sin indicar"} />
                <Summary term="Categoría" value={categoryLabel || "Sin categoría"} />
                <Summary term="Entrega" value={deliverySentence(pickup, delivery, delivery ? parseArsToCents(shipping) ?? (shipping.trim() === "0" ? 0 : null) : null, /^\d+$/.test(hours) ? Number(hours) : null)} />
                <Summary term="Medios de pago" value={paymentSummary(inheritPayments, selected?.paymentMethods ?? [], productMethods)} />
                <Summary term="Negocio" value={selected ? `${selected.trade_name}${pendingSelected ? " · pendiente de aprobación" : ""}` : "Sin negocio"} />
                {standardLabel ? <Summary term="Comparación" value={standardLabel} /> : null}
              </dl>
              {!creating && !archived ? (
                <div className="flex flex-wrap gap-2 border-t border-line pt-3">
                  {status === "published" || status === "out_of_stock" ? (
                    <button type="button" className="min-h-11 rounded-full border border-ink px-4" onClick={() => void setListingStatus({ data: { listingId, action: "pause" } }).then(() => reload())}>Pausar</button>
                  ) : null}
                  {status === "paused" ? (
                    <button type="button" className="min-h-11 rounded-full border border-ink px-4" onClick={() => void setListingStatus({ data: { listingId, action: "reactivate" } }).then(() => reload()).catch((error: unknown) => setFormError(friendlyError(error)))}>Reactivar</button>
                  ) : null}
                  <button
                    type="button"
                    className="cx-danger min-h-11 rounded-full border border-line px-4"
                    onClick={() => {
                      if (!window.confirm("¿Querés eliminar este producto? Si tiene historial de consultas o compras, se archiva para no perderlo.")) return;
                      void removeListing({ data: listingId })
                        .then(async (result) => {
                          toast.message(result.message);
                          if (result.deleted) await navigate({ to: "/panel/productos" });
                          else await reload();
                        })
                        .catch((error: unknown) => setFormError(friendlyError(error)));
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {step.next ? (
              <button type="button" className="min-h-11 rounded-full bg-ember px-4 text-sm font-semibold text-ink" onClick={continueStep}>
                {step.next}
              </button>
            ) : null}
            <button className="min-h-11 rounded-full border border-ink px-4 text-sm font-semibold" disabled={archived}>
              Guardar borrador
            </button>
            {!creating && stepIndex === 3 ? (
              <button type="button" className="min-h-11 rounded-full bg-ember px-4 text-sm font-semibold text-ink" disabled={archived} onClick={() => void save(true)}>
                Publicar producto
              </button>
            ) : null}
          </div>
          {creating && stepIndex === 3 ? (
            <p className="text-sm text-muted">Primero guardá el borrador y subí al menos una foto en el paso Producto. Después vas a poder publicarlo desde acá.</p>
          ) : null}
        </section>
      </form>
    </Shell>
  );
}

function BusinessBlock({
  businesses,
  businessId,
  creating,
  error,
  onChange,
}: {
  businesses: Business[];
  businessId: string;
  creating: boolean;
  error?: string;
  onChange: (value: string) => void;
}) {
  const selected = businesses.find((business) => business.id === businessId) ?? businesses[0];
  if (!creating && selected) {
    return (
      <div>
        <p className="text-sm font-semibold">Negocio</p>
        <p id="conex-listing-business-note" className="mt-1 text-sm">Este producto se publicará en: {selected.trade_name}</p>
      </div>
    );
  }
  if (businesses.length === 1 && selected) {
    return (
      <div>
        <p className="text-sm font-semibold">Negocio</p>
        <p id="conex-listing-business-note" className="mt-1 text-sm">Este producto se publicará en: {selected.trade_name}</p>
        <p className="mt-1 text-sm text-muted">Es el único negocio disponible en tu cuenta.</p>
        {error ? <p role="alert" className="mt-1 text-sm font-medium">{error}</p> : null}
      </div>
    );
  }
  return (
    <Field id="conex-listing-business" label="Negocio" hint="Elegí el negocio desde el que vas a publicar este producto." error={error}>
      {({ id, describedBy, invalid }) => (
        <ConexSelect
          id={id}
          name="business"
          required
          value={businessId}
          describedBy={describedBy}
          invalid={invalid}
          placeholder="Elegí un negocio"
          onChange={onChange}
          options={[
            { value: "", label: "Elegí un negocio" },
            ...businesses.map((business) => ({
              value: business.id,
              label: `${business.trade_name} · ${businessStatusLabel(business.status)}`,
            })),
          ]}
        />
      )}
    </Field>
  );
}

function PhotoStep({
  creating,
  archived,
  images,
  readyCount,
  onUpload,
  onReload,
}: {
  creating: boolean;
  archived: boolean;
  images: ListingImage[];
  readyCount: number;
  storage: Options["storage"] | undefined;
  onUpload: (file: File) => Promise<void>;
  onReload: () => void;
}) {
  const full = images.length >= 8;
  return (
    <div className="grid gap-3">
      <p className="text-sm font-semibold">Fotos del producto</p>
      <p className="text-sm text-muted">Agregá hasta 8 fotos. La primera será la principal. JPEG, PNG o WebP, hasta 4 MB cada una.</p>
      <p className="text-sm text-muted">{readyCount > 0 ? `Fotos listas: ${readyCount}.` : "Hace falta al menos una foto para publicar. Podés guardar el borrador sin fotos."}</p>
      {creating ? (
        <p className="rounded-2xl bg-paper p-3 text-sm">Las fotos se suben cuando el borrador ya está guardado. Completá los datos y usá Guardar borrador. Después vas a volver a este paso.</p>
      ) : archived ? (
        <p className="text-sm">Un producto archivado no se edita.</p>
      ) : (
        <>
          <label
            htmlFor="conex-listing-photos"
            className="grid min-h-28 place-items-center rounded-2xl border border-dashed border-line bg-paper px-3 py-4 text-center text-sm"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (full) return;
              const files = [...event.dataTransfer.files];
              void Promise.all(files.map((file) => onUpload(file))).catch((error: unknown) => toast.error(friendlyError(error)));
            }}
          >
            <span className="font-semibold">Fotos del producto</span>
            <span className="mt-1 text-muted">{full ? "Llegaste al máximo de 8 fotos." : "Arrastrá fotos o elegilas del teléfono."}</span>
            <input
              id="conex-listing-photos"
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg"
              multiple
              capture="environment"
              disabled={full}
              className="mt-2 max-w-full text-sm"
              onChange={(event) => {
                const files = [...(event.target.files ?? [])];
                event.target.value = "";
                void Promise.all(files.map((file) => onUpload(file))).catch((error: unknown) => toast.error(friendlyError(error)));
              }}
            />
          </label>
          <ul className="grid gap-2">
            {images.map((image) => (
              <li key={image.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-line p-2">
                {image.url ? <img src={image.url} alt="" className="h-16 w-16 rounded-xl object-cover" /> : <span className="text-sm">Pendiente</span>}
                <span className="text-sm">{image.isPrimary ? "Foto principal" : image.status === "ready" ? "Lista" : "Pendiente"}</span>
                {image.status === "ready" && !image.isPrimary ? (
                  <button type="button" className="min-h-10 rounded-full border border-line px-3" onClick={() => void setPrimaryImage({ data: image.id }).then(onReload)}>Hacer principal</button>
                ) : null}
                <button type="button" className="min-h-10 rounded-full border border-line px-3" onClick={() => void moveListingImage({ data: { imageId: image.id, direction: "up" } }).then(onReload)}>Mover arriba</button>
                <button type="button" className="min-h-10 rounded-full border border-line px-3" onClick={() => void moveListingImage({ data: { imageId: image.id, direction: "down" } }).then(onReload)}>Mover abajo</button>
                <button type="button" className="cx-danger min-h-10 rounded-full border border-line px-3" onClick={() => void deleteListingImage({ data: image.id }).then(onReload).catch((error: unknown) => toast.error(friendlyError(error)))}>Quitar</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function BuyerPreview({
  images,
  name,
  brand,
  model,
  sku,
  category,
  priceCents,
  unit,
  stock,
  pickup,
  delivery,
  shipping,
  hours,
  description,
  business,
  paymentMethods,
}: {
  images: ListingImage[];
  name: string;
  brand: string;
  model: string;
  sku: string;
  category: string;
  priceCents: number | null;
  unit: string;
  stock: number | null;
  pickup: boolean;
  delivery: boolean;
  shipping: number | null;
  hours: number | null;
  description: string;
  business: Business | null;
  paymentMethods: string[];
}) {
  const meta = [brand.trim(), model.trim(), sku.trim() ? `SKU ${sku.trim()}` : ""].filter(Boolean).join(" · ");
  const photo = images.find((image) => image.isPrimary)?.url ?? images[0]?.url ?? null;
  return (
    <article className="grid gap-4 md:grid-cols-2">
      {photo ? (
        <img src={photo} alt={name || "Foto del producto"} className="aspect-square w-full rounded-2xl object-cover" />
      ) : (
        <div className="grid aspect-square place-items-center rounded-2xl bg-paper px-4 text-center text-sm text-muted">Todavía no hay fotos.</div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-muted">{category || "Sin categoría"}</p>
        <h3 className="mt-1 text-2xl">{name.trim() || "Sin nombre"}</h3>
        {meta ? <p className="mt-2 text-sm text-muted">{meta}</p> : null}
        <p className="mt-3 font-display text-3xl">{priceCents ? formatArs(priceCents) : "Sin precio"}{unit.trim() ? <span className="ml-2 text-base text-muted">/ {unit.trim()}</span> : null}</p>
        <p className="mt-2 text-sm">{stock !== null && stock > 0 ? `En stock · ${stock} ${unit.trim() || "unidad"}` : "Sin stock"}</p>
        <p className="mt-1 text-sm text-muted">{deliverySentence(pickup, delivery, shipping, hours)}</p>
        <div className="mt-3">
          <p className="text-sm font-semibold">
            {paymentMethods.length > 0 ? "Medios de pago aceptados por el proveedor" : "Medios de pago"}
          </p>
          <div className="mt-2">
            <PaymentMethodChips codes={paymentMethods} />
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold">{business?.trade_name ?? "Sin negocio"}</p>
        <p className="text-sm text-muted">{publicPlace(business)}</p>
        <h4 className="mt-4 text-base font-semibold">Descripción</h4>
        <p className="mt-1 text-sm whitespace-pre-wrap">{description.trim() || "Sin descripción."}</p>
      </div>
    </article>
  );
}

function Field({
  id,
  label,
  hint,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="grid min-w-0 gap-1">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {optional ? <span className="font-normal text-muted"> (opcional)</span> : null}
      </label>
      {hint ? <p id={hintId} className="text-sm text-muted">{hint}</p> : null}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? <p id={errorId} role="alert" className="text-sm font-medium">{error}</p> : null}
    </div>
  );
}

function paymentSummary(inherit: boolean, businessMethods: string[], productMethods: string[]): string {
  const codes = inherit ? businessMethods : productMethods;
  if (codes.length === 0) return inherit ? "El negocio no declaró medios" : "Ninguno en este producto";
  const names = codes.map((code) => paymentMethodByCode(code)?.name).filter((name): name is string => Boolean(name));
  if (names.length === 0) return inherit ? "El negocio no declaró medios" : "Ninguno en este producto";
  return inherit ? `Los del negocio: ${names.join(", ")}` : names.join(", ");
}

function Summary({ term, value }: { term: string; value: string }) {
  return (
    <div className="grid gap-0.5 border-b border-line py-2 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-3">
      <dt className="font-semibold">{term}</dt>
      <dd className="min-w-0 break-words">{value}</dd>
    </div>
  );
}

function stepHelp(step: number, creating: boolean): string {
  if (step === 0) {
    return creating
      ? "Fotos, datos y categoría. En un producto nuevo, guardá el borrador antes de subir fotos. La primera foto será la principal."
      : "Fotos, nombre, descripción y categoría. La primera foto será la principal.";
  }
  if (step === 1) return "El precio es por unidad. El stock es la cantidad disponible para vender.";
  if (step === 2) return "Elegí retiro, envío o los dos. El costo de envío aparece solo si ofrecés envío.";
  return "Revisá cómo lo van a ver los compradores. Si algo no cierra, volvé al paso correspondiente.";
}

function deliverySentence(pickup: boolean, delivery: boolean, shipping: number | null, hours: number | null): string {
  const mode = delivery && pickup ? "Entrega y retiro." : delivery ? "Solo entrega." : pickup ? "Solo retiro." : "Sin entrega ni retiro.";
  const cost = delivery && shipping !== null ? ` Envío: ${formatArs(shipping)}.` : "";
  const lead = hours !== null ? ` Plazo: ${hours} horas.` : "";
  return `${mode}${cost}${lead}`;
}

function publicPlace(business: Business | null): string {
  if (!business) return "Rosario";
  if (business.location_visibility === "approximate") {
    return [business.neighborhood, "ubicación aproximada"].filter((part) => part && part.trim()).join(" · ") || "Ubicación aproximada";
  }
  return [business.address_line, business.neighborhood, "Rosario"].filter((part) => part && part.trim()).join(" · ");
}

function categoryGroups(categories: Options["categories"]): Array<{ parent: string; items: Options["categories"] }> {
  const groups: Array<{ parent: string; items: Options["categories"] }> = [];
  for (const category of categories) {
    const last = groups[groups.length - 1];
    if (!last || last.parent !== category.parent_name) groups.push({ parent: category.parent_name, items: [category] });
    else last.items.push(category);
  }
  return groups;
}

function categoryLabelOf(options: Options | null, categoryId: string): string {
  const category = options?.categories.find((item) => item.id === categoryId);
  if (!category) return "";
  return `${category.parent_name} → ${category.name}`;
}

function canUseBusiness(business: Business): boolean {
  return !isDemo(business) && business.status !== "suspended";
}

function isDemo(business: Business): boolean {
  const value = business.is_demo as boolean | string | number | undefined;
  return value === true || value === "t" || value === 1;
}

function businessStatusLabel(status: string): string {
  if (status === "active") return "Aprobado";
  if (status === "pending_review") return "Pendiente de aprobación";
  if (status === "suspended") return "Suspendido";
  return status;
}

function statusLabel(status: string): string {
  if (status === "draft") return "borrador";
  if (status === "published") return "publicado";
  if (status === "paused") return "pausado";
  if (status === "out_of_stock") return "sin stock";
  if (status === "archived") return "archivado";
  return status;
}

function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : "No se pudo guardar.";
  if (message === "Elegí el negocio.") return "Elegí un negocio antes de continuar.";
  if (message.includes("tiene que estar aprobado")) {
    return "Tu negocio está pendiente de aprobación. Cuando sea aprobado vas a poder publicar productos.";
  }
  if (message === "No podés cargar productos en un negocio que no es tuyo.") {
    return "No encontramos un negocio disponible para publicar. Creá tu negocio o esperá a que sea aprobado.";
  }
  return message;
}

function centsToInput(cents: number): string {
  const whole = Math.trunc(cents / 100);
  const frac = Math.abs(cents % 100);
  if (frac === 0) return String(whole);
  return `${whole},${String(frac).padStart(2, "0")}`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const value = String(reader.result ?? "");
      const encoded = value.split(",")[1];
      if (!encoded) reject(new Error("No se pudo leer la imagen."));
      else resolve(encoded);
    };
    reader.readAsDataURL(file);
  });
}
