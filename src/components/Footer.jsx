import React from "react";

const Footer = (props) => {
  const year = new Date().getFullYear();
  return (
    <footer className="py-5 bg-dark">
      <div className="container">
        <p className="m-0 text-center text-white">
          Copyright &copy; FXLab {year}
        </p>
      </div>
    </footer>
  );
};
export default Footer;
