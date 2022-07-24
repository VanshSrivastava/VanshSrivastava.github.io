import React from "react";
import { API } from "../../backend";

const Imagehelper = ({ product }) => {
  const imageurl = product
    ? `${API}/product/photo/${product._id}`
    : "https://stores.lifestylestores.com/VendorpageTheme/Enterprise/EThemeForLifestyleUpdated/images/product-not-found.jpg";
  return (
    <div className="rounded border border-success p-2">
      <img
        src={imageurl}
        alt="photo"
        style={{ maxHeight: "100%", maxWidth: "100%" }}
        className="mb-3 rounded"
      />
    </div>
  );
};

export default Imagehelper;
