// src/layouts/LayoutGaming.jsx
import React from "react";
import { useFastSpring } from "../context/FastSpringContext";
import FeaturedBanner from "../components/FeaturedBanner";

/* ---------- tiny helpers (only for cards) ---------- */
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

/* ---------- icons ---------- */
function CartIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4h2l1 3m0 0l1.2 4.5A2 2 0 0 0 9.14 13h7.72a2 2 0 0 0 1.94-1.5L21 7H6"
      />
      <circle cx="10" cy="19" r="1.6" />
      <circle cx="18" cy="19" r="1.6" />
    </svg>
  );
}

export default function LayoutGaming() {
  const {
    products,
    palette,
    theme,
    companyName,
    logoSrc,
    addToCart,
    checkout,
    showBanner,
    cartQty,
  } = useFastSpring();

  const BG = palette.background || theme.background || "#ffffff";
  const TEXT = palette.text || theme.text || "#0f172a";
  const NAV = palette.nav || theme.nav || "#0f172a";
  const ACC = palette.accent || theme.accent || "#22d3ee";
  const onNAV = readableText(NAV);
  const onACC = readableText(ACC);

  const brand = (companyName || "Gaming Store").toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: BG, color: TEXT }}>
      {/* Header */}
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
              <CartIcon className="h-5 w-5" />
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

      {/* Banner (re-usable, prefers discounted item) */}
      {showBanner && products?.length > 0 && (
        <FeaturedBanner
          items={products}
          surfaceBg={palette.bannerBg} // or omit and set palette.bannerBg
          palette={{ text: TEXT, accent: ACC, bannerBg: palette.bannerBg }}
          labels={{
            heading: "Featured",
            badge: "Seasonal offer",
            note: "Instant delivery",
            buy: "Buy now",
            add: "Add to cart",
          }}
          className="pt-8"
        />
      )}

      {/* Products grid */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-8">
        <h2 className="text-2xl font-extrabold">Offers</h2>

        {products?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {products.map((p, idx) => {
              const path = pathOf(p);
              const title = (nameOf(p) || "").toUpperCase();
              const price = priceOf(p);
              const img = imgOf(p);

              return (
                <article
                  key={idx}
                  className="rounded-2xl border overflow-hidden flex flex-col"
                  style={{ borderColor: "#e5e7eb", background: "#fff" }}
                >
                  <div
                    className="w-full grid place-items-center"
                    style={{ minHeight: 220, background: "#f8fafc" }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={title}
                        className="h-40 w-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-xs opacity-60">No image</div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="text-lg font-extrabold">{title}</div>
                    {price ? (
                      <div className="mt-1 text-sm opacity-80">{price}</div>
                    ) : null}

                    <div className="mt-auto pt-4">
                      <button
                        disabled={!path}
                        onClick={() => addToCart(path)}
                        className="w-full rounded-lg px-4 py-2 font-semibold disabled:opacity-50"
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
          <p className="opacity-70 mt-4">
            No offers returned by this storefront yet.
          </p>
        )}
      </section>
    </div>
  );
}
