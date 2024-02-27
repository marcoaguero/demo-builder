import React from "react";

const Button = ({ path, title }) => {
  const buyProduct = () => {
    const newProduct = {
      path,
      quantity: 1,
    };

    // Create a payload with the new product
    const payload = {
      products: [newProduct],
    };

    // Push the payload to add the product
    if (
      typeof window !== "undefined" &&
      window.fastspring &&
      window.fastspring.builder
    ) {
      window.fastspring.builder.push(payload);
    }
  };

  return (
    <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
      <div className="text-center">
        <button className="btn btn-outline-dark mt-auto" onClick={buyProduct}>
          {title}
        </button>
      </div>
    </div>
  );
};

export default Button;
