import React from "react";
import hero from "../assets/thank-you.jpg";

const PurchaseSuccess = () => {
  const thankyouImage = {
    backgroundImage: `url(${hero})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
  return (
    <section className="py-5 flex-grow-1" style={thankyouImage}>
      <div className="container px-4 px-lg-5 my-5">
        <div className="text-center text-white">
          <h1 className="display-4 fw-bolder">
            <div>Thanks for your purchase and...</div>
            <div>...make sure to ROCK on!</div>
          </h1>
        </div>
      </div>
    </section>
  );
};
export default PurchaseSuccess;
