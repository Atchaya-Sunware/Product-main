import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
// import Navbar from "./navbar/Navbar";
import Header from "./header/Header"
import Footer from "./footer/footer";
import API_BASE_URL from "./config";
import Slider from "react-slider";
import { useCart } from "./CartContext.js";

const CACHE_KEY_PREFIX = "amazon_clone_";

const SearchResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchKeyword = queryParams.get("keyword") || "";
  const priceRangeFromUrl = queryParams.get("priceRange") ? JSON.parse(queryParams.get("priceRange")) : [0, 1000];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState(priceRangeFromUrl);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortOption, setSortOption] = useState("lowToHigh");
  // Add these state variables to your SearchResult component:
const [searchTerm, setSearchTerm] = useState(searchKeyword);
const [selectedCategory, setSelectedCategory] = useState("All Categories");
const [showUserPanel, setShowUserPanel] = useState(false);
const [userId, setUserId] = useState("AEBP4UL76DE4UNTHKU6VE2NQHARA"); // Default user ID
const { cart = [] } = useCart(); // You'll need to import useCart

// Add these handler functions:
const handleCategoryChange = (category) => {
  setSelectedCategory(category);
};

const handleUserPanelToggle = () => {
  setShowUserPanel(prevState => !prevState);
};

const handleUserIdSubmit = () => {
  const inputUserId = document.getElementById('userIdInput').value.trim();
  if (inputUserId) {
    setUserId(inputUserId);
    setShowUserPanel(false);
  }
};

const handleUserIdChange = (id) => {
  setUserId(id);
};

  // Simplified cache management functions
  const getCacheKey = (keyword, priceRange) => {
    return `${CACHE_KEY_PREFIX}search_${keyword}_${JSON.stringify(priceRange)}`;
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const saveToCache = (key, data) => {
    localStorage.setItem(key, JSON.stringify({
      timestamp: Date.now(),
      data: data
    }));
  };

  const getFromCache = (key) => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const parsedCache = JSON.parse(cached);
    // Cache valid for 30 minutes
    if (Date.now() - parsedCache.timestamp > 30 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsedCache.data;
  };

  // Load products from API or cache
  useEffect(() => {
    if (!searchKeyword || searchKeyword.trim() === "") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const cacheKey = getCacheKey(searchKeyword, priceRange, userId);


    axios
    .get(`${API_BASE_URL}/products/search`, {
      params: { 
        keyword: searchKeyword, 
        priceRange: JSON.stringify(priceRange),
        userId: userId // Include userId in the API request if needed
      },
      timeout: 10000,
    })
      .then((response) => {
        if (response.data && response.data.data) {
          let filteredProducts = response.data.data.filter((item) => {
            const titleMatch =
              item.product.title && item.product.title.toLowerCase().includes(searchKeyword.toLowerCase());
            const descMatch =
              item.product.description && item.product.description.toLowerCase().includes(searchKeyword.toLowerCase());
            const brandMatch =
              item.brand?.brandName && item.brand.brandName.toLowerCase().includes(searchKeyword.toLowerCase());
            const categoryMatch =
              item.category?.categoryName && item.category.categoryName.toLowerCase().includes(searchKeyword.toLowerCase());

            const hasImage = item.mainImage && item.mainImage !== "https://via.placeholder.com/200";
            return (
              (titleMatch || descMatch || brandMatch || categoryMatch) &&
              hasImage &&
              item.product.price >= priceRange[0] &&
              item.product.price <= priceRange[1]
            );
          });

          setProducts(filteredProducts);
          saveToCache(getCacheKey(searchKeyword, priceRange), filteredProducts);
        } else {
          setProducts([]);
        }
        setLoading(false);
        setHasSearched(true);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
        setError("Failed to load search results. Please try again.");
        setProducts([]);
        setLoading(false);
        setHasSearched(true);
      });
  }, [searchKeyword, priceRange]);

    // Sorting logic
    const sortedProducts = [...products].sort((a, b) => {
      if (sortOption === "lowToHigh") return a.product.price - b.product.price;
      if (sortOption === "highToLow") return b.product.price - a.product.price;
      if (sortOption === "ratingHighToLow") return b.product.averageRating - a.product.averageRating;
      if (sortOption === "ratingLowToHigh") return a.product.averageRating - b.product.averageRating;
      return 0;
    });

  // Handle search function for Navbar
  const handleSearch = (searchTerm) => {
    if (searchTerm && searchTerm.trim() !== "") {
      navigate(`/search?keyword=${encodeURIComponent(searchTerm)}&priceRange=${JSON.stringify(priceRange)}`);
    }
  };

 

  // Handle view product click
  const handleViewProduct = (productId) => {
    if (productId) {
      navigate(`/viewProduct?asin=${(productId)}&keyword=${(searchKeyword)}&priceRange=${JSON.stringify(priceRange)}&userId=${userId}`);
    }
  };


  return (
    <div>
      <Header
  onSearch={handleSearch}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  onCategoryChange={handleCategoryChange}
  selectedCategory={selectedCategory}
  cartLength={cart.length}
  onUserPanelToggle={handleUserPanelToggle}
  showUserPanel={showUserPanel}
  handleUserIdSubmit={handleUserIdSubmit}
  userId={userId}
  setUserId={handleUserIdChange}
  error={error}
/>
      <div className="container my-5">
        <h2>Search Results for: {searchKeyword}</h2>

        <div className="sort-container">
          <label htmlFor="sort">Sort by: </label>
          <select id="sort" value={sortOption} onChange={handleSortChange}>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
            <option value="ratingHighToLow">Rating: High to Low</option>
            <option value="ratingLowToHigh">Rating: Low to High</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading search results...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            {error}
          </div>
        ) : (
          <div className="row">
            {products.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info">
                  {hasSearched ? (
                    <div>
                      No products found for "{searchKeyword}". Try a different search term.
                    </div>
                  ) : (
                    <div>
                      Failed to load products. Please try again.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              products.map((productItem) => {
                const { product, category, store, mainImage } = productItem;

                // Skip rendering if product is missing or doesn't have a valid image
                if (!product || !product.parentAsin || !mainImage) return null;

                return (
                  <div key={product.parentAsin} className="col-12 col-sm-6 col-md-4 col-lg-3 my-3">
                    <div
                      className="card h-100"
                      onClick={() => handleViewProduct(product.parentAsin)}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        className="card-img-top"
                        src={mainImage || "https://via.placeholder.com/200"}
                        alt={product.title || "Product"}
                        style={{ height: "200px", objectFit: "contain", padding: "10px" }}
                      />
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{product.title || "Unknown Product"}</h5>
                        <p className="text-muted">{category?.categoryName || "Uncategorized"}</p>
                        <div className="d-flex justify-content-between">
                          {product.averageRating && <span>⭐1 {product.averageRating.toFixed(1)}</span>}
                        </div>
                        <div className="mt-auto d-flex justify-content-between align-items-center">
                          <h5 className="m-0">
                            {product.price ? `$${product.price.toFixed(2)}` : "N/A"}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      <Footer />

      <style>
        {`
          .sort-container {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .sort-container label {
            font-weight: 500;
          }
          
          .sort-container select {
            padding: 5px;
            font-size: 16px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }

          .card {
            transition: transform 0.3s ease-in-out;
          }

          .card:hover {
            transform: scale(1.05);
          }
        `}
      </style>

    </div>
  );
};

export default SearchResult;