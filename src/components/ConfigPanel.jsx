import React from "react";
import { useFastSpring } from "../context/FastSpringContext";

export default function ConfigPanel({ onStart }) {
  const {
    storefrontId,
    setStorefrontId,
    industry,
    setIndustry,
    companyName,
    setCompanyName,
    logoUrl,
    setLogoUrl,
    setLogoFromFile,
    logoSrc,
    palette,
    setPalette,
  } = useFastSpring();

  const onColor = (key) => (e) =>
    setPalette({ ...palette, [key]: e.target.value });

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 grid gap-4">
      <div className="text-sm font-semibold opacity-80">Config</div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide opacity-60">
            Industry
          </label>
          <select
            className="border rounded-lg p-2"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="saas">SaaS</option>
            <option value="gaming">Gaming</option>
            <option value="fintech">Fintech</option>
            <option value="retail">Retail</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wide opacity-60">
            Storefront
          </label>
          <input
            className="border rounded-lg p-2"
            placeholder="e.g., mycompany.onfastspring.com/popup-mycompany"
            value={storefrontId}
            onChange={(e) => setStorefrontId(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide opacity-60">
            Company name (fallback)
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

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide opacity-60">
            Or upload PNG
          </label>
          <input
            className="border rounded-lg p-2"
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFromFile(e.target.files?.[0])}
          />
        </div>
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
          label="Text (optional)"
          value={palette.text}
          onChange={onColor("text")}
        />
      </div>

      <div className="rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-900 p-3 text-sm">
        <strong>Heads up:</strong> Make sure the products you just created for
        this store are added to the storefront you are going to use.
      </div>

      <div>
        <button
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
          disabled={!storefrontId}
          onClick={onStart}
        >
          Generate demo
        </button>
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
