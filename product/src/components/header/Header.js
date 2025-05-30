import React, { useState } from "react";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types"; 

// Import images directly
import accountIcon from "../../asset/images/account.png";
import cartIcon from "../../asset/images/cart.png";
import logoImage from "../../asset/images/shopcart.png";


const Header = ({
  onSearch,
  searchTerm,
  setSearchTerm,
  onCategoryChange,
  selectedCategory,
  cartLength,
  onUserPanelToggle,
  showUserPanel,
  handleUserIdSubmit,
  userId,
  setUserId,
  error,
}) => {
  const navigate = useNavigate();

  const handleSearch = () => {
    if (onSearch) onSearch();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const categories = [
    "All Categories",
    "Computers",
    // "AMAZON FASHION",
    "Cell Phones & Accessories",
    "Camera & Photo",
    "Amazon Home",
    "Home Audio & Theater",
    // "All Electronics",
    "Car Electronics",
    // "Industrial & Scientific",
    "Office Products",
    "Sports & Outdoors",
    // "Tools & Home Improvement",
    "Pet Supplies",
    "GPS & Navigation",
    "All Beauty",
    "Automotive",
    "Health & Personal Care",
    "Amazon Devices",
    // "Portable Audio & Accessories",
    "Musical Instruments",
    "Toys & Games",
    "Video Games",
    "Arts, Crafts & Sewing"
  ];
  
  return (
    <header className="header">
      <div className="logo-section" onClick={() => navigate("/")}>
        <img
          src={logoImage}
          alt="Logo"
          style={{
            maxWidth: "150px",
            maxHeight: "80px",
            width: "auto",
            height: "auto",
          }}
        />
      </div>

      {/* Search Section */}
      <div className="search-container">
        <select
          className="category-dropdown"
          value={selectedCategory}
          onChange={(e) => {
            const newCategory = e.target.value;
            onCategoryChange(newCategory);
          }}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSearch} className="search-button">
          <FaSearch className="search-icon" />
        </button>
      </div>

      {/* Account and Cart Icons */}
      <div className="icons-container">
        <div className="profile-icon" onClick={onUserPanelToggle}>
          <img src={accountIcon} alt="Account" className="account-icon" />
        </div>

        <div className="cart-icon" onClick={() => navigate("/cart")}>
          <img src={cartIcon} alt="Cart" className="cart-icon-img" />
          <span className="cart-count">{cartLength}</span>
        </div>
      </div>

      {/* Sliding panel for entering user ID */}
      {showUserPanel && (
        <div
          className="user-panel"
          style={{
            position: "absolute",  /* Updated to absolute positioning for floating effect */
            top: "60px",           /* Positioned below the account icon */
            right: "20px",         /* Align to the right side of the screen */
            backgroundColor: "#fff",
            opacity: 0.85,
            border: "1px solid #ccc",
            padding: "20px",
            width: "300px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Enter Your User ID</h3>
          <input
            id="userIdInput"
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "14px",
              marginBottom: "15px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <button
              onClick={handleUserIdSubmit}
              className="submit-button"
              style={{
                backgroundColor: "#ffca2c",
                color: "black",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              OK
            </button>
            <button
              onClick={onUserPanelToggle}
              className="cancel-button"
              style={{
                backgroundColor: "#f3f3f3",
                color: "#333",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

// Define PropTypes for validation
Header.propTypes = {
  onSearch: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  cartLength: PropTypes.number.isRequired,
  onUserPanelToggle: PropTypes.func.isRequired,
  showUserPanel: PropTypes.bool.isRequired,
  handleUserIdSubmit: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  setUserId: PropTypes.string.isRequired,
  error: PropTypes.string,
};

export default Header;
