import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "./navbar/Navbar.js"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useCart } from "./CartContext.js";
import "./LandingPage.css";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import { FaSearch } from "react-icons/fa";
import { FaStar, FaStarHalfAlt, FaRegStar,FaInfoCircle } from "react-icons/fa";
import Header from "../components/header/Header.js";  // Make sure this path is correct
import prevArrow from "../../src/asset/images/left-arrow.png"
import nextArrow from "../../src/asset/images/right-arrow.png"
import Information from './Information.js';
import { showHybridInfo } from './Hybrid.js';
import ReactDOM from 'react-dom/client';
import Footer from "./footer/footer"; // Ensure this import is correct



const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "block",
        backgroundImage: `url(${prevArrow})`, // Replace with the correct path to your left arrow image
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "40px",
        height: "40px",
        zIndex: 10,
      }}
      onClick={onClick}
    />
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
        backgroundImage: `url(${nextArrow})`, // Replace with the correct path to your right arrow image
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "40px",
        height: "40px",
        zIndex: 10,
      }}
      onClick={onClick}
    />
  );
};


const requireImages = (category) => {
  // Normalize the category to match folder naming convention
  const normalizedCategory = category
    .toLowerCase()
    .replace(/[&\s]/g, '') // Remove spaces and & 
    .replace(/\s+/g, '');

  const context = require.context('../asset/images', true, /\.(png|jpg|jpeg)$/);
  const images = [];

  // Check if the category exists and match images
  context.keys().forEach((key) => {
    // Convert the key to lowercase and remove spaces for comparison
    const normalizedKey = key
      .toLowerCase()
      .replace(/[&\s]/g, '')
      .replace(/\s+/g, '');

    // Check if the normalized key includes the normalized category
    if (normalizedKey.includes(normalizedCategory)) {
      images.push(context(key)); // Push the matched image path into the array
    }
  });

  return images;
};

// Category-specific images - dynamically loaded
const categoryImages = {
  "All Categories": requireImages("AllCategories"),
  "Computers": requireImages("Computers"),
  // "AMAZON FASHION": requireImages("Fashion"),
  "Cell Phones & Accessories": requireImages("CellPhones"),
  "Camera & Photo": requireImages("Camera"),
  "Amazon Home": requireImages("Home"),
  "Home Audio & Theater": requireImages("Audio"),
  "All Electronics": requireImages("Electronics"),
  "Car Electronics": requireImages("CarElectronics"),
  // "Industrial & Scientific": requireImages("Industrial"),
  "Office Products": requireImages("Office"),
  "Sports & Outdoors": requireImages("Sports"),
  // "Tools & Home Improvement": requireImages("Tools"),
  "Pet Supplies": requireImages("Pets"),
  "GPS & Navigation": requireImages("GPS"),
  // "All Beauty": requireImages("Beauty"),
  "Automotive": requireImages("Automotive"),
  "Health & Personal Care": requireImages("Health"),
  // "Amazon Devices": requireImages("Devices"),
  // "Portable Audio & Accessories": requireImages("Audio"),
  "Musical Instruments": requireImages("Music"),
  "Toys & Games": requireImages("Toys"),
  "Video Games": requireImages("VideoGames"),
  "Arts, Crafts & Sewing": requireImages("ArtsCrafts")
};


const ProductCard = ({ product, rank, onMouseOver, navigate, onAddToCart, userId }) => {
  let productUrl = `/viewProduct?asin=${product.productId}`;
  if (userId && userId !== "undefined") {
    productUrl += `&userId=${userId}`;
  }

    // Handle the click event
    const handleClick = () => {
      // Open the product URL in a new tab
      window.open(productUrl, '_blank');
    };
  

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking Add to Cart
    onAddToCart(product);
  };
  return (
<div className="product-card" onClick={handleClick} onMouseOver={() => onMouseOver(product.productId)}>
      <div className="product-image-container" style={{ position: 'relative', height: '200px' }}>
        {product.mainImage && product.mainImage.trim() !== "" && (
          <img 
            src={product.mainImage} 
            alt={product.title} 
            className="product-image"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} // Image will fill the container
          />
        )}
      </div>

      <div className="product-details" style={{padding:'45px 0px'}}>
        <div className="product-title" style={{ fontSize: '14px', fontWeight:'500px' }}>
        {product.title}
          <span className="rank-badge">{rank}</span>
          <FaInfoCircle className="info-icon" title={`Ranked ${rank} based on average rating and user count`} />
        </div>

        {/* Align price and rating in the same line with some space in between */}
        <div className="product-price-rating" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <p className="product-price" style={{ fontSize: '18px', color: 'rgb(4, 6, 151)', marginRight: '10px' }}>
            {`$${(product.price || 0).toFixed(2)}`}
          </p>
          <div className="product-rating" style={{ display: 'flex', alignItems: 'center' ,fontSize:'120%'}}>
            {product.averageRating ? renderStars(product.averageRating, product.ratingNumber) : "No ratings"}
          </div>
        </div>

        <button className="add-to-cart-button" onClick={handleAddToCart} style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgb(255, 202, 44)', color: 'black', border: 'none', borderRadius: '5px', width: '100%' }}>
          Add to Cart
        </button>
      </div>
    </div>
  );
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
    stars.push(<FaRegStar key={stars.length} color="#FFC107" />);
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

// Helper function to check if a product has all required fields
const isProductComplete = (product) => {
  return (
    product.productId &&
    product.title &&
    product.price !== undefined &&
    product.mainImage &&
    product.ratingNumber&& // Include ratingNumber from response
    product.brandName &&
    product.storeName &&
    product.averageRating !== undefined
  );
}

const LandingPage = () => {
  const DEFAULT_USER_ID = "AEBP4UL76DE4UNTHKU6VE2NQHARA";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [carouselImages, setCarouselImages] = useState(categoryImages["All Categories"]);
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToCart, cart = [] } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hybridRecommendations, setHybridRecommendations] = useState([]);
  const [hybridLoading, setHybridLoading] = useState(false);
  const [hybridError, setHybridError] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);


  const navigate = useNavigate();

    // Make sure the userId is valid before passing it to components
    const getValidUserId = () => {
      return userId && userId !== "undefined" ? userId : DEFAULT_USER_ID;
    };

  const paginationStyle = {
    position: 'absolute',
    right: '20px',
    bottom: '10px',
    fontSize: '14px',
    color: '#000',
    // fontWeight: '500',
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Build the base search URL with keyword and category
      let searchUrl = `/home?keyword=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(selectedCategory)}`;
      
      // Add userId to the search URL if available
      if (userId && userId !== "undefined") {
        searchUrl += `&userId=${encodeURIComponent(userId)}`;
      }
      
      // Navigate to the search URL
      navigate(searchUrl);
    }
  };

  // //  Fetch recommendations and category products when userId changes
  // useEffect(() => {
  //  fetchAllData();
  // }, [userId,selectedCategory]); 


  // Unified function to fetch all data based on user ID
  const fetchAllData = () => {
    fetchCategoryProducts(selectedCategory);
    fetchPersonalRecommendations();
    fetchHybridRecommendations();
  };

  const handleViewProduct = (productId) => {
    navigate(`/viewProduct?asin=${productId}&userId=${userId}`);
  };

  const fetchCategoryProducts = (category) => {
    setLoading(true);
    setError(null);
    
    // If "All" is selected, use the getAllProducts endpoint
    const endpoint = category === "All Categories" 
      ? "http://localhost:9005/api/products/all"
      : `http://localhost:9005/api/products/getAllCategory?categoryName=${encodeURIComponent(selectedCategory)}`;
    
    fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        return response.json();
      })
      .then((data) => {
        // Assuming the response is wrapped in a 'data' key
        const productsData = data.data || [];
        console.log("Received category products:", productsData);
        
         // Filter out incomplete products
         const transformedProducts = productsData
         .map(item => ({
           productId: item.product?.parentAsin || item.product?.productId,
           title: item.product?.title,
           price: item.product?.price,
           averageRating: item.product?.averageRating,
           ratingNumber: item.product?.ratingNumber, // Include ratingNumber here
           brandName: item.brand?.brandName,
           storeName: item.store?.storeName,
           mainImage: item.mainImage || "/images/placeholder.png"
         }))
         .filter(isProductComplete);
       
       setCategoryProducts(transformedProducts);
      })
      .catch((err) => {
        console.error("Error fetching category products:", err);
        setError("Failed to load products. Please try again.");
        setCategoryProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchPersonalRecommendations = (inputUserId = userId) => {
    if (inputUserId) {
      setHybridLoading(true);
      setHybridError(null);
      
      console.log(`Fetching personal recommendations for user: ${inputUserId}`)
      
      fetch(`http://localhost:9005/api/users/personalRecomm?user_id=${inputUserId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }
        return response.json();
      })
      .then((data) => {
        // Filter complete products (ensure product is valid)
        const completeRecommendations = data.filter(isProductComplete);
        
        // Rank the recommendations based on the order in the response (e.g., rank 1, 2, 3...)
        const rankedRecommendations = completeRecommendations.map((product, index) => ({
          ...product,
          rank: index + 1,  // Adding a rank based on its position
        }));
        
        // Update state with ranked recommendations
        setRecommendations(rankedRecommendations);
        
        // Fetch hybrid recommendations after personal recommendations
        fetchHybridRecommendations();
      })
        .catch((err) => {
          console.error("Error fetching recommendations:", err);
          setError("Failed to load recommendations. Please try again.");
          setRecommendations([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };


  const handleAddToCart = (product) => {
    addToCart({
      id: product.productId,
      parentAsin: product.productId,
      title: product.title,
      price: product.price,
      image: product.mainImage || "https://via.placeholder.com/150",
      brandName: product.brandName,
      storeName: product.storeName,
    });
  };
  const fetchHybridRecommendations = (inputUserId = userId) => {
    if (inputUserId) {
      setHybridLoading(true);
      setHybridError(null);
      
      console.log(`Fetching hybrid recommendations for user: ${inputUserId}`);
      
      fetch(`http://localhost:9005/api/users/hybridRecomm?userId=${inputUserId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch hybrid recommendations");
          }
          return response.json();
        })
        .then((data) => {
          // Filter out incomplete hybrid recommendations
          const completeHybridRecommendations = Array.isArray(data) 
            ? data.filter(isProductComplete) 
            : [];
          
          setHybridRecommendations(completeHybridRecommendations);
       })
        .catch((err) => {
          console.error("Error fetching hybrid recommendations:", err);
          setHybridError("Failed to load hybrid recommendations. Please try again.");
          setHybridRecommendations([]);
        })
        .finally(() => {
          setHybridLoading(false);
        });
    }
  };

  // Trigger data fetching when category changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const newCarouselImages = categoryImages[category] || categoryImages["All Categories"];
    setCarouselImages(newCarouselImages);
    fetchCategoryProducts(category);
  };

  // Trigger data fetching when component mounts and when userId changes
  useEffect(() => {
    fetchAllData();
  }, [userId, selectedCategory]);

  useEffect(() => {
    setCarouselImages(categoryImages["All Categories"]); // Default to 'All Categories'
    fetchCategoryProducts(selectedCategory);

  }, []);

  useEffect(() => {
    console.log("Loaded images for category:", selectedCategory, categoryImages[selectedCategory]);
  }, [selectedCategory]);



  const handleUserIdSubmit = () => {
    const inputUserId = document.getElementById('userIdInput').value.trim();
    
    if (inputUserId) { 
      // Update userId, which will trigger useEffect and fetch new data
      setUserId(inputUserId);
      setShowUserPanel(false);
    }
  }

   // Function to handle the change of user ID
   const handleUserIdChange = (id) => {
    setUserId(id); // Update the userId state
  };
  // Prefetch product data when hovering
  const handlePrefetch = (productId) => {
    if (productId) {
      fetch(`http://localhost:9005/api/products/product/${productId}`)
        .catch(() => {/* Silently fail prefetch attempts */});
    }
  };
  const bannerSettings = {
    dots: true, // Show dot navigation
    infinite: true, // Enable infinite scrolling
    speed: 500, // Slide transition speed in milliseconds
    slidesToShow: 1, // Number of slides visible at a time
    slidesToScroll: 1, // Number of slides to scroll when the user navigates
    arrows: true, // Enable arrows for navigation
    prevArrow: <PrevArrow />, // Custom previous arrow component (defined earlier)
    nextArrow: <NextArrow />, // Custom next arrow component (defined earlier)
    autoplay: true, // Enable autoplay
    autoplaySpeed: 2500, // Autoplay speed in milliseconds
    responsive: [
      {
        breakpoint: 1024, // When the screen width is 1024px or less
        settings: {
          slidesToShow: 1, // Show 2 slides at a time
          slidesToScroll: 1, // Scroll 1 slide at a time
        },
      },
      {
        breakpoint: 768, // When the screen width is 768px or less
        settings: {
          slidesToShow: 1, // Show 1 slide at a time
          slidesToScroll: 1, // Scroll 1 slide at a time
        },
      },
    ],
  };
  

  // Banner carousel settings
  const categoryProductsSettings = {
    dots: false,
    infinite: categoryProducts.length > 5,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    arrows: true,  // Only one arrow will be present here
    prevArrow: <PrevArrow />,  // Left arrow
    nextArrow: <NextArrow />,  // Right arrow
    afterChange: (current) => setCurrentSlide(current / 5),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

 // Hybrid recommendations carousel settings (similar to personal recommendations)
  const hybridRecommendationsSettings = {
    dots: false,
    infinite: hybridRecommendations.length > 5,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    afterChange: (current) => setCurrentSlide(current / 5),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleUserPanelToggle = () => {
    setShowUserPanel(prevState => !prevState);  // Toggle visibility
  };

  return (
    <div className="landing-page">
      <Header
        onSearch={handleSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory}
        cartLength={cart.length}
        onUserPanelToggle={handleUserPanelToggle} // Toggle user panel
        showUserPanel={showUserPanel}
        handleUserIdSubmit={handleUserIdSubmit}
        userId={userId}
        setUserId={handleUserIdChange}
        error={error}
      />
      
{carouselImages.length > 0 && (
  <div className="carousel-container" style={{ position: 'relative', paddingTop: "50px", marginBottom: "50px", marginLeft:"-20px"}}>
    <Slider {...bannerSettings}>
      {carouselImages.map((imagePath, index) => (
        <div key={index} className="carousel-slide" style={{ position: 'relative', height: '350px' }}>
        <img
          src={imagePath}
          alt={`${selectedCategory} Slide ${index + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',  // Ensures the whole image fits inside the container without cropping
            objectPosition: 'center',  // Ensures it stays centered if the aspect ratio differs
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          padding: '10px 10px',
          background: 'linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0))',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '20px',
          color: '#111',
          letterSpacing: '0.5px'
        }}>
          {/* {selectedCategory} Products */}
        </div>
      </div>
      
      
      ))}
    </Slider>
  </div>
)}



      {/* Category Products Section */}
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <section className="category-products-section">
          <div className="category-products-header">
            <h2 style={{textAlign:"center"}}>{selectedCategory} Products</h2>
            {categoryProducts.length > 5 && (
              <div className="pagination-info"  style={{textAlign:'right', color:'grey'}}>
                Page {currentSlide + 1} of {Math.ceil(categoryProducts.length / 5)}
              </div>
            )}
          </div>
          
          <div className="category-products-slider-wrapper">
            {categoryProducts.length > 0 ? (
              <Slider {...categoryProductsSettings}>
                {categoryProducts.map((product) => (
                  <ProductCard 
                    key={product.productId}
                    product={product}
                    onMouseOver={handlePrefetch}
                    navigate={navigate}
                    onAddToCart={handleAddToCart}
                    userId={getValidUserId()} // Use valid userId helper function

                  />
                ))}
              </Slider>
            ) : (
              <p className="no-products">
                No products available in this category.
              </p>
            )}
          </div>
        </section>
      )}
{/* Products You Might Like Section (Personal Recommendations) */}
{loading ? (
  <div className="loading">Loading recommendations...</div>
) : (
  <section className="hybrid-recommendations-section">
    <div className="recommendations-header">
      <h2 style={{ display: 'inline-block', marginRight: '10px' }}>Products You Might Like</h2>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
        {recommendations.length > 5 && (
          <div className="pagination-info" style={{ textAlign: 'right', color: 'grey' }}>
            Page {currentSlide + 1} of {Math.ceil(recommendations.length / 5)}
          </div>
        )}
        <Information
          userId={userId}
          triggerButton={
            <div
              title="How recommendations work"
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
                fontSize: '16px'
              }}
            >
              i
            </div>
          }
        />
      </div>
    </div>

    <div className="hybrid-recommendations-slider-wrapper">
      {recommendations.length > 0 ? (
        <Slider {...hybridRecommendationsSettings}>
          {recommendations.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              onMouseOver={handlePrefetch}
              navigate={navigate}
              onAddToCart={handleAddToCart}
              userId={getValidUserId()} // Use valid userId helper function

            />
          ))}
        </Slider>
      ) : (
        <p className="no-recommendations">
          {userId ? "No recommendations available for this user." : "Enter your User ID to see personalized recommendations."}
        </p>
      )}
    </div>
  </section>
)}

{/* Hybrid Recommendations Section */}
{hybridLoading ? (
  <div className="loading">Loading hybrid recommendations...</div>
) : (
  <section className="hybrid-recommendations-section">
    <div className="recommendations-header">
      <h2>Your Preferred Brands</h2>
      {hybridRecommendations.length > 5 && (
        <div
          className="pagination-controls"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}
        >
          <div className="pagination-info" style={{ textAlign: 'right', color: 'grey' }}>
            Page {currentSlide + 1} of {Math.ceil(hybridRecommendations.length / 5)}
          </div>
          <div
            title="How recommendations work"
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
              fontSize: '16px'
            }}
            onClick={() => showHybridInfo(hybridRecommendations)}
          >
            i
          </div>
        </div>
      )}
    </div>

    <div className="hybrid-recommendations-slider-wrapper">
      {hybridRecommendations.length > 0 ? (
        <Slider {...hybridRecommendationsSettings}>
          {hybridRecommendations.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              onMouseOver={handlePrefetch}
              navigate={navigate}
              onAddToCart={handleAddToCart}
              userId={getValidUserId()} // Use valid userId helper function

            />
          ))}
        </Slider>
      ) : (
        <p className="no-recommendations">
          {userId ? "No hybrid recommendations available for this user." : "Enter your User ID to see hybrid recommendations."}
        </p>
      )}
    </div>
  </section>
)}
      <Footer /> {/* This is important to add the footer */}


    </div>
  );
};

export default LandingPage;