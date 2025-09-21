import React, { useEffect, useState } from "react";
import { useFastSpring } from "../context/FastSpringContext";
import { encodeConfigToHash } from "../utils/configUrl";

// Preset storefronts per industry
const STOREFRONT_PRESETS = {
  mobile: "maguero.test.onfastspring.com/popup-mobile-demo",
  gaming: "maguero.test.onfastspring.com/popup-gaming-demo",
  ecommerce: "maguero.test.onfastspring.com/popup-ecommerce-demo",
  saas: "maguero.test.onfastspring.com/popup-saas-demo",
};

// short codes for URL
const PRESET_CODE = { mobile: "m", gaming: "g", ecommerce: "e", saas: "s" };
const normalize = (v = "") => String(v).toLowerCase().trim();

export default function ConfigPanel() {
  const {
    storefrontId,
    setStorefrontId,
    industry,
    setIndustry,
    companyName,
    setCompanyName,
    logoUrl,
    setLogoUrl,
    logoSrc,
    palette,
    setPalette,
    showBanner,
    setShowBanner, // NEW
  } = useFastSpring();

  const [customStorefront, setCustomStorefront] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Apply preset on industry change when not in custom mode
  useEffect(() => {
    if (!customStorefront) {
      const key = normalize(industry);
      const preset = STOREFRONT_PRESETS[key] || "";
      setStorefrontId(preset);
      console.log("[Builder] storefront preset:", key, "→", preset || "(none)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industry, customStorefront]);

  // If no preset for this industry, open the custom field
  useEffect(() => {
    if (!STOREFRONT_PRESETS[normalize(industry)]) setCustomStorefront(true);
  }, [industry]);

  useEffect(() => {
    if (storefrontId) console.log("[Builder] storefrontId →", storefrontId);
  }, [storefrontId]);

  const onColor = (k) => (e) => setPalette({ ...palette, [k]: e.target.value });

  // Build the config object that will be encoded in the URL hash
  const buildConfig = () => {
    const key = normalize(industry);
    const presetUrl = STOREFRONT_PRESETS[key];
    const isPresetActive = !customStorefront && !!presetUrl;

    return {
      industry,
      storefrontId,
      presetKey: isPresetActive ? PRESET_CODE[key] : undefined,
      brand: {
        companyName: companyName || "",
        logoUrl: logoUrl || "",
        palette: {
          accent: palette.accent,
          nav: palette.nav,
          background: palette.background,
          text: palette.text,
        },
      },
      banner: !!showBanner, // NEW
      debug: false,
    };
  };

  const handleGenerate = () => {
    const cfg = buildConfig();
    const hash = encodeConfigToHash(cfg);
    const url = `${window.location.origin}/demo${hash}`;
    setShareUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Copied!");
    } catch {
      alert(shareUrl);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 grid gap-4">
      <div className="text-sm font-semibold opacity-80">Config</div>

      {/* Industry + (hidden by default) Storefront */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide opacity-60">
            Industry / Layout
          </label>
          <select
            className="border rounded-lg p-2"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="mobile">Mobile apps</option>
            <option value="gaming">Gaming Store</option>
            <option value="ecommerce">Ecommerce (Audio/Video)</option>
            <option value="saas">SaaS Subscription</option>
          </select>
        </div>

        {customStorefront ? (
          <div className="flex flex-col gap-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wide opacity-60">
                Storefront
              </label>
              {STOREFRONT_PRESETS[normalize(industry)] && (
                <button
                  type="button"
                  className="text-xs px-3 py-1 rounded border"
                  onClick={() => {
                    setCustomStorefront(false);
                    const preset =
                      STOREFRONT_PRESETS[normalize(industry)] || "";
                    setStorefrontId(preset);
                  }}
                >
                  Use preset
                </button>
              )}
            </div>
            <input
              className="border rounded-lg p-2 font-mono text-sm"
              placeholder="e.g., mycompany.onfastspring.com/popup-mycompany"
              value={storefrontId}
              onChange={(e) => setStorefrontId(e.target.value)}
            />
          </div>
        ) : (
          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              className="text-xs px-3 py-1 rounded border"
              onClick={() => setCustomStorefront(true)}
            >
              Enter custom storefront ID
            </button>
          </div>
        )}
      </div>

      {/* Branding */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide opacity-60">
            Company name
          </label>
          <input
            className="border rounded-lg p-2"
            placeholder="Acme Corp"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide opacity-60">
            Logo (PNG URL)
          </label>
          <input
            className="border rounded-lg p-2"
            placeholder="https://..."
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </div>

        {/* (Upload PNG is commented out for now) */}
      </div>

      {logoSrc ? (
        <div className="flex items-center gap-3 text-sm">
          <img
            src={logoSrc}
            alt="logo preview"
            className="h-8 w-auto rounded"
          />
          <span className="opacity-70">Logo preview</span>
        </div>
      ) : null}

      {/* Colors */}
      <div className="grid md:grid-cols-4 gap-4">
        <ColorField
          label="Buttons / Accent"
          value={palette.accent}
          onChange={onColor("accent")}
        />
        <ColorField
          label="Nav (header)"
          value={palette.nav}
          onChange={onColor("nav")}
        />
        <ColorField
          label="Background"
          value={palette.background}
          onChange={onColor("background")}
        />
        <ColorField
          label="Text"
          value={palette.text}
          onChange={onColor("text")}
        />
      </div>

      {/* NEW: Seasonal banner toggle */}
      <div className="flex items-center gap-3">
        <input
          id="showBanner"
          type="checkbox"
          className="h-4 w-4"
          checked={!!showBanner}
          onChange={(e) => setShowBanner(e.target.checked)}
        />
        <label htmlFor="showBanner" className="text-sm">
          Show banner (featured offer)
        </label>
      </div>

      <div className="rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-900 p-3 text-sm">
        <strong>Heads up:</strong> Make sure the products for this store are
        added to the storefront you’re using.
      </div>

      <div className="flex items-center gap-3">
        <button
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
          disabled={!storefrontId}
          onClick={handleGenerate}
        >
          Generate demo
        </button>
        {shareUrl ? (
          <button
            className="text-sm px-3 py-2 rounded border"
            onClick={copyLink}
          >
            Copy link
          </button>
        ) : null}
      </div>
    </section>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-wide opacity-60">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          className="h-10 w-12 rounded border"
          value={value}
          onChange={onChange}
        />
        <input
          className="border rounded-lg p-2 w-full font-mono text-sm"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
