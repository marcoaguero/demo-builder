import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { decodeConfigFromHash } from "../utils/configUrl";
import { useFastSpring } from "../context/FastSpringContext";

// Layouts
import LayoutGaming from "../layouts/LayoutGaming";
import LayoutMobile from "../layouts/LayoutMobile";
import LayoutEcommerceAV from "../layouts/LayoutEcommerceAV";
import LayoutSaaS from "../layouts/LayoutSaaS";

export default function DemoPage() {
  const { hash } = useLocation();

  const {
    setStorefrontId,
    setIndustry,
    setCompanyName,
    setLogoUrl,
    setPalette,
    setShowBanner, // <-- NEW: banner toggle from hash
    industry,
  } = useFastSpring();

  useEffect(() => {
    const cfg = decodeConfigFromHash(hash);
    if (!cfg) return;

    // 1) layout + storefront first so SBL can load right away
    if (cfg.industry) setIndustry(cfg.industry);
    if (cfg.storefrontId) setStorefrontId(cfg.storefrontId);

    // 2) brand basics
    if (cfg.brand?.companyName) setCompanyName(cfg.brand.companyName);
    if (cfg.brand?.logoUrl) setLogoUrl(cfg.brand.logoUrl);

    // 3) colors LAST so they override industry defaults
    if (cfg.brand?.palette) {
      setPalette((prev) => ({ ...prev, ...cfg.brand.palette }));
    }

    // 4) seasonal banner toggle (defaults to true if absent)
    setShowBanner(cfg.banner !== false);

    if (cfg.debug) console.log("[Demo] config loaded:", cfg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  // choose layout by industry
  const v = String(industry || "").toLowerCase();
  if (v === "gaming" || v === "gaming store") return <LayoutGaming />;
  if (v === "mobile" || v === "mobile apps") return <LayoutMobile />;
  if (v === "ecommerce" || v === "audio" || v === "video")
    return <LayoutEcommerceAV />;
  if (v === "saas" || v === "saas subscription") return <LayoutSaaS />;

  // fallback
  return <LayoutSaaS />;
}
