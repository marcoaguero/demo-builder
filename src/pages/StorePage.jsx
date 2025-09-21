import React from "react";
import { useFastSpring } from "../context/FastSpringContext";

const productPathOf = (it) =>
  it?.path || it?.product || it?.sku || it?.id || it?.code || "";

const nameOf = (it) =>
  it?.display || it?.name || it?.product || it?.path || "Product";
const priceOf = (it) => it?.price || it?.pricing?.price || "";

const imgSrcOf = (it) =>
  it?.image ||
  it?.imageUrl ||
  it?.imageURL ||
  (Array.isArray(it?.images) ? it.images[0] : "") ||
  "";

function readableText(hex = "#000000") {
  const c = (hex || "#000000").replace("#", "");
  const r = parseInt(c.substring(0, 2) || "00", 16);
  const g = parseInt(c.substring(2, 4) || "00", 16);
  const b = parseInt(c.substring(4, 6) || "00", 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

// tiny SVG fallback if an image fails to load
const FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
       <rect width="100%" height="100%" fill="#f1f5f9"/>
       <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
             font-size="14" fill="#64748b" font-family="Inter, system-ui, sans-serif">
         No image
       </text>
     </svg>`
  );

export default function StorePage({ onBack }) {
  const {
    products,
    theme,
    industry,
    companyName,
    logoSrc,
    palette,
    buyNow,
    addToCart,
    checkout,
  } = useFastSpring();

  const navBg = palette.nav || theme.nav;
  const navFg = readableText(navBg);
  const title = companyName?.trim() || `${industry.toUpperCase()} STORE`;

  return (
    <div
      style={{
        background: palette.background || theme.background,
        color: palette.text || theme.text,
      }}
    >
      {/* Header */}
      <header
        className="w-full border-b"
        style={{
          background: navBg,
          borderColor: `${theme.primary}20`,
          color: navFg,
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              // If logo is present, show ONLY the logo (hide the text title)
              <img
                src={logoSrc}
                alt="logo"
                className="h-10 w-auto object-contain"
              />
            ) : (
              // Fallback: no logo → show branded initial + title
              <>
                <div
                  className="h-8 w-8 rounded-lg grid place-items-center font-bold"
                  style={{
                    background: palette.accent || theme.accent,
                    color: "#fff",
                  }}
                >
                  {title.slice(0, 1).toUpperCase()}
                </div>
                <span className="font-semibold" style={{ color: navFg }}>
                  {title}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-sm px-3 py-1 rounded border"
              style={{ borderColor: navFg, color: navFg }}
              onClick={onBack}
            >
              ← Back to builder
            </button>
            <button
              className="text-sm px-3 py-1 rounded"
              style={{
                background: palette.accent || theme.accent,
                color: "#fff",
              }}
              onClick={checkout}
            >
              Checkout
            </button>
          </div>
        </div>
      </header>

      {/* Offers */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1
          className="text-3xl md:text-4xl font-extrabold text-center"
          style={{ color: theme.primary }}
        >
          WEBSTORE
        </h1>

        {products?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {products.map((p, i) => {
              const pPath = productPathOf(p);
              const img = imgSrcOf(p);
              return (
                <div
                  key={i}
                  className="rounded-2xl border p-4 flex flex-col gap-3 hover:shadow-md transition"
                >
                  {/* aspect box for image */}
                  <div
                    className="relative w-full overflow-hidden rounded-xl"
                    style={{ paddingTop: "75%" /* 4:3 ratio */ }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={nameOf(p)}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-contain bg-gray-50"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_SVG;
                        }}
                      />
                    ) : (
                      <img
                        src={FALLBACK_SVG}
                        alt="no image"
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{nameOf(p)}</div>
                      <div className="text-sm opacity-70">{priceOf(p)}</div>
                      <div className="text-[11px] opacity-60">
                        path: {pPath || "—"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                        style={{
                          background: palette.accent || theme.accent,
                          color: "#fff",
                        }}
                        disabled={!pPath}
                        onClick={() => buyNow(pPath)}
                      >
                        Buy now
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg text-sm border disabled:opacity-50"
                        disabled={!pPath}
                        onClick={() => addToCart(pPath)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
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
