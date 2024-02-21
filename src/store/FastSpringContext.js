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
        const newProducts = [];
        data.groups.forEach((group) => {
          if (group.items && Array.isArray(group.items)) {
            group.items.forEach((item) => {
              newProducts.push(item);
            });
          }
        });
        setProducts(newProducts);
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
        window.fastSpringCallBack = fastSpringCallBack;
        script.setAttribute("data-data-callback", "fastSpringCallBack");

        document.body.appendChild(script);
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
