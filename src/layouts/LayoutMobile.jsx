import React from "react";
import { useFastSpring } from "../context/FastSpringContext";

export default function LayoutMobile() {
  const { products, palette, theme, buyNow, addToCart, companyName, logoSrc } =
    useFastSpring();
  return (
    <div style={{ background: palette.background || theme.background }}>
      <header className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-3">
        {logoSrc && <img src={logoSrc} alt="logo" className="h-8 w-auto" />}
        <h1 className="text-2xl font-bold">{companyName || "Mobile Apps"}</h1>
      </header>
      <section className="mx-auto max-w-6xl px-4 pb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products?.map((p, i) => {
          const path = p?.path || p?.product || p?.sku;
          return (
            <div key={i} className="rounded-2xl border p-3 flex flex-col gap-2">
              {p?.image && (
                <img
                  src={p.image}
                  alt={p.display || path}
                  className="h-24 object-contain mx-auto"
                />
              )}
              <div className="text-sm font-medium line-clamp-2">
                {p?.display || path}
              </div>
              <div className="mt-auto flex gap-2">
                <button
                  className="px-3 py-1 rounded text-sm"
                  style={{ background: palette.accent, color: "#fff" }}
                  onClick={() => buyNow(path)}
                >
                  Buy
                </button>
                <button
                  className="px-3 py-1 rounded text-sm border"
                  onClick={() => addToCart(path)}
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
