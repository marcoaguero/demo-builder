// src/layouts/LayoutSaaS.jsx
import React, { useMemo, useState } from "react";
import { useFastSpring } from "../context/FastSpringContext";
import FeaturedBanner from "../components/FeaturedBanner";

/* ---------- tiny helpers (self-contained) ---------- */
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
function hexToRgb(hex) {
  const v = hex.replace("#", "");
  const h = v.length === 3 ? [...v].map((c) => c + c).join("") : v;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex({ r, g, b }) {
  const to2 = (n) => Math.round(n).toString(16).padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}
function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h, s, l };
}
function hslToRgb({ h, s, l }) {
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lighten = (hex, p = 0.06) => {
  try {
    const h = rgbToHsl(hexToRgb(hex));
    return rgbToHex(hslToRgb({ ...h, l: clamp01(h.l + p) }));
  } catch {
    return hex;
  }
};
const darken = (hex, p = 0.06) => {
  try {
    const h = rgbToHsl(hexToRgb(hex));
    return rgbToHex(hslToRgb({ ...h, l: clamp01(h.l - p) }));
  } catch {
    return hex;
  }
};

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

/* ---------- layout ---------- */
export default function LayoutSaaS() {
  const {
    products,
    palette,
    theme,
    companyName,
    logoSrc,
    selectSingleAndCheckout, // reset -> add(1) -> checkout
    checkout,
    showBanner,
    cartQty,
  } = useFastSpring();

  // palette
  const BG = palette.background || theme.background || "#ffffff";
  const TEXT = palette.text || theme.text || "#0f172a";
  const NAV = palette.nav || theme.nav || "#0f172a";
  const ACC = palette.accent || theme.accent || "#6366f1";
  const onNAV = readableText(NAV);
  const onACC = readableText(ACC);

  const SURFACE = lighten(BG, 0.02);
  const PANEL = lighten(BG, 0.04);
  const BORDER = darken(BG, 0.08);

  const brand = (companyName || "Your SaaS").toUpperCase();

  // first three products as plans
  const plans = useMemo(
    () => (Array.isArray(products) ? products.slice(0, 3) : []),
    [products]
  );
  const [sel, setSel] = useState(0);
  const selected = plans[sel] || null;

  // 🔒 Banner fixed to first plan (does NOT follow selection)
  const f = plans[0] || null;

  const fPath = f ? pathOf(f) : "";
  const fName = f ? nameOf(f) : "";
  const fPrice = f ? priceOf(f) : "";
  const fImg = f ? imgOf(f) : "";

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
            {/* <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1.5">
              <div className="h-7 w-7 rounded-full bg-white/30" />
              <div className="hidden sm:block">Your account</div>
            </div> */}
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

      {/* Fixed banner (first plan only) */}
      {showBanner && f && (
        <FeaturedBanner
          visible
          onlyPrimary
          name={fName}
          price={fPrice}
          image={fImg}
          onBuyNow={() => selectSingleAndCheckout(fPath, true)}
          palette={{ background: BG, nav: NAV, text: TEXT, accent: ACC }}
          labels={{
            badge: "Limited time",
            note: "Cancel anytime",
            buy: "Start now", // <-- your single CTA text
            // add: (not used)
          }}
          className="pt-8"
        />
      )}

      {/* Heading */}
      <section className="mx-auto max-w-7xl px-5 pt-6 pb-2 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Choose your plan
        </h1>
        <p className="mt-2 opacity-80">Simple pricing. No surprises.</p>
      </section>

      {/* Slider + ticks */}
      <section className="mx-auto max-w-3xl px-5 mt-6">
        <input
          type="range"
          min={0}
          max={Math.max(plans.length - 1, 0)}
          step={1}
          value={sel}
          onChange={(e) => setSel(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: ACC }}
          disabled={!plans.length}
        />
        <div
          className="mt-2 grid text-center"
          style={{
            gridTemplateColumns: `repeat(${Math.max(
              plans.length,
              1
            )}, minmax(0,1fr))`,
          }}
        >
          {plans.length ? (
            plans.map((p, i) => (
              <button
                key={i}
                className="text-xs px-1 py-1 rounded"
                style={{
                  background: i === sel ? lighten(ACC, 0.4) : "transparent",
                  color:
                    i === sel ? readableText(lighten(ACC, 0.4)) : "inherit",
                }}
                onClick={() => setSel(i)}
                title={nameOf(p)}
              >
                <span className={i === sel ? "font-semibold" : "opacity-80"}>
                  {nameOf(p)}
                </span>
              </button>
            ))
          ) : (
            <div className="text-sm opacity-70">
              No plans available for this storefront
            </div>
          )}
        </div>
      </section>

      {/* Cards (content centered, features left) */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(plans.length ? plans : [null, null, null])
            .slice(0, 3)
            .map((p, i) => {
              const active = i === sel && p;
              const title = p
                ? nameOf(p)
                : ["Starter", "Premium", "Enterprise"][i] || "Plan";
              const price = p ? priceOf(p) : "";
              const img = p ? imgOf(p) : "";
              const path = p ? pathOf(p) : "";

              return (
                <article
                  key={i}
                  className="rounded-2xl overflow-hidden flex flex-col cursor-pointer"
                  style={{
                    background: SURFACE,
                    border: `1px solid ${active ? ACC : BORDER}`,
                    boxShadow: active ? `0 0 0 3px ${ACC}20` : "none",
                  }}
                  onClick={() => setSel(i)}
                >
                  <div
                    className="px-4 py-2 text-sm text-center"
                    style={{
                      background: active ? ACC : darken(SURFACE, 0.06),
                      color: readableText(active ? ACC : darken(SURFACE, 0.06)),
                    }}
                  >
                    {active ? "Selected" : "Plan"}
                  </div>

                  <div className="p-6 flex-1 flex flex-col gap-4 items-center">
                    <div
                      className="rounded-lg p-4 w-full grid place-items-center"
                      style={{ background: PANEL }}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={title}
                          className="h-28 w-auto object-contain"
                        />
                      ) : (
                        <div className="text-xs opacity-60">No image</div>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-extrabold">{title}</div>
                      {price ? (
                        <div className="mt-1 text-sm opacity-80">{price}</div>
                      ) : null}
                    </div>

                    <ul className="self-stretch text-sm space-y-1 opacity-90 text-left">
                      <li>✔ Core features</li>
                      <li>✔ Email support</li>
                      <li>{i === 0 ? "—" : "✔"} Team seats</li>
                      <li>{i === 2 ? "✔" : "—"} SSO / Audit logs</li>
                    </ul>

                    <div className="mt-auto w-full">
                      <button
                        disabled={!path || !active}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectSingleAndCheckout(path, true);
                        }}
                        className="w-full rounded-lg px-4 py-2 font-semibold disabled:opacity-50"
                        style={{ background: ACC, color: onACC }}
                        title={
                          active ? "Select plan" : "Activate this card first"
                        }
                      >
                        Select plan
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </section>
    </div>
  );
}
