import React from "react";
import Header from "../components/Header";
import ConfigPanel from "../components/ConfigPanel";
import CheckoutEmbed from "../components/CheckoutEmbed";

export default function BuilderPage({ onStart }) {
  return (
    <>
      <Header />
      <CheckoutEmbed />
      <ConfigPanel onStart={onStart} />
      <footer className="py-10 mt-8 border-t">
        <div className="mx-auto max-w-6xl px-4 flex justify-between items-center text-sm">
          © {new Date().getFullYear()} Demo Builder
          <span className="opacity-75">Storefront-only setup</span>
        </div>
      </footer>
    </>
  );
}
