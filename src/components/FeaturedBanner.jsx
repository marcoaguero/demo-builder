// src/components/FeaturedBanner.jsx
import React, { useMemo } from "react";
import useFsActions from "../hooks/useFsActions";
import {
  pathOf,
  nameOf,
  imgOf,
  priceOf,
  discountInfo,
  pickFeatured,
} from "../utils/fsItem";

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

/**
 * FeaturedBanner
 * Props:
 *  - items?: array of SBL items (preferred) → banner picks discounted item first
 *  - item?: single item
 *  - preferDiscounted?: boolean (default true)
 *  - onAdd?: (path) => void   // optional override; if omitted uses shared actions
 *  - onBuyNow?: (path) => void
 *  - onlyPrimary?: boolean
 *  - surfaceBg?: string  // explicit card background color
 *  - palette?: { text?, accent?, bannerBg? } // palette.bannerBg used if surfaceBg not provided
 *  - labels?: { heading?, badge?, note?, add?, buy? }
 */
export default function FeaturedBanner({
  visible = true,
  items,
  item,
  preferDiscounted = true,
  onAdd,
  onBuyNow,
  onlyPrimary = false,
  surfaceBg, // NEW
  palette = { text: "#0f172a", accent: "#06b6d4", bannerBg: undefined },
  labels = {},
  className = "",
}) {
  const actions = useFsActions();

  const {
    pickedItem,
    disc,
    pickedPath,
    pickedName,
    pickedImage,
    pickedPrice,
    badgeText,
  } = useMemo(() => {
    const chosen = item
      ? { item, disc: discountInfo(item) }
      : pickFeatured(items, preferDiscounted);

    const it = chosen.item;
    if (!it) {
      return {
        pickedItem: null,
        disc: { onSale: false },
        pickedPath: "",
        pickedName: "",
        pickedImage: "",
        pickedPrice: "",
        badgeText: "",
      };
    }

    const path = pathOf(it);
    const title = nameOf(it);
    const img = imgOf(it);
    const pr = chosen.disc.onSale ? chosen.disc.currentText : priceOf(it);

    const badge = chosen.disc.onSale
      ? chosen.disc.percentText
        ? `SALE ${chosen.disc.percentText}`
        : "SALE"
      : labels.badge || "";

    return {
      pickedItem: it,
      disc: chosen.disc,
      pickedPath: path,
      pickedName: title,
      pickedImage: img,
      pickedPrice: pr,
      badgeText: badge,
    };
  }, [items, item, preferDiscounted, labels.badge]);

  if (!visible) return null;
  if (!pickedItem && !pickedName) return null;

  const CARD = surfaceBg || palette.bannerBg || "#ffffff"; // card bg (configurable)
  const TXT = palette.text || "#0f172a";
  const ACC = palette.accent || "#06b6d4";
  const onACC = readableText(ACC);

  // fallbacks to shared actions
  const doAdd = onAdd || ((path) => actions.addToCart(path));
  const doBuy =
    onBuyNow || ((path) => actions.selectSingleAndCheckout(path, true));

  return (
    <section
      className={`mx-auto max-w-7xl px-5 ${className}`}
      style={{ color: TXT }}
    >
      <div
        className="rounded-2xl border p-5 md:p-7 flex flex-col md:flex-row items-center gap-6"
        style={{ background: CARD, borderColor: "#e5e7eb" }}
      >
        {/* image */}
        <div className="w-full md:w-56 shrink-0 grid place-items-center bg-gray-50 rounded-xl p-4">
          {pickedImage ? (
            <img
              src={pickedImage}
              alt={pickedName}
              className="h-32 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="text-xs opacity-60">No image</div>
          )}
        </div>

        {/* content */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wide opacity-70">
              {labels.heading ?? "Featured"}
            </span>
            {badgeText && (
              <span className="text-[11px] font-bold rounded px-2 py-1 bg-red-500 text-white">
                {badgeText}
              </span>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold">{pickedName}</h2>

          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-lg font-bold">{pickedPrice}</span>
            {disc.onSale && disc.originalText && (
              <span className="line-through text-sm opacity-70">
                {disc.originalText}
              </span>
            )}
          </div>

          {labels.note && (
            <p className="mt-1 text-sm opacity-80">{labels.note}</p>
          )}

          {/* actions */}
          <div className="mt-4 flex items-center gap-3">
            {!onlyPrimary && (
              <button
                className="px-4 py-2 rounded-lg font-semibold border"
                onClick={() => doAdd(pickedPath)}
              >
                {labels.add ?? "Add to cart"}
              </button>
            )}
            <button
              className="px-4 py-2 rounded-lg font-semibold"
              style={{ background: ACC, color: onACC }}
              onClick={() => doBuy(pickedPath)}
            >
              {labels.buy ?? "Buy now"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
