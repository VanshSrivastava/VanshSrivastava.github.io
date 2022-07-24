import { useState } from "react";
import React from "react";
import { isAuthenticated } from "../auth/helper";
import { cartEmpty, loadCart } from "./helper/carthelper";
import { Link } from "react-router-dom";

const Checkout = ({ products, setReload = (f) => f, reload = undefined }) => {
  const [data, setData] = useState({
    loading: false,
    success: false,
    error: "",
    address: "",
  });

  const token = isAuthenticated() && isAuthenticated().token;
  const userId = isAuthenticated() && isAuthenticated.user._id;

  const getTotalAmount = () => {
    let amount = 0;
    products.map((p) => {
      {
        amount = amount + p.price;
      }
    });
    return amount;
  };

  const showCheckoutButton = () => {
    return isAuthenticated() ? (
      <button className="btn btn-success">Pay Now</button>
    ) : (
      <Link to="/signin">
        <button className="btn btn-warning">Signin</button>
      </Link>
    );
  };


  
  return (
    <div>
      <h3 className="text-white">Checkout ₹{getTotalAmount}</h3>
      {showCheckoutButton()}
    </div>
  );
};
export default Checkout;
