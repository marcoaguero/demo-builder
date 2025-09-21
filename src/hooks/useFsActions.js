import { useCallback } from "react";
import { useFastSpring } from "../context/FastSpringContext";

/**
 * Central wrapper around SBL actions.
 * Uses context methods if present, otherwise calls window.fastspring.builder directly.
 */
export default function useFsActions() {
  const ctx = useFastSpring();

  const addToCart = useCallback(
    (path, qty = 1) => {
      if (!path) return;
      if (ctx?.addToCart) return ctx.addToCart(path, qty);
      const b = window.fastspring?.builder;
      if (!b?.push) return alert("SBL not ready (add)");
      b.push({ products: [{ path, quantity: qty }] });
    },
    [ctx]
  );

  const buyNow = useCallback(
    (path, qty = 1) => {
      if (!path) return;
      if (ctx?.buyNow) return ctx.buyNow(path, qty);
      const b = window.fastspring?.builder;
      if (!b?.push) return alert("SBL not ready (buy)");
      b.push({ products: [{ path, quantity: qty }] });
    },
    [ctx]
  );

  const checkout = useCallback(() => {
    if (ctx?.checkout) return ctx.checkout();
    const b = window.fastspring?.builder;
    if (!b?.checkout) return alert("SBL not ready (checkout)");
    b.checkout();
  }, [ctx]);

  const resetCart = useCallback(() => {
    if (ctx?.refreshProducts) return ctx.refreshProducts();
    window.fastspring?.builder?.reset?.();
  }, [ctx]);

  /** reset → add(1) → checkout  */
  const selectSingleAndCheckout = useCallback((path, resetFirst = true) => {
    if (!path) return;
    const b = window.fastspring?.builder;
    if (!b?.push || !b?.checkout) return alert("SBL not ready (flow)");
    if (resetFirst && b.reset) b.reset();
    b.push({ products: [{ path, quantity: 1 }] });
    b.checkout();
  }, []);

  return { addToCart, buyNow, checkout, resetCart, selectSingleAndCheckout };
}
