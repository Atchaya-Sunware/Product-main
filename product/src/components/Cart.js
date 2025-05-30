import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext"; // Use Cart Context
import "./Cart.css";

const Cart = () => {
  const { cartItems, removeFromCart } = useCart(); // Get cart items and remove function
  const navigate = useNavigate();

  // Calculate Grand Total
  const grandTotal = cartItems.reduce((total, item) => total + item.price, 0);

  return (
    <div className="container my-5">
      <h2>🛒 Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-center">Your cart is empty!</p>
      ) : (
        <table className="cart-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Image</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}.</td>
                <td className="cart-title">{item.title}</td>
                <td>
                  <img src={item.image} alt={item.title} className="cart-img" />
                </td>
                <td>${item.price.toFixed(2)}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            <tr className="grand-total-row">
              <td colSpan="3"><strong>Grand Total</strong></td>
              <td colSpan="2"><strong>${grandTotal.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      )}

      {cartItems.length > 0 && (
        <button className="btn btn-primary mt-3" onClick={() => navigate("/checkout")}>
          Proceed to Checkout
        </button>
      )}
    </div>
  );
};

export default Cart;
