import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../header/Header"; // Imported Header
import Footer from "../footer/footer"; // Assuming Footer is imported properly
import API_BASE_URL from "../../components/config";
import { useCart } from "../CartContext";
import "./Home.css";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // Importing star icons

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState(""); // Sort state
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const userId = localStorage.getItem("userId") || "AEBP4UL76DE4UNTHKU6VE2NQHARA"; // Dynamically set userId from localStorage or any state


  // Styles definition
  const styles = {
    starRating: {
      display: 'flex',
      alignItems: 'center',
    },
    productCard: {
      width: '100%',
      marginBottom: '20px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    cardImgContainer: {
      position: 'relative',
      width: '100%',
      height: '200px',
      overflow: 'hidden',
    },
    productImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    productTitle: {
      fontSize: '12px',
      fontWeight: '500',
      margin: '5px 0',
      padding: '0 10px',
    },
    productPrice: {
      fontSize: '12px',
      color: '#0000FF', // Blue color for price
      marginBottom: '10px',
      padding: '0 10px',
    },
    productInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 10px',
      marginBottom: '10px',
      gap:'10px'
    },
    ratingCount: {
      color: '#888888', // Grey color for the rating count
      fontSize: '14px',
    },
    addToCartBtn: {
      backgroundColor: '#FFD814',
      border: 'none',
      padding: '8px 15px',
      fontSize: '14px',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
  };

  // Render Stars function
  const renderStars = (rating, ratingCount) => {
    if (!rating) return null;

    const fullStars = Math.floor(rating);
    const remainder = rating - fullStars;
    const maxStars = 5;
    let stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} color="#FFC107" />);
    }

    if (remainder >= 0.5) {
      stars.push(<FaStarHalfAlt key="half" color="#FFC107" />);
    }

    while (stars.length < maxStars) {
      stars.push(<FaRegStar key={stars.length} color="#FFC107" />);
    }

    return (
      <div style={styles.starRating}>
        {stars}
        {ratingCount > 0 && <span style={styles.ratingCount}>({ratingCount})</span>}
      </div>
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keywordFromUrl = params.get("keyword");
    if (keywordFromUrl) {
      setSearchKeyword(keywordFromUrl);
    }
  }, [location]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        let response;
        if (searchKeyword && searchKeyword.trim() !== "") {
          response = await axios.get(`${API_BASE_URL}/products/search`, {
            params: { keyword: searchKeyword },
            timeout: 50000,
          });

          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            const filteredProducts = response.data.data.filter(
              (item) => item.product && item.product.title && item.mainImage
            );
            setProducts(filteredProducts);

            if (filteredProducts.length === 0) {
              setError("No products found for your search.");
            }
          } else {
            setProducts([]);
            setError("No results found or invalid data format.");
          }
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("API Error:", error);
        setError("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchKeyword]);

  // Sorting logic
  const sortProducts = (option) => {
    let sortedProducts = [...products];
    if (option === "priceLowHigh") {
      sortedProducts.sort((a, b) => (a.product.price || 0) - (b.product.price || 0));
    } else if (option === "priceHighLow") {
      sortedProducts.sort((a, b) => (b.product.price || 0) - (a.product.price || 0));
    } else if (option === "ratingHighLow") {
      sortedProducts.sort((a, b) => (b.product.averageRating || 0) - (a.product.averageRating || 0));
    } else if (option === "ratingLowHigh") {
      sortedProducts.sort((a, b) => (a.product.averageRating || 0) - (b.product.averageRating || 0));
    }
    setProducts(sortedProducts);
    setSortOption(option);
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    const searchParams = new URLSearchParams(location.search);
    if (keyword && keyword.trim() !== "") {
      searchParams.set("keyword", keyword);
    } else {
      searchParams.delete("keyword");
    }

    const newUrl = `${location.pathname}${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
    navigate(newUrl, { replace: true });
  };

  const handleViewProduct = (productId) => {
    if (productId) {
      // Include userId in the navigation URL
      navigate(`/viewProduct?asin=${(productId)}&keyword=${(searchKeyword)}&userId=${(userId)}`);
    }
  };
  
  

  const handleAddToCart = (product) => {
    addToCart({
      productId: product.productId,
      title: product.title,
      price: product.price,
    });
  };

  return (
    <div className="home-container">
      {/* Integrated Header Component */}
      <Header
        onSearch={handleSearch}
        searchTerm={searchKeyword}
        setSearchTerm={setSearchKeyword}
        onCategoryChange={() => {}} // Add your category change logic here
        selectedCategory="All Categories" // Update based on selected category
        cartLength={0} // Update with actual cart length
        onUserPanelToggle={() => {}} // Add user panel toggle logic
        showUserPanel={false} // Set as true or false depending on user panel state
        handleUserIdSubmit={() => {}} // User ID submit logic
        userId={userId} // Set userId dynamically
        error={null} // Error state if needed
      />

      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            {searchKeyword && searchKeyword.trim() !== "" ? (
              <h3 className="mb-4 search-heading">Search Results for: "{searchKeyword}"</h3>
            ) : (
              <div className="row product_sec product_head mt-3">
                <h3>Featured Products</h3>
              </div>
            )}

            {/* Sorting Dropdown */}
            <div className="sort-container">
              <label>Sort by:</label>
              <select value={sortOption} onChange={(e) => sortProducts(e.target.value)}>
                <option value="">Select</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
                <option value="ratingHighLow">Rating: High to Low</option>
                <option value="ratingLowHigh">Rating: Low to High</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-5 loader-container">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading products...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <div className="products-grid">
                {products.length === 0 ? (
                  <div className="alert alert-info">
                    {searchKeyword && searchKeyword.trim() !== ""
                      ? `No products found for "${searchKeyword}". Try a different search term.`
                      : "No products available."}
                  </div>
                ) : (
                  products.map((productItem, index) => {
                    const { product, allImages, mainImage } = productItem;
                    const displayImage =
                      mainImage || (allImages && allImages.length > 0 ? allImages[0] : "https://via.placeholder.com/200");

                    return (
                      <div key={product.parentAsin || index} className="product-card" onClick={() => handleViewProduct(product.parentAsin)}>
                        <div className="card-img-container">
                          <img className="card-img-top" src={displayImage} alt={product.title} />
                        </div>
                        <div className="card-body">
                          <h5 className="card-title">{product.title}</h5>
                          {/* Price first, then rating and count in grey */}
                          <div style={styles.productInfo}>
                            <p className="card-price" style={{ margin: 0 }}>
                              {product.price ? `$${product.price}` : "Price Unavailable"}
                            </p>
                            <p className="text-warning" style={{ margin: 0 }}>
                              {renderStars(product.averageRating, product.ratingNumber)}
                            </p>
                          </div>
                          <button
                            className="btn btn-warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
