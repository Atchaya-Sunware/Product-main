import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "./CartContext";
import API_BASE_URL from "./config";
import Slider from "react-slick";
import './ViewProduct.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaStar, FaStarHalfAlt, FaRegStar, FaChevronLeft, FaChevronRight, FaInfoCircle } from "react-icons/fa";
import Header from "./header/Header";
import Footer from "./footer/footer";
import Recommendation from "./Recommendation";
import Swal from 'sweetalert2';  // SweetAlert2 for modal
import {showBrandCategoryInfo} from "./BrandCategoryRecommendation"; // Import the new component
import UserRecommInfo from './UserRecommInfo'; // Adjust based on your actual file structure
import { showUserRecommInfo } from './UserRecommInfo'; // Import UserRecommInfo function


const CACHE_KEY_PREFIX = "amazon_clone_";

const ViewProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const parentAsin = queryParams.get("asin");
  const { addToCart, cart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showUserPanel, setShowUserPanel] = useState(false);
  // With this code that checks URL first, then localStorage, then default:
  const [userId, setUserId] = useState(() => {
    const urlUserId = queryParams.get("userId");
    if (urlUserId) {
      // If userId is in URL, save it to localStorage and use it
      localStorage.setItem('amazon_clone_userId', urlUserId);
      return urlUserId;
    }
    return localStorage.getItem('amazon_clone_userId') || "1234"; // Fallback to localStorage or default
  });
  
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState({ data: [], loading: true });
  const [storeRecommendations, setStoreRecommendations] = useState({ data: [], loading: true });
  const [userRecommendations, setUserRecommendations] = useState({ data: [], loading: true });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userRecommendationsStartTime, setUserRecommendationsStartTime] = useState(0);
  
  // Performance tracking
  const [perfMetrics, setPerfMetrics] = useState({
    productLoadTime: null,
    recommendationsLoadTime: null,
    storeRecommendationsLoadTime: null,
    userRecommendationsLoadTime: null
  });

  // Function to prefetch product data
  const prefetchProductData = (asin) => {
    if (!asin) return;
    axios.get(`${API_BASE_URL}/products/product/${asin}`, { timeout: 5000 })
      .catch(() => {});
  };
 
  // Define the fetchUserRecommendations function at component level so it's available everywhere
  const fetchUserRecommendations = (userId, productId) => {
    return axios.get(`${API_BASE_URL}/users/userBasedRecomm`, {
      params: {
        userId: userId,
        currentProductId: productId
      },
      timeout: 10000
    })
    .then((userResponse) => {
      console.log("User recommendations response:", userResponse);
      
      // Process user recommendations
      // let userRecommendedProducts = [];
      
      // if (userResponse && Array.isArray(userResponse.data)) {
      const  userRecommendedProducts = userResponse.data.map(item => ({
          parentAsin: item.productId,
          title: item.title,
          price: item.price,
          averageRating: item.averageRating,
          ratingNumber: item.ratingNumber,
          image: item.mainImage,
          mainImage: item.mainImage,
          allImages: item.allImages || [],
          sharedUserCount: item.sharedUserCount
        }));
      // }
      setUserRecommendations({ data: userRecommendedProducts, loading: false });
      return userRecommendedProducts;
    })
    .catch((error) => {
      console.error("Error fetching user recommendations:", error);
      setUserRecommendations({ data: [], loading: false, error: error.message });
      return [];
    });
  };

  useEffect(() => {
    if (!parentAsin) {
        setErrorMessage("Invalid Product ID.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setErrorMessage(null);
    setRecommendations({ data: [], loading: true });
    setStoreRecommendations({ data: [], loading: true });
    setUserRecommendations({ data: [], loading: true });

    const productStartTime = performance.now();
    const recommendationsStartTime = performance.now();
    const storeRecommendationsStartTime = performance.now();
    setUserRecommendationsStartTime(performance.now());

    // Fetch product details
    axios.get(`${API_BASE_URL}/products/product/${parentAsin}`, { timeout: 8000 })
      .then((response) => {
        console.log("Product response: ", response);
        if (!response.data || !response.data.data || response.data.data.message === "Product not found") {
          throw new Error("Product not found.");
        }
        
        const productData = response.data.data;
        setProduct(productData);
        setLoading(false);

        const productEndTime = performance.now();
        setPerfMetrics(prev => ({
          ...prev, 
          productLoadTime: (productEndTime - productStartTime).toFixed(2)
        }));

        // Return the product data for the next promise
        return productData;
      })
      .then((productData) => {
        // Fetch brand/category based recommendations
        if (productData.brand?.brandName && productData.category?.categoryName && productData.product.features) {
          console.log("Fetching brand recommendations for:", productData.brand.brandName, productData.category.categoryName);
          
          return axios.get(`${API_BASE_URL}/brands/brandOnly`, {
            params: {
              brandName: productData.brand.brandName,
              categoryName: productData.category.categoryName,
              currentProductId: parentAsin
                        },
            timeout: 10000
          })
          .then((brandResponse) => {
            console.log("Brand recommendations response:", brandResponse);

            // Process brand recommendations
            let recommendedProducts = [];
            
            if (brandResponse.data && Array.isArray(brandResponse.data.data)) {
              recommendedProducts = brandResponse.data.data;
            } else if (brandResponse.data && brandResponse.data.data) {
              recommendedProducts = brandResponse.data.data;
            }
            
            const recommendationsEndTime = performance.now();
            setPerfMetrics(prev => ({
              ...prev, 
              recommendationsLoadTime: (recommendationsEndTime - recommendationsStartTime).toFixed(2)
            }));

            setRecommendations({
              data: recommendedProducts,
              loading: false
            });
            
            // Return productData for next chain
            return productData;
          })
          .catch((error) => {
            console.error("Error fetching brand recommendations:", error);
            setRecommendations({ 
              data: [], 
              loading: false,
              error: error.message 
            });
            
            // Still return productData for next chain even if this request fails
            return productData;
          });
        }
        
        // If no brand/category, still return productData for next chain
        setRecommendations({ data: [], loading: false });
        return productData;
      })
      .then((productData) => {
        fetchUserRecommendations(userId, parentAsin); // Fetch user recommendations after product data
        return productData;
      })
      .catch((error) => {
        setErrorMessage(error.message || "Failed to fetch product details.");
        setLoading(false);
      });
  }, [parentAsin, userId]);
      

  useEffect(() => {
    console.log('User Recommendations:', userRecommendations);
  }, [userRecommendations]);
  
  // Updated handleSearch function in ViewProduct.js
const handleSearch = (searchTerm) => {
  if (searchTerm && searchTerm.trim() !== "") {
    navigate(`/search?keyword=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(selectedCategory || "All Categories")}`);
  }
};
  
  // Updated handleCategoryChange function
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === "All Categories") {
      navigate("/"); // Navigate to landing page when "All Categories" is selected
    }
  };

  const handleUserPanelToggle = () => {
    setShowUserPanel(prevState => !prevState);
  };

  const handleUserIdSubmit = () => {
    const inputUserId = document.getElementById('userIdInput').value.trim();
    if (inputUserId) {
      setUserId(inputUserId);
      localStorage.setItem('amazon_clone_userId', inputUserId);
      setShowUserPanel(false);
      
      // Now the fetchUserRecommendations function is accessible here
      fetchUserRecommendations(inputUserId, parentAsin);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      // Add the current product to the cart
      addToCart({
        id: product.product.parentAsin || parentAsin,
        title: product.product.title,
        price: product.product.price,
        image: product.mainImage || "https://via.placeholder.com/200",
        brandName: product.brand?.brandName || "Unknown",
        storeName: product.store?.storeName || "Unknown",
      });
    }
  };

  // Render stars helper function with rating count
  const renderStars = (averageRating, ratingNumber) => {
    if (!averageRating) return null;

    const fullStars = Math.floor(averageRating);
    const remainder = averageRating - fullStars;
    const maxStars = 5;
    let stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} color="#FFC107" />);
    }

    if (remainder >= 0.5) {
      stars.push(<FaStarHalfAlt key="half" color="#FFC107" />);
    }

    while (stars.length < maxStars) {
      stars.push(<FaRegStar key={`empty-${stars.length}`} color="#FFC107" />);
    }

    return (
      <div className="stars-container">
        <div className="stars" style={{ display: 'flex', alignItems: 'center' }}>
          {stars}
          <span style={{ marginLeft: '8px', fontSize: '12px', color: '#757575' }}>({ratingNumber})</span>
        </div>
      </div>
    );
  };

  // Pre-load images once product data is available
  useEffect(() => {
    if (product && Array.isArray(product.allImages)) {
      // Preload the first image immediately
      if (product.allImages[0]) {
        const img = new Image();
        img.src = product.allImages[0];
      }
      
      // Preload remaining images with a slight delay
      setTimeout(() => {
        product.allImages.slice(1).forEach(imgUrl => {
          if (imgUrl) {
            const img = new Image();
            img.src = imgUrl;
          }
        });
      }, 200);
    }
  }, [product]);

  // Handle image click
  const handleImageClick = (newAsin) => {
    if (newAsin !== parentAsin) {
      window.open(`/viewProduct?asin=${encodeURIComponent(newAsin)}`, '_blank');
    }
  };

  if (loading) return (
    <div>
      <Header 
        onSearch={handleSearch} 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory}
        cartLength={cart?.length || 0}
        onUserPanelToggle={handleUserPanelToggle}
        showUserPanel={showUserPanel}
        handleUserIdSubmit={handleUserIdSubmit}
        userId={userId}
        setUserId={setUserId}
        error={null}
      /> 
      <div className="container my-5">
        <p className="text-center mt-5">Loading product details...</p>
      </div>
      <Footer />
    </div>
  );
  
  if (errorMessage) return (
    <div>
      <Header 
        onSearch={handleSearch} 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory}
        cartLength={cart?.length || 0}
        onUserPanelToggle={handleUserPanelToggle}
        showUserPanel={showUserPanel}
        handleUserIdSubmit={handleUserIdSubmit}
        userId={userId}
        setUserId={setUserId}
        error={errorMessage}
      />
      <div className="container my-5">
        <p className="text-center mt-5">{errorMessage}</p>
      </div>
      <Footer />
    </div>
  );
  
  if (!product || !product.product) return (
    <div>
      <Header 
        onSearch={handleSearch} 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory}
        cartLength={cart?.length || 0}
        onUserPanelToggle={handleUserPanelToggle}
        showUserPanel={showUserPanel}
        handleUserIdSubmit={handleUserIdSubmit}
        userId={userId}
        setUserId={setUserId}
        error={null}
      />
      <div className="container my-5">
        <p className="text-center mt-5">No product details available.</p>
      </div>
      <Footer />
    </div>
  );
  
  const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div 
        className={className}
        style={{ 
          ...style, 
          display: "block", 
          background: "rgba(20, 19, 19, 0.2)",
          borderRadius: "50%",
          padding: "-0px 10px",
          zIndex: 10,
          color: "black",
          fontSize: "20px",
          width: "40px",
          height: "43px",
          left: "-20px",
          cursor: "pointer"
        }}
        onClick={onClick}
      >
        <FaChevronLeft />
      </div>
    );
  };
  
  const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div 
        className={className}
        style={{ 
          ...style, 
          display: "block", 
          background: "rgba(20, 19, 19, 0.2)",
          borderRadius: "50%",
          padding: "5px 0px",
          zIndex: 10,
          color: "black",
          fontSize: "20px",
          width: "40px",
          height: "43px",
          right: "-20px",
          cursor: "pointer"
        }}
        onClick={onClick}
      >
        <FaChevronRight />
      </div>
    );
  };

  // Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    lazyLoad: 'ondemand',
    nextArrow:<NextArrow />,
    prevArrow: <PrevArrow />,
  };

  // Carousel settings for recommendations
  const recommendationSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    lazyLoad: 'ondemand',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div>
      <Header 
        onSearch={handleSearch} 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory}
        cartLength={cart?.length || 0}
        onUserPanelToggle={handleUserPanelToggle}
        showUserPanel={showUserPanel}
        handleUserIdSubmit={handleUserIdSubmit}
        userId={userId}
        setUserId={setUserId}
        error={null}
      />
      <div className="container my-5" style={{ paddingTop: "50px", marginBottom: "50px" }}>
        {perfMetrics.productLoadTime && (
          <div className="text-muted small mb-2">
            {/* Product loaded in: {perfMetrics.productLoadTime}ms | 
            Recommendations loaded in: {perfMetrics.recommendationsLoadTime || "loading..."}ms |
            Store recommendations loaded in: {perfMetrics.storeRecommendationsLoadTime || "loading..."}ms */}
          </div>
        )}
        
        <div className="row">
          {/* Product Image Slider */}
          <div className="col-md-6">
            <Slider {...settings}>
              {Array.isArray(product.allImages) && product.allImages.length > 0
                ? product.allImages.map((img, index) => (
                    <div key={index}>
                      <img
                        src={img}
                        alt={`Product Image ${index}`}
                        className="img-fluid"
                        style={{
                          maxWidth: "95%",
                          height: "auto"
                        }}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  ))
                : <img src="https://via.placeholder.com/400" alt="No Image Available" className="img-fluid" />}
            </Slider>
          </div>

          {/* Product Details */}
          <div className="col-md-6">
            <h1 style={{ fontSize: "200%", fontWeight: 400, marginBottom: '10px'}}>{product.product?.title || "No Title Available"}</h1>
            <h3 className="text-success" style={{fontSize:"140%", color:'rgb(4 3 3) !important'}}>
              {product.product?.price ? `$${product.product.price}` : "N/A"}
            </h3>
            <div className="d-flex align-items-center mb-3">
              {renderStars(product.product?.averageRating, product.product?.ratingNumber)}
            </div>
            <p><strong>Brand:</strong> {product.brand?.brandName || "Unknown"}</p>
            <p><strong>Category:</strong> {product.category?.categoryName || "Uncategorized"}</p>
            <p><strong>Store:</strong> {product.store?.storeName || "N/A"}</p>
            <button className="btn btn-warning mt-3" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>

        <div>
          <h3>About This Item</h3>
          {product.product?.features
            ? product.product.features.split('[').map((item, index) => (
                <li key={index}>{item.replace(']', '').trim()}</li>
              ))
            : <p>No additional details available</p>}
        </div>

        {/* Brand and Category based Recommendations */}
        {recommendations.data && recommendations.data.length > 0 && (
          <div className="recomm mt-5">
            <h2 style={{ display: 'flex', alignItems: 'center' }}>
              Similar Products
              <div
                title="How recommendations work"
                style={{
                  width: '25px',
                  height: '25px',
                  borderRadius: '50%',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginLeft: '10px'
                }}
                onClick={() => showBrandCategoryInfo(recommendations)}
              >
                i
              </div>
            </h2>
            <Recommendation recommendations={recommendations} onPrefetch={prefetchProductData} />
          </div>
        )}
{/* Recommended For You Section */}
{userRecommendations.data && userRecommendations.data.length > 0 && (
  <div className="recomm mt-5">
    <h2 style={{ display: 'flex', alignItems: 'center' }}>
      Recommended for you
      <div
        title="How user recommendations work"
        style={{
          width: '25px',
          height: '25px',
          borderRadius: '50%',
          backgroundColor: '#219EBC',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '16px',
          marginLeft: '10px'
        }}
        onClick={() => showUserRecommInfo(userRecommendations.data)}
      >
        i
      </div>
    </h2>
    <Recommendation 
      recommendations={userRecommendations} 
      onPrefetch={prefetchProductData}
      isUserBased={true}
    />
  </div>
)}

        
      </div>
      <Footer />
    </div>
  );
};

export default ViewProduct;