import React from "react";
import { useFastSpring } from "../context/FastSpringContext";

function readableText(hex = "#000000") {
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function StorePage({ onBack }) {
  const {
    products,
    theme,
    industry,
    companyName,
    logoSrc,
    openCheckout,
    palette,
  } = useFastSpring();
  const navFg = readableText(palette.nav || theme.nav);

  const title = companyName?.trim() || `${industry.toUpperCase()} STORE`;

  const nameOf = (it) =>
    it?.display || it?.name || it?.product || it?.path || "Product";
  const priceOf = (it) => it?.price || it?.pricing?.price || "";

  return (
    <div
      style={{
        background: palette.background || theme.background,
        color: palette.text || theme.text,
      }}
    >
      <header
        className="w-full border-b"
        style={{
          background: palette.nav || theme.nav,
          borderColor: `${theme.primary}20`,
          color: navFg,
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="logo"
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-lg grid place-items-center font-bold"
                style={{ background: theme.accent, color: "#fff" }}
              >
                {title.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="font-semibold" style={{ color: navFg }}>
              {title}
            </span>
          </div>
          <button
            className="text-sm px-3 py-1 rounded border"
            style={{ borderColor: navFg, color: navFg }}
            onClick={onBack}
          >
            ← Back to builder
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1
          className="text-3xl md:text-4xl font-extrabold"
          style={{ color: theme.primary }}
        >
          Products
        </h1>
        {products?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {products.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border p-4 flex flex-col gap-3 hover:shadow-md transition"
              >
                <div className="aspect-[4/3] w-full rounded-xl bg-gray-100 grid place-items-center text-xs uppercase tracking-wide">
                  Image
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{nameOf(p)}</div>
                    <div className="text-sm opacity-70">{priceOf(p)}</div>
                  </div>
                  <button
                    className="px-3 py-2 rounded-lg text-sm font-semibold"
                    style={{
                      background: palette.accent || theme.accent,
                      color: "#fff",
                    }}
                    onClick={() => openCheckout(p)}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="opacity-70 mt-4">
            No products returned by this storefront yet.
          </p>
        )}
      </section>
    </div>
  );
}
