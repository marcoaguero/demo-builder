import React from "react";
import iconImage from "../assets/logo.png"; // Import the icon image
import { Link } from "react-router-dom";
import { useFastSpring } from "../store/FastSpringContext";

const Navbar = () => {
  const { data } = useFastSpring();
  const checkout = () => {
    // Check if window object is defined before using it
    if (
      typeof window !== "undefined" &&
      window.fastspring &&
      window.fastspring.builder
    ) {
      // Push the payload to add the product
      window.fastspring.builder.checkout();
    }
  };

  return (
    <nav
      className="
        navbar navbar-expand-lg navbar-light
        border-bottom
        fixed-top
        bg-light
      "
    >
      <div className="container px-4 px-lg-5">
        <Link to="/" className="navbar-brand">
          <img
            src={iconImage} // Use the imported icon image as the source
            alt="FXLab"
            width="50" // Adjust the width to your desired size
            className="d-inline-block align-top"
          />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 d-flex">
            <li className="nav-item">
              <Link to="/" className="nav-link active" aria-current="page">
                Home
              </Link>
            </li>
          </ul>
          <button onClick={checkout} className="btn btn-outline-dark">
            <i className="bi-cart-fill me-1"></i>
            Cart
            <span className="ms-1" id="order-total">
              {data.originalTotal}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
