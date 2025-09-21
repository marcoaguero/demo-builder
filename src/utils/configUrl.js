import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

// Short codes → preset storefront URLs
export const PRESET_MAP = {
  m: "maguero.test.onfastspring.com/popup-mobile-demo",
  g: "maguero.test.onfastspring.com/popup-gaming-demo",
  e: "maguero.test.onfastspring.com/popup-ecommerce-demo",
  s: "maguero.test.onfastspring.com/popup-saas-demo",
};

// Industry palettes to omit unchanged values (optional optimization)
const DEFAULT_PALETTES = {
  gaming: { a: "#22d3ee", n: "#0b1020", bg: "#ffffff", t: "#0f172a" },
  mobile: { a: "#22c55e", n: "#0f172a", bg: "#ffffff", t: "#0f172a" },
  ecommerce: { a: "#f59e0b", n: "#1f2937", bg: "#ffffff", t: "#0f172a" },
  saas: { a: "#6366f1", n: "#0f172a", bg: "#ffffff", t: "#0f172a" },
};

const norm = (v = "") => String(v).toLowerCase().trim();

function prune(obj) {
  if (obj && typeof obj === "object") {
    const out = Array.isArray(obj) ? [] : {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === "" || v === null) continue;
      const pv = prune(v);
      if (
        pv === undefined ||
        (typeof pv === "object" && !Object.keys(pv).length)
      )
        continue;
      out[k] = pv;
    }
    return out;
  }
  return obj;
}

// Keep 3-digit hex when possible (#aabbcc → #abc)
const shortHex = (hex) => {
  const h = String(hex || "")
    .toLowerCase()
    .replace("#", "");
  if (!/^[0-9a-f]{6}$/.test(h)) return hex;
  if (h[0] === h[1] && h[2] === h[3] && h[4] === h[5])
    return "#" + h[0] + h[2] + h[4];
  return "#" + h;
};

function toShort(cfg = {}) {
  const industry = norm(cfg.industry);
  const defaults = DEFAULT_PALETTES[industry];

  const p = cfg.brand?.palette || {};
  const palette = {};
  const entries = [
    ["a", p.accent],
    ["n", p.nav],
    ["bg", p.background],
    ["t", p.text],
  ];
  for (const [k, val] of entries) {
    const v = val ? shortHex(val) : undefined;
    if (!defaults || (v && v !== defaults[k])) palette[k] = v;
  }

  const short = {
    i: cfg.industry,
    b: {
      c: cfg.brand?.companyName || "",
      l: cfg.brand?.logoUrl || "",
      p: palette,
    },
    d: !!cfg.debug,
  };

  // storefront vs preset
  if (cfg.presetKey && PRESET_MAP[cfg.presetKey]) {
    short.ps = cfg.presetKey;
    if (cfg.storefrontId && cfg.storefrontId !== PRESET_MAP[cfg.presetKey]) {
      short.s = cfg.storefrontId;
    }
  } else {
    short.s = cfg.storefrontId;
  }

  // banner toggle (default true → only store when false)
  if (cfg.banner === false) short.bn = 0;

  return prune(short);
}

function fromShort(s = {}) {
  const presetUrl = s.ps ? PRESET_MAP[s.ps] : undefined;
  const storefrontId = s.s || presetUrl || "";

  return {
    industry: s.i,
    storefrontId,
    presetKey: s.ps || undefined,
    brand: {
      companyName: s.b?.c || "",
      logoUrl: s.b?.l || "",
      palette: {
        accent: s.b?.p?.a,
        nav: s.b?.p?.n,
        background: s.b?.p?.bg,
        text: s.b?.p?.t,
      },
    },
    banner: s.bn === 0 ? false : true, // default true
    debug: !!s.d,
  };
}

export function encodeConfigToHash(cfg) {
  const json = JSON.stringify(toShort(cfg));
  return "#v3_" + compressToEncodedURIComponent(json);
}

export function decodeConfigFromHash(hash) {
  const raw = String(hash || "").replace(/^#/, "");
  if (!raw) return null;

  if (raw.startsWith("v3_")) {
    const json = decompressFromEncodedURIComponent(raw.slice(3));
    if (!json) return null;
    return fromShort(JSON.parse(json));
  }

  // legacy fallbacks
  try {
    const j = decompressFromEncodedURIComponent(raw);
    if (j) return JSON.parse(j);
  } catch {}
  try {
    const j = decodeURIComponent(escape(atob(raw)));
    return JSON.parse(j);
  } catch {}
  return null;
}
