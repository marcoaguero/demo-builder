import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const FastSpringContext = createContext(null);
export const useFastSpring = () => useContext(FastSpringContext);

const SCRIPT_ID = "fsc-api";
const SBL_SRC =
  "https://sbl.onfastspring.com/sbl/0.9.5/fastspring-builder.min.js";

// localStorage keys
const LS = {
  storefront: "fs.storefrontId",
  industry: "fs.industry",
  company: "fs.companyName",
  logoUrl: "fs.logoUrl",
  logoDataUrl: "fs.logoDataUrl",
  palette: "fs.palette",
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

export const FastSpringProvider = ({ children }) => {
  // Core config
  const [storefrontId, setStorefrontId] = useState("");
  const [industry, setIndustry] = useState("saas");

  // Branding
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState(""); // from file upload
  const logoSrc = logoDataUrl || logoUrl || "";

  // Colors
  const [palette, setPalette] = useState(INDUSTRY_THEMES.saas);

  // SBL state
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState(null);
  const [data, setData] = useState({});
  const [products, setProducts] = useState([]);

  // ---- Hydrate
  useEffect(() => {
    setStorefrontId(localStorage.getItem(LS.storefront) || "");
    setIndustry(localStorage.getItem(LS.industry) || "saas");
    setCompanyName(localStorage.getItem(LS.company) || "");
    setLogoUrl(localStorage.getItem(LS.logoUrl) || "");
    setLogoDataUrl(localStorage.getItem(LS.logoDataUrl) || "");
    try {
      const p = JSON.parse(localStorage.getItem(LS.palette) || "null");
      if (p) setPalette(p);
    } catch {}
  }, []);

  // ---- Persist
  useEffect(
    () => localStorage.setItem(LS.storefront, storefrontId || ""),
    [storefrontId]
  );
  useEffect(
    () => localStorage.setItem(LS.industry, industry || "saas"),
    [industry]
  );
  useEffect(
    () => localStorage.setItem(LS.company, companyName || ""),
    [companyName]
  );
  useEffect(() => localStorage.setItem(LS.logoUrl, logoUrl || ""), [logoUrl]);
  useEffect(
    () => localStorage.setItem(LS.logoDataUrl, logoDataUrl || ""),
    [logoDataUrl]
  );
  useEffect(
    () => localStorage.setItem(LS.palette, JSON.stringify(palette || {})),
    [palette]
  );

  // When industry changes and user hasn't customized (heuristic), seed from defaults
  useEffect(() => {
    if (!localStorage.getItem(LS.palette)) {
      setPalette(INDUSTRY_THEMES[industry] || INDUSTRY_THEMES.default);
    }
  }, [industry]);

  // ---- SBL callbacks
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.fastSpringCallBack = (payload) => {
      setData(payload);
      if (payload?.groups?.length) {
        const newProducts = payload.groups.flatMap((g) =>
          Array.isArray(g.items) ? g.items : []
        );
        setProducts(Array.isArray(newProducts) ? newProducts : []);
      }
    };

    window.onFSPopupClosed = function (orderReference) {
      if (window.fastspring?.builder?.reset) window.fastspring.builder.reset();
      if (orderReference?.id)
        window.location.replace(
          "purchase_success?orderId=" + orderReference.id
        );
    };
  }, []);

  // ---- Load SBL when storefront changes
  useEffect(() => {
    if (!storefrontId || typeof document === "undefined") return;

    setStatus("loading");
    setError(null);

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) existing.remove();

    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.src = SBL_SRC;
    s.setAttribute("data-continuous", "true");
    s.setAttribute("data-data-callback", "fastSpringCallBack");
    s.setAttribute("data-popup-webhook-received", "onFSPopupClosed");
    s.dataset.storefront = storefrontId;

    s.onload = () => setStatus("ready");
    s.onerror = () => {
      setStatus("error");
      setError("Failed to load SBL. Check the storefront/URL.");
    };

    document.head.appendChild(s);
    return () => s.remove();
  }, [storefrontId]);

  // ---- Actions
  const openCheckout = (item) => {
    const path = item?.path || item?.product || item?.sku;
    if (!path) return alert("No product path found for this item.");
    if (window.fastspring?.builder?.push) {
      try {
        window.fastspring.builder.push({ products: [{ path, quantity: 1 }] });
      } catch (e) {
        console.error(e);
        alert("FastSpring checkout failed. See console.");
      }
    } else {
      alert("SBL not ready yet. Check storefront and script load.");
    }
  };

  const setLogoFromFile = (file) => {
    if (!file) return setLogoDataUrl("");
    const reader = new FileReader();
    reader.onload = (e) => setLogoDataUrl(String(e.target?.result || ""));
    reader.readAsDataURL(file);
  };

  const theme = useMemo(() => {
    const base = INDUSTRY_THEMES[industry] || INDUSTRY_THEMES.default;
    return { ...base, ...palette };
  }, [industry, palette]);

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

      // sbl
      status,
      error,
      data,
      products,
      openCheckout,
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
    ]
  );

  return (
    <FastSpringContext.Provider value={value}>
      {children}
    </FastSpringContext.Provider>
  );
};
