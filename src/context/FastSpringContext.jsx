// src/context/FastSpringContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { decodeConfigFromHash } from "../utils/configUrl";

const FastSpringContext = createContext(null);
export const useFastSpring = () => useContext(FastSpringContext);

const SCRIPT_ID = "fsc-api";
const SBL_SRC =
  "https://sbl.onfastspring.com/sbl/1.0.5/fastspring-builder.min.js";

const LS = {
  storefront: "fs.storefrontId",
  industry: "fs.industry",
  company: "fs.companyName",
  logoUrl: "fs.logoUrl",
  logoDataUrl: "fs.logoDataUrl",
  palette: "fs.palette",
  banner: "fs.showBanner",
};

// Industry defaults
const INDUSTRY_THEMES = {
  gaming: {
    primary: "#0b1020",
    accent: "#22d3ee",
    nav: "#0b1020",
    background: "#ffffff",
    text: "#0f172a",
  },
  saas: {
    primary: "#0f172a",
    accent: "#6366f1",
    nav: "#0f172a",
    background: "#ffffff",
    text: "#0f172a",
  },
  fintech: {
    primary: "#0b132b",
    accent: "#2ec4b6",
    nav: "#0b132b",
    background: "#ffffff",
    text: "#0f172a",
  },
  retail: {
    primary: "#1f2937",
    accent: "#f59e0b",
    nav: "#1f2937",
    background: "#ffffff",
    text: "#0f172a",
  },
  default: {
    primary: "#0f172a",
    accent: "#22c55e",
    nav: "#0f172a",
    background: "#ffffff",
    text: "#0f172a",
  },
};

/* ------------ cart helpers ------------ */
// Prefer v1.x cart items; fallback to legacy "selected" in groups.
const computeCartQty = (payload) => {
  if (Array.isArray(payload?.items)) {
    return payload.items.reduce((n, it) => n + (Number(it?.quantity) || 1), 0);
  }
  let total = 0;
  const groups = Array.isArray(payload?.groups) ? payload.groups : [];
  for (const g of groups) {
    const items = Array.isArray(g?.items) ? g.items : [];
    for (const it of items)
      if (it?.selected) total += Number(it?.quantity) || 1;
  }
  return total;
};

const cartItemsArray = (payload) => {
  if (Array.isArray(payload?.items)) return payload.items;
  // build from legacy selected items
  const out = [];
  const groups = Array.isArray(payload?.groups) ? payload.groups : [];
  for (const g of groups) {
    const items = Array.isArray(g?.items) ? g.items : [];
    for (const it of items) if (it?.selected) out.push(it);
  }
  return out;
};

const itemMatchesPath = (it, path) => {
  const p = it?.path || it?.product || it?.sku || it?.id || "";
  return String(p).trim() === String(path).trim();
};

/* -------------------------------------- */

export const FastSpringProvider = ({ children }) => {
  // Lock by URL on /demo
  const cfgFromHash =
    typeof window !== "undefined"
      ? decodeConfigFromHash(window.location.hash)
      : null;
  const isDemoRoute =
    typeof window !== "undefined"
      ? window.location.pathname.includes("/demo")
      : false;
  const lockedByUrl = !!(cfgFromHash && isDemoRoute);

  // Base state (hash-first if locked)
  const [industry, setIndustry] = useState(
    () =>
      (lockedByUrl && cfgFromHash?.industry) ||
      (typeof window !== "undefined" && localStorage.getItem(LS.industry)) ||
      "saas"
  );
  const [storefrontId, setStorefrontId] = useState(
    () =>
      (lockedByUrl && cfgFromHash?.storefrontId) ||
      (typeof window !== "undefined" && localStorage.getItem(LS.storefront)) ||
      ""
  );
  const [companyName, setCompanyName] = useState(
    () =>
      (lockedByUrl && cfgFromHash?.brand?.companyName) ||
      (typeof window !== "undefined" && localStorage.getItem(LS.company)) ||
      ""
  );
  const [logoUrl, setLogoUrl] = useState(
    () =>
      (lockedByUrl && cfgFromHash?.brand?.logoUrl) ||
      (typeof window !== "undefined" && localStorage.getItem(LS.logoUrl)) ||
      ""
  );
  const [logoDataUrl, setLogoDataUrl] = useState(
    () =>
      (lockedByUrl && "") ||
      (typeof window !== "undefined" && localStorage.getItem(LS.logoDataUrl)) ||
      ""
  );
  const logoSrc = logoDataUrl || logoUrl || "";

  const initialPalette = (() => {
    if (lockedByUrl) {
      const base =
        INDUSTRY_THEMES[cfgFromHash?.industry] || INDUSTRY_THEMES.default;
      return { ...base, ...(cfgFromHash?.brand?.palette || {}) };
    }
    if (typeof window !== "undefined") {
      try {
        const p = JSON.parse(localStorage.getItem(LS.palette) || "null");
        if (p) return p;
      } catch {}
    }
    return INDUSTRY_THEMES.saas;
  })();
  const [palette, setPalette] = useState(initialPalette);

  // SBL + cart state
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [data, setData] = useState({});
  const [products, setProducts] = useState([]);
  const [cartQty, setCartQty] = useState(0);

  // UI
  const [showBanner, setShowBanner] = useState(() => {
    if (lockedByUrl) return cfgFromHash?.banner !== false;
    if (typeof window !== "undefined") {
      const bn = localStorage.getItem(LS.banner);
      return bn !== null ? bn === "true" : true;
    }
    return true;
  });

  // Debug
  const [debug, setDebug] = useState(true);
  const [lastCallback, setLastCallback] = useState(null);

  // Pending single-select flow (reset ➜ add ➜ optionally checkout)
  const pendingRef = useRef(null);
  // shape: { path: string, added: boolean, checkout: boolean }

  // Persist only when not locked
  useEffect(() => {
    if (lockedByUrl || typeof window === "undefined") return;
    localStorage.setItem(LS.storefront, storefrontId || "");
  }, [storefrontId, lockedByUrl]);
  useEffect(() => {
    if (lockedByUrl || typeof window === "undefined") return;
    localStorage.setItem(LS.industry, industry || "saas");
  }, [industry, lockedByUrl]);
  useEffect(() => {
    if (lockedByUrl || typeof window === "undefined") return;
    localStorage.setItem(LS.company, companyName || "");
  }, [companyName, lockedByUrl]);
  useEffect(() => {
    if (lockedByUrl || typeof window === "undefined") return;
    localStorage.setItem(LS.logoUrl, logoUrl || "");
  }, [logoUrl, lockedByUrl]);
  useEffect(() => {
    if (lockedByUrl || typeof window === "undefined") return;
    localStorage.setItem(LS.logoDataUrl, logoDataUrl || "");
  }, [logoDataUrl, lockedByUrl]);
  useEffect(() => {
    if (lockedByUrl || typeof window === "undefined") return;
    localStorage.setItem(LS.palette, JSON.stringify(palette || {}));
  }, [palette, lockedByUrl]);
  useEffect(() => {
    if (lockedByUrl || typeof window === "undefined") return;
    localStorage.setItem(LS.banner, String(!!showBanner));
  }, [showBanner, lockedByUrl]);

  // Seed palette from industry if user hasn’t customized (not locked)
  useEffect(() => {
    if (lockedByUrl || typeof window === "undefined") return;
    if (!localStorage.getItem(LS.palette)) {
      setPalette(INDUSTRY_THEMES[industry] || INDUSTRY_THEMES.default);
    }
  }, [industry, lockedByUrl]);

  // SBL callback
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.fastSpringCallBack = (payload) => {
      setLastCallback(payload);
      setData(payload);
      setCartQty(computeCartQty(payload));

      // Extract catalog products
      if (payload?.groups?.length) {
        const newProducts = payload.groups.flatMap((g) =>
          Array.isArray(g.items) ? g.items : []
        );
        setProducts(Array.isArray(newProducts) ? newProducts : []);
      } else {
        setProducts([]);
      }

      // Handle pending single-select flow deterministically:
      // 1) After reset, cart is empty -> add the product once
      // 2) After add, when item appears -> optionally checkout, then clear pending
      const pending = pendingRef.current;
      if (pending?.path) {
        const items = cartItemsArray(payload);
        const hasItem = items.some((it) => itemMatchesPath(it, pending.path));
        if (!pending.added) {
          // we want to add once the cart is empty
          if (items.length === 0) {
            try {
              window.fastspring?.builder?.push?.({
                products: [{ path: pending.path, quantity: 1 }],
              });
              pendingRef.current = { ...pending, added: true };
            } catch (e) {
              console.error("[SBL] pending add failed:", e);
              pendingRef.current = null;
            }
          }
        } else {
          // added: wait until it shows in items, then optionally checkout
          if (hasItem) {
            if (pending.checkout) {
              try {
                window.fastspring?.builder?.checkout?.();
              } catch (e) {
                console.error("[SBL] checkout failed:", e);
              }
            }
            pendingRef.current = null;
          }
        }
      }

      if (debug) {
        console.groupCollapsed(
          "%c[SBL] data-callback",
          "color:#22d3ee;font-weight:bold"
        );
        console.log("payload:", payload);
        console.log("items (cart):", payload?.items);
        console.log("groups:", payload?.groups);
        console.log("cartQty:", computeCartQty(payload));
        console.log("pending:", pendingRef.current);
        console.groupEnd();
      }
    };

    window.onFSPopupClosed = function (orderReference) {
      if (window.fastspring?.builder?.reset) window.fastspring.builder.reset();
      if (orderReference?.id) {
        window.location.replace(
          "purchase_success?orderId=" + orderReference.id
        );
      }
    };
  }, [debug]);

  // Load/attach SBL script
  useEffect(() => {
    if (!storefrontId || typeof document === "undefined") return;

    setStatus("loading");
    setError(null);

    // Ensure callbacks exist (noop bodies already set above)
    if (typeof window !== "undefined") {
      if (!window.fastSpringCallBack) window.fastSpringCallBack = () => {};
      if (!window.onFSPopupClosed) window.onFSPopupClosed = () => {};
    }

    let script = document.getElementById(SCRIPT_ID);
    if (!script) {
      script = document.createElement("script");
      script.type = "text/javascript";
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = SBL_SRC;
      script.setAttribute("data-continuous", "true");
      document.head.appendChild(script);
    }

    script.setAttribute("data-data-callback", "fastSpringCallBack");
    script.setAttribute("data-popup-webhook-received", "onFSPopupClosed");
    script.dataset.storefront = storefrontId;

    const markReady = () => {
      setStatus("ready");
      try {
        script.dataset.loaded = "true";
      } catch {}
      setTimeout(() => window.fastspring?.builder?.reset?.(), 0);
    };

    if (script?.dataset?.loaded === "true" || window.fastspring) {
      markReady();
    } else {
      const onLoad = () => markReady();
      const onError = () => {
        setStatus("error");
        setError("Failed to load SBL. Check the storefront/URL.");
      };
      script.addEventListener("load", onLoad, { once: true });
      script.addEventListener("error", onError, { once: true });
    }
  }, [storefrontId]);

  // Product path resolver
  const productPathOf = useCallback((it) => {
    const p =
      (typeof it === "string" ? it : null) ||
      it?.path ||
      it?.product ||
      it?.sku ||
      it?.id ||
      it?.code ||
      "";
    return (typeof p === "string" ? p : "").trim();
  }, []);

  // Idempotent add: ensure quantity is 1 (no increment if already present)
  const addToCart = useCallback(
    (itemOrPath, qty = 1) => {
      const path = productPathOf(itemOrPath);
      if (!path) return alert("No product path.");
      const items = cartItemsArray(data);
      const existing = items.find((it) => itemMatchesPath(it, path));
      try {
        if (existing) {
          // keep it at 1 (or set to 1)
          window.fastspring?.builder?.update?.(path, 1);
        } else {
          window.fastspring?.builder?.push?.({
            products: [{ path, quantity: Math.max(1, qty) }],
          });
        }
      } catch (e) {
        console.error("[SBL] addToCart failed:", e);
        alert("FastSpring action failed. See console.");
      }
    },
    [data, productPathOf]
  );

  // Force increment (only if you explicitly want it)
  const addToCartForce = useCallback(
    (itemOrPath, qty = 1) => {
      const path = productPathOf(itemOrPath);
      if (!path) return alert("No product path.");
      try {
        window.fastspring?.builder?.push?.({
          products: [{ path, quantity: Math.max(1, qty) }],
        });
      } catch (e) {
        console.error("[SBL] addToCartForce failed:", e);
        alert("FastSpring action failed. See console.");
      }
    },
    [productPathOf]
  );

  // Single-select plan: true reset -> add(1) -> optional checkout
  const selectSingleAndCheckout = useCallback(
    (itemOrPath, doCheckout = true) => {
      const path = productPathOf(itemOrPath);
      if (!path) return alert("No product path.");
      pendingRef.current = { path, added: false, checkout: !!doCheckout };
      try {
        window.fastspring?.builder?.reset?.();
      } catch (e) {
        console.error("[SBL] reset failed:", e);
        // fallback: attempt a direct replace effect by forcing update to 1 after push
        window.fastspring?.builder?.push?.({
          products: [{ path, quantity: 1 }],
        });
        if (doCheckout) window.fastspring?.builder?.checkout?.();
        pendingRef.current = null;
      }
    },
    [productPathOf]
  );

  const checkout = useCallback(() => {
    try {
      window.fastspring?.builder?.checkout?.();
    } catch (e) {
      console.error("[SBL] checkout failed:", e);
      alert("SBL not ready yet. Confirm the popup storefront and script.");
    }
  }, []);

  const refreshProducts = useCallback(() => {
    try {
      return window.fastspring?.builder?.reset?.();
    } catch (e) {
      console.error("[SBL] reset failed:", e);
    }
  }, []);

  const setLogoFromFile = useCallback((file) => {
    if (!file) return setLogoDataUrl("");
    const reader = new FileReader();
    reader.onload = (e) => setLogoDataUrl(String(e.target?.result || ""));
    reader.readAsDataURL(file);
  }, []);

  const theme = useMemo(() => {
    const base = INDUSTRY_THEMES[industry] || INDUSTRY_THEMES.default;
    return { ...base, ...palette };
  }, [industry, palette]);

  // Console helper
  useEffect(() => {
    window.fsdbg = {
      get state() {
        return { storefrontId, industry, status, lockedByUrl, cartQty };
      },
      get data() {
        return lastCallback;
      },
      get products() {
        return products;
      },
      count() {
        const p = lastCallback || {};
        const itemsCount = Array.isArray(p.items)
          ? p.items.reduce((n, it) => n + (Number(it?.quantity) || 1), 0)
          : 0;
        let selectedCount = 0;
        const groups = Array.isArray(p.groups) ? p.groups : [];
        for (const g of groups) {
          const items = Array.isArray(g?.items) ? g.items : [];
          for (const it of items)
            if (it?.selected) selectedCount += Number(it?.quantity) || 1;
        }
        console.table([{ itemsCount, selectedCount, cartQty }]);
        return { itemsCount, selectedCount, cartQty };
      },
      reset: () => refreshProducts(),
      add: (pathOrIndex, qty = 1) => {
        if (typeof pathOrIndex === "number")
          return addToCart(products?.[pathOrIndex], qty);
        return addToCart(pathOrIndex, qty);
      },
      addForce: (pathOrIndex, qty = 1) => {
        if (typeof pathOrIndex === "number")
          return addToCartForce(products?.[pathOrIndex], qty);
        return addToCartForce(pathOrIndex, qty);
      },
      select: (pathOrIndex, checkout = true) => {
        if (typeof pathOrIndex === "number")
          return selectSingleAndCheckout(products?.[pathOrIndex], checkout);
        return selectSingleAndCheckout(pathOrIndex, checkout);
      },
      checkout: () => checkout(),
      log() {
        console.groupCollapsed("%c[fsdbg] state", "color:#888");
        console.log({ storefrontId, industry, status, lockedByUrl, cartQty });
        console.groupEnd();
        console.groupCollapsed("%c[fsdbg] data", "color:#888");
        console.log(lastCallback);
        console.groupEnd();
        console.groupCollapsed("%c[fsdbg] products (name/path)", "color:#888");
        console.table(
          (products || []).map((p) => ({
            name: p?.display || p?.name || p?.product || p?.path,
            path: p?.path || p?.product || p?.sku || p?.id || "",
          }))
        );
        console.groupEnd();
      },
    };
  }, [
    storefrontId,
    industry,
    status,
    lockedByUrl,
    cartQty,
    lastCallback,
    products,
    refreshProducts,
    addToCart,
    addToCartForce,
    selectSingleAndCheckout,
    checkout,
  ]);

  const value = useMemo(
    () => ({
      // config
      storefrontId,
      setStorefrontId,
      industry,
      setIndustry,

      // brand
      companyName,
      setCompanyName,
      logoUrl,
      setLogoUrl,
      logoDataUrl,
      setLogoDataUrl,
      setLogoFromFile,
      logoSrc,

      // colors
      palette,
      setPalette,
      theme,

      // sbl + actions
      status,
      error,
      data,
      products,
      addToCart, // idempotent: won’t increment if already in cart
      addToCartForce, // always increments
      selectSingleAndCheckout, // reset -> add(1) -> checkout
      checkout,
      refreshProducts,

      // UI
      showBanner,
      setShowBanner,

      // cart
      cartQty,

      // debug
      debug,
      setDebug,
      lastCallback,

      // lock info
      lockedByUrl,
    }),
    [
      storefrontId,
      industry,
      companyName,
      logoUrl,
      logoDataUrl,
      logoSrc,
      palette,
      theme,
      status,
      error,
      data,
      products,
      addToCart,
      addToCartForce,
      selectSingleAndCheckout,
      checkout,
      refreshProducts,
      showBanner,
      cartQty,
      debug,
      lastCallback,
      lockedByUrl,
    ]
  );

  return (
    <FastSpringContext.Provider value={value}>
      {children}
    </FastSpringContext.Provider>
  );
};
