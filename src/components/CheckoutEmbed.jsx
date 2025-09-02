import React from "react";

export default function CheckoutEmbed() {
  return (
    <section className="w-full bg-gray-50 border-y">
      <div className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Build a store demo in minutes
          </h1>
          <p className="mt-3 text-base md:text-lg opacity-80">
            Paste your Store ID and Storefront, add products, and trigger
            checkout.
          </p>
        </div>
        <div className="rounded-2xl p-4 shadow-sm bg-white border">
          <div className="h-48 w-full rounded-xl grid place-items-center border border-dashed">
            <div className="text-center">
              <div className="text-sm font-semibold">Checkout Embed Area</div>
              <div className="text-xs opacity-70">
                Replace with FastSpring SBL embed when ready
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
