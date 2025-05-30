import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Slider from "react-slick"; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { FaChevronLeft, FaChevronRight, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { showBrandCategoryInfo } from './BrandCategoryRecommendation';
import { showUserRecommInfo } from './UserRecommInfo';

const styles = {
  container: {
    position: 'relative',
    marginTop: '10px',
    marginBottom: '20px'
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center', 
    marginBottom: '10px'
  },
  productCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    margin: '10px',
    textAlign: 'center',
    transition: 'box-shadow 0.3s ease',
    cursor: 'pointer',
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  cardImgContainer: {
    height: '250px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  productTitle: {
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#333',
  },
  productPrice: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#040697',
    marginBottom: '5px',
  },
  starRating: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  addToCartBtn: {
    backgroundColor: '#ffe600',
    border: 'none',
    borderRadius: '20px',
    padding: '10px',
    fontWeight: '500',
    marginTop: 'auto',
    transition: 'background-color 0.3s',
  },
  addToCartBtnHover: {
    backgroundColor: '#FFC300',
  }
};

// Custom arrow components for slider navigation
const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div 
      className={className}
      style={{ 
        ...style, 
        display: "block", 
        background: "rgba(0,0,0,0.2)",
        borderRadius: "50%",
        padding: "6px 9px",
        zIndex: 10,
        color: "black",
        fontSize: "20px",
        width: "40px",
        height: "43px",
        left: "-25px",
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
        background: "rgba(0,0,0,0.2)",
        borderRadius: "50%",
        padding: "6px 9px",
        zIndex: 10,
        color: "black",
        fontSize: "20px",
        width: "40px",
        height: "43px",
        right: "-28px",
        cursor: "pointer"
      }}
      onClick={onClick}
    >
      <FaChevronRight />
    </div>
  );
};

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
      {ratingCount > 0 && <span style={{ marginLeft: '5px', fontSize: '12px' }}>({ratingCount})</span>}
    </div>
  );
};

const ProductCard = ({ product, navigate, onPrefetch }) => {
  if (!product) return null;

  const handleClick = () => {
    if (product.parentAsin) {
      navigate(`/viewProduct?asin=${product.parentAsin}`);
    }
  };

  const handleMouseOver = () => {
    if (onPrefetch && typeof onPrefetch === 'function') {
      onPrefetch(product.parentAsin);
    }
  };

  return (
    <div
      style={styles.productCard}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Product Image */}
      <div style={styles.cardImgContainer}>
        <LazyLoadImage
          src={product.image || 'https://via.placeholder.com/200?text=No+Image'}
          alt={product.title}
          style={styles.productImage}
        />
      </div>

      {/* Product Title */}
      <div style={styles.productTitle}>{product.title}</div>

      {/* Product Price */}
      <div style={styles.productPrice}>${product.price}</div>

      {/* Star Rating */}
      {renderStars(product.averageRating, product.ratingNumber)}

      {/* Add to Cart Button */}
      <button
        style={styles.addToCartBtn}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFC300'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFD814'}
      >
        Add to Cart
      </button>
    </div>
  );
};

const Recommendation = ({ recommendations, onPrefetch, isUserBased }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Properly sort recommendations based on priority first, then rating number
  const sortedRecommendations = useMemo(() => {
    if (!recommendations?.data || isUserBased) {
      // For user-based recommendations, we just filter invalid products
      return recommendations?.data?.filter(product => 
        product && product.parentAsin && product.image && product.title && product.price
      ) || [];
    }
    
    // Filter valid products
    const validProducts = recommendations.data.filter(product => 
      product && product.parentAsin && product.image && product.title && product.price
    );
    
    // Sort by priority (ascending) and then by rating number (descending)
    return validProducts.sort((a, b) => {
      // First compare by priority (lower number = higher priority)
      const priorityA = a.priority || 4; // Default to lowest priority if missing
      const priorityB = b.priority || 4;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB; // Sort by priority ascending (1, 2, 3, 4)
      }
      
      // If same priority, sort by rating number descending
      const ratingA = a.ratingNumber || 0;
      const ratingB = b.ratingNumber || 0;
      return ratingB - ratingA;
    });
  }, [recommendations, isUserBased]);
  
  const totalPages = Math.ceil((sortedRecommendations?.length || 0) / 5);

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    afterChange: (current) => setCurrentPage(Math.floor(current / 5) + 1),
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 4, slidesToScroll: 4 }
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3, slidesToScroll: 3 }
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 2, slidesToScroll: 2 }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1 }
      }
    ]
  };

  return (
    <div style={styles.container}>
      <div style={styles.paginationContainer}>
        <span>Page {currentPage} of {totalPages || 1}</span>
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
            fontSize: '16px',
            marginLeft: '10px'
          }}
          onClick={() => isUserBased ? showUserRecommInfo(recommendations.data) : showBrandCategoryInfo(recommendations)}
        >
          i
        </div>
      </div>
      
      {recommendations?.loading ? (
        <div>Loading recommendations...</div>
      ) : sortedRecommendations.length === 0 ? (
        <div>No recommendations found</div>
      ) : (
        <Slider {...sliderSettings}>
          {sortedRecommendations.map((product) => (
            <ProductCard
              key={product.parentAsin}
              product={product}
              navigate={navigate}
              onPrefetch={onPrefetch}
            />
          ))}
        </Slider>
      )}
    </div>
  );
};

export default Recommendation;