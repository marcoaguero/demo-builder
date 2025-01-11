import React, { createContext, useContext, useEffect, useState } from "react";

const FastSpringContext = createContext();

export const useFastSpring = () => {
  return useContext(FastSpringContext);
};

export const FastSpringProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [data, setData] = useState({});

  // Fills up products array when SBL loads
  useEffect(() => {
    const fastSpringCallBack = (data) => {
      setData(data);
      console.log(data);
      if (data && data.groups) {
        const newProducts = data.groups
          .filter((group) => group.items && Array.isArray(group.items))
          .flatMap((group) => group.items);
        setProducts(newProducts);
      }
    };
    // Redirects upon closing the popup
    window.onFSPopupClosed = function (orderReference) {
      if (window.fastspring && window.fastspring.builder) {
        window.fastspring.builder.reset();
      }
      if (orderReference && orderReference.id) {
        window.location.replace(
          "purchase_success?orderId=" + orderReference.id
        );
      }
    };
    const addSBL = () => {
      const scriptId = "fsc-api";
      const existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.id = scriptId;
        script.setAttribute("data-continuous", "true");
        script.src =
          "https://sbl.onfastspring.com/sbl/0.9.5/fastspring-builder.min.js";
        script.dataset.storefront =
          "assignmentse.test.onfastspring.com/popup-assignmentse";
        if (typeof window !== "undefined") {
          window.fastSpringCallBack = fastSpringCallBack;
        }
        script.setAttribute("data-data-callback", "fastSpringCallBack");
        script.setAttribute("data-popup-webhook-received", "onFSPopupClosed");

        document.head.appendChild(script);
      }
    };
    // Load SBL consistently
    addSBL();
  });

  return (
    <FastSpringContext.Provider value={{ products, data }}>
      {children}
    </FastSpringContext.Provider>
  );
};
