// src/layouts/LayoutEcommercePlugins.jsx
import React, { useMemo } from "react";
import { useFastSpring } from "../context/FastSpringContext";
import FeaturedBanner from "../components/FeaturedBanner";

/* ---------- helpers ---------- */
const pathOf = (it) => it?.path || it?.product || it?.sku || it?.id || "";
const nameOf = (it) =>
  it?.display || it?.name || it?.product || it?.path || "Product";
const priceOf = (it) =>
  it?.price || it?.priceTotal || it?.unitPrice || it?.pricing?.price || "";
const imgOf = (it) =>
  it?.image ||
  it?.imageUrl ||
  it?.imageURL ||
  (Array.isArray(it?.images) ? it.images[0] : "") ||
  "";

function readableText(hex = "#000000") {
  const h = String(hex || "").replace("#", "");
  const v = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return "#000";
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000" : "#fff";
}

/** Derive discount info from an SBL item */
function discountInfo(p) {
  // numbers
  const percentNum =
    (typeof p?.discountPercentValue === "number" && p.discountPercentValue) ||
    (typeof p?.discount?.data?.percentValue === "number" &&
      p.discount?.data?.percentValue) ||
    (Array.isArray(p?.discountSet) && p.discountSet[0]?.percentValue);

  const hasMoneyOff =
    (typeof p?.unitDiscountValue === "number" && p.unitDiscountValue > 0) ||
    (typeof p?.discountTotalValue === "number" && p.discountTotalValue > 0);

  const onSale = !!(percentNum && percentNum > 0) || hasMoneyOff;

  if (!onSale) return { onSale: false };

  // strings for display
  const percentText =
    (typeof p?.discountPercent === "string" && p.discountPercent) ||
    (percentNum ? `${percentNum}%` : undefined);

  const currentText = p?.total || p?.unitPrice || p?.price || "";
  const originalText = p?.price || p?.unitPrice || currentText || "";

  return {
    onSale: true,
    percentText,
    currentText,
    originalText,
  };
}

/* ---------- dumb search (visual only) ---------- */
function SearchBar({ accent = "#06b6d4" }) {
  const onSubmit = (e) => e.preventDefault();
  return (
    <form onSubmit={onSubmit} className="mt-6 mb-2">
      <div className="flex items-stretch gap-2">
        <div className="flex-1 relative">
          <input
            className="w-full border rounded-lg pl-10 pr-3 py-2"
            placeholder="search plugins..."
            aria-label="search plugins"
          />
          <svg
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3 py-2 rounded-lg text-sm border" title="macOS">
            
          </span>
          <span className="px-3 py-2 rounded-lg text-sm border" title="Windows">
            ⊞
          </span>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg font-semibold"
            style={{ background: accent, color: readableText(accent) }}
            title="Search"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}

/* ---------- layout ---------- */
export default function LayoutEcommercePlugins() {
  const {
    products,
    palette,
    theme,
    companyName,
    logoSrc,
    addToCart,
    checkout,
    cartQty,
    selectSingleAndCheckout,
    showBanner, // set via config hash
  } = useFastSpring();

  // palette
  const BG = palette.background || theme.background || "#ffffff";
  const TEXT = palette.text || theme.text || "#0f172a";
  const NAV = palette.nav || theme.nav || "#0f172a";
  const ACC = palette.accent || theme.accent || "#06b6d4";
  const onNAV = readableText(NAV);
  const onACC = readableText(ACC);

  const brand = (companyName?.trim() || "VSTs Store").toUpperCase();
  const items = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products]
  );

  // Featured banner = first product (respects discounts, only when showBanner)
  const featured = items[0] || null;
  const fPath = featured ? pathOf(featured) : "";
  const fDisc = featured ? discountInfo(featured) : { onSale: false };
  const fName = featured ? nameOf(featured) : "";
  const fPrice = fDisc.onSale
    ? fDisc.currentText
    : featured
    ? priceOf(featured)
    : "";
  const fImg = featured ? imgOf(featured) : "";

  const buyNowHandler = () => {
    if (!fPath) return;
    if (typeof selectSingleAndCheckout === "function") {
      selectSingleAndCheckout(fPath, true);
    } else {
      addToCart(fPath);
      checkout();
    }
  };

  return (
    <div className="min-h-screen" style={{ background: BG, color: TEXT }}>
      {/* NAV */}
      <header className="w-full" style={{ background: NAV, color: onNAV }}>
        <div className="mx-auto max-w-7xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="logo"
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="font-extrabold tracking-wider">{brand}</div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5">
              <div className="h-7 w-7 rounded-full bg-white/30" />
              <div className="hidden sm:block">Your account</div>
            </div>

            <button
              onClick={checkout}
              className="relative inline-flex items-center gap-2 rounded-full px-3 py-2"
              style={{ background: ACC, color: onACC }}
              title="Open checkout"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4h2l1 3m0 0l1.2 4.5A2 2 0 0 0 9.14 13h7.72a2 2 0 0 0 1.94-1.5L21 7H6"
                />
                <circle cx="10" cy="19" r="1.6" />
                <circle cx="18" cy="19" r="1.6" />
              </svg>
              <span className="text-sm font-medium">Checkout</span>
              {cartQty > 0 && (
                <span
                  className="absolute -right-2 -top-2 text-xs font-bold rounded-full px-1.5 py-0.5"
                  style={{
                    background: ACC,
                    color: onACC,
                    border: `2px solid ${NAV}`,
                  }}
                >
                  {cartQty}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* FEATURED BANNER (only when showBanner) */}
      {showBanner && items.length > 0 && (
        <FeaturedBanner
          visible
          items={items} // <- pass the whole array; banner will pick a discounted item first
          preferDiscounted // (default true, could omit)
          onAdd={(path) => addToCart(path)}
          onBuyNow={(path) => {
            if (typeof selectSingleAndCheckout === "function") {
              selectSingleAndCheckout(path, true); // reset -> add(1) -> checkout
            } else {
              addToCart(path);
              checkout();
            }
          }}
          // onlyPrimary   // uncomment if you want a single CTA
          palette={{ background: BG, text: TEXT, accent: ACC }}
          labels={{
            heading: "Featured",
            // banner computes SALE + percent automatically; you can still override note text here:
            note: "Limited-time deal",
            add: "Add to cart",
            buy: "Buy now",
          }}
          className="pt-6"
        />
      )}

      {/* PAGE TITLE + SEARCH */}
      <section className="mx-auto max-w-7xl px-5">
        <div className="mt-2 flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: "#e5e7eb" }} />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
            PLUGINS &amp; EFFECTS
          </h1>
          <div className="h-px flex-1" style={{ background: "#e5e7eb" }} />
        </div>

        <SearchBar accent={ACC} />
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-7xl px-5 pb-10">
        {items.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((p, i) => {
              const path = pathOf(p);
              const title = nameOf(p);
              const img = imgOf(p);
              const basePrice = priceOf(p);
              const disc = discountInfo(p);

              const showNow = disc.onSale ? disc.currentText : basePrice;
              const showWas = disc.onSale
                ? disc.originalText || basePrice
                : null;
              const saleBadge = disc.onSale
                ? disc.percentText
                  ? `SALE ${disc.percentText}`
                  : "SALE"
                : null;

              return (
                <article
                  key={i}
                  className="rounded-2xl border overflow-hidden bg-white flex flex-col"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  {/* TOP: title + sale badge if applicable */}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold leading-snug">{title}</h3>
                      <div className="flex items-center gap-2">
                        {saleBadge && (
                          <span
                            className="text-[11px] font-bold rounded px-2 py-1"
                            style={{ background: "#ef4444", color: "#fff" }}
                          >
                            {saleBadge}
                          </span>
                        )}
                        <div className="text-xl opacity-60">🎛️</div>
                      </div>
                    </div>
                    <div className="text-sm opacity-70 mt-1">
                      Audio plugin for creative mixing and sound design
                    </div>
                  </div>

                  {/* IMAGE */}
                  <div
                    className="w-full grid place-items-center"
                    style={{ background: "#f8fafc", minHeight: 180 }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={title}
                        className="h-28 w-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-xs opacity-60">No image</div>
                    )}
                  </div>

                  {/* BOTTOM BAR */}
                  <div
                    className="p-4 border-t"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <div
                        className="flex items-center gap-2 rounded-lg px-3 py-2"
                        style={{ background: "#16a34a", color: "#fff" }}
                      >
                        <span className="text-xs uppercase opacity-90">
                          Your price
                        </span>
                        <span className="font-extrabold">{showNow || "—"}</span>
                      </div>

                      {showWas && (
                        <span className="line-through text-sm opacity-70">
                          {showWas}
                        </span>
                      )}

                      <button
                        disabled={!path}
                        onClick={() => addToCart(path)}
                        className="ml-auto px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                        style={{ background: ACC, color: onACC }}
                        title="Add to cart"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="opacity-70">
            No products available for this store yet.
          </p>
        )}
      </section>
    </div>
  );
}
