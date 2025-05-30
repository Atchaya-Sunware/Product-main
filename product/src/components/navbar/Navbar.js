import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";  // Add this import at the top
import logoImage from "../../asset/images/shopcart.png"; // Updated logo import


const Navbar = ({ onSearch, initialSearchValue, categories=[], onCategorySelect, selectedCategory }) => {
  const [searchKeyword, setSearchKeyword] = useState(initialSearchValue || "");
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const categoriesDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Update local state when prop changes
  useEffect(() => {
    setSearchKeyword(initialSearchValue ||"");
  }, [initialSearchValue]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchKeyword); // Call the search handler passed as prop
    }
  };
  
  const handleCategorySelect = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
    setShowCategoriesDropdown(false); // Close dropdown after selection
  };

  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/"); // Navigate to the landing page when the logo is clicked
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(initialSearchValue);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target)) {
        setShowCategoriesDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

   // Handle input change explicitly
   const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
  };


  return (

    
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        <div className="logo-section" onClick={handleLogoClick}>
          <img src={logoImage} alt="Shop Cart" className="nav-logo" />
        </div>
        
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
        
        
          
          <form className="d-flex search-form ms-auto me-3" onSubmit={handleSearchSubmit}>
            <div className="input-group">
            <input
                ref={searchInputRef}
                className="form-control search-input"
                type="text"
                placeholder="Search"
                aria-label="Search"
                value={searchKeyword}
                onChange={handleInputChange}
                style={{
                  borderRadius: "25px 0 0 25px",
                  border: "1px solid #ccc",
                  paddingLeft: "15px",
                  height: "38px",
                  zIndex: "1",
                  position: "relative"
                }}
              />
              <button 
                className="btn search-btn" 
                type="submit"
                style={{
                  backgroundColor: "#E73C17",
                  color: "white",
                  borderRadius: "0 25px 25px 0",
                  border: "none",
                  padding: "6px 15px",
                  zIndex: "1",
                  position: "relative"
                }}
              >
                Search
              </button>
            </div>
          </form>
          <div className="nav-icon-group d-flex">
            <Link className="nav-link me-3" to="/account">
              <span>Account</span>
            </Link>
            <Link className="nav-link position-relative" to="/cart">
              <span>Cart </span>
              <span 
                className="badge rounded-pill"
                style={{
                  backgroundColor: "#sandal",
                  fontSize: "0.75rem"
                }}
              >
                0
              </span>
            </Link>
          </div>
        </div>
     
    </nav>
  );
};

export default Navbar;