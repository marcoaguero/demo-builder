// src/utils/fsItem.js

// ---------- primitives ----------
export const pathOf = (it) =>
  it?.path || it?.product || it?.sku || it?.id || it?.code || "";

export const nameOf = (it) =>
  it?.display || it?.name || it?.product || it?.path || "Product";

export const imgOf = (it) =>
  it?.image ||
  it?.imageUrl ||
  it?.imageURL ||
  (Array.isArray(it?.images) ? it.images[0] : "") ||
  "";

export const priceOf = (it) =>
  it?.unitPrice || it?.price || it?.priceTotal || "";

// best numeric price “now”
function nowValue(it) {
  return it?.unitPriceValue ?? it?.priceValue ?? it?.priceTotalValue ?? null;
}

// crude currency sniff from a sample price string
function sniffCurrency(sample = "") {
  if (sample.includes("€")) return "EUR";
  if (sample.includes("£")) return "GBP";
  if (sample.includes("$")) return "USD";
  return "USD";
}

function fmtLike(it, value) {
  if (typeof value !== "number") return "";
  const cur = sniffCurrency(it?.price || it?.unitPrice || "");
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // ultimate fallback
    return `${value.toFixed(2)} ${cur}`;
  }
}

// ---------- discount info ----------
/**
 * Returns discount information from an SBL item whether it is already selected or not.
 * We look at:
 *  - item.discountPercentValue / unitDiscountValue (applied)
 *  - item.discount?.data.percentValue (applied or ready)
 *  - item.discountSet[*].percentValue (ready but not applied yet)
 *
 * When only discountSet is present, we compute a derived discounted price for UX.
 */
export function discountInfo(it) {
  if (!it) return { onSale: false };

  // percent sources
  const pctFromApplied =
    Number(it?.discountPercentValue) ||
    Number(it?.discount?.data?.percentValue) ||
    0;

  const pctFromSet =
    (Array.isArray(it?.discountSet) &&
      Number(
        (it.discountSet.find((d) => Number(d?.percentValue) > 0) || {})
          .percentValue
      )) ||
    0;

  // did SBL already apply a discount to the current numeric price?
  const appliedNow =
    Number(it?.unitDiscountValue) > 0 ||
    Number(it?.discountPercentValue) > 0 ||
    Boolean(it?.discount?.data?.percentValue);

  const pct = appliedNow ? pctFromApplied : pctFromSet;
  const onSale = Number(pct) > 0;

  // Build prices
  const baseNow = nowValue(it); // numeric current price snapshot we received
  let currentValue = null;
  let originalValue = null;

  if (onSale) {
    if (appliedNow && typeof baseNow === "number") {
      // SBL already applied → baseNow is discounted
      currentValue = baseNow;
      originalValue = baseNow / (1 - pct / 100);
    } else if (typeof baseNow === "number") {
      // only discountSet present → derive UX price
      originalValue = baseNow;
      currentValue = baseNow * (1 - pct / 100);
    }
  }

  const currentText =
    currentValue != null ? fmtLike(it, currentValue) : priceOf(it);
  const originalText = originalValue != null ? fmtLike(it, originalValue) : "";

  const percentText = onSale ? `${pct}%` : "";

  return {
    onSale,
    percent: pct,
    percentText,
    currentValue,
    currentText,
    originalValue,
    originalText,
    appliedNow,
  };
}

// ---------- pick featured ----------
/**
 * Prefer items with a discount (largest percent first). Fallback to first item.
 */
export function pickFeatured(items, preferDiscounted = true) {
  const arr = Array.isArray(items) ? items : [];
  if (!arr.length) return { item: null, disc: { onSale: false } };

  if (preferDiscounted) {
    const scored = arr
      .map((it) => ({ it, d: discountInfo(it) }))
      .filter((x) => x.d.onSale);

    if (scored.length) {
      scored.sort((a, b) => (b.d.percent || 0) - (a.d.percent || 0));
      return { item: scored[0].it, disc: scored[0].d };
    }
  }

  // fallback
  return { item: arr[0], disc: discountInfo(arr[0]) };
}
