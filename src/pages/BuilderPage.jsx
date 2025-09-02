import React from "react";
import Header from "../components/Header";
import ConfigPanel from "../components/ConfigPanel";
import CheckoutEmbed from "../components/CheckoutEmbed";

export default function BuilderPage() {
  return (
    <>
      <Header />
      <CheckoutEmbed />
      <ConfigPanel />
      <footer className="py-10 mt-8 border-t">
        <div className="mx-auto max-w-6xl px-4 flex justify-between items-center text-sm">
          <div>© {new Date().getFullYear()} Demo Builder</div>
          <div className="opacity-75">Storefront-only setup</div>
        </div>
      </footer>
    </>
  );
}
