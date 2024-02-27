import React from "react";
import Button from "./Button";

const ProductCard = ({ image, path, display, price }) => {
  return (
    <div className="col mb-5">
      <div className="card h-100">
        <img className="card-img-top" src={image} alt={`Product ${display}`} />
        <div className="card-body p-4">
          <div className="text-center">
            <h5 className="fw-bolder">{display}</h5>
            <span>{price}</span>
          </div>
        </div>
        <Button title="Add to cart" path={path} />
      </div>
    </div>
  );
};

export default ProductCard;
