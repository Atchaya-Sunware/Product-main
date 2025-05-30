import React from 'react';
import Swal from 'sweetalert2';
import './Info.css';

// Format number with commas
const formatNumber = (num) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);

// Calculate priority score based on the provided rules
const calculatePriorityScore = (product) => {
  const priority = product.priority || 4;
  
  // Priority score mapping
  let brandScore = 0;
  let categoryScore = 0;
  
  switch(priority) {
    case 1: // Same brand, same category
      brandScore = 5;
      categoryScore = 5;
      break;
    case 2: // Different brand, same category
      brandScore = 3;
      categoryScore = 5;
      break;
    case 3: // Same brand, different category
      brandScore = 5;
      categoryScore = 4;
      break;
    case 4: // Different brand, different category
      brandScore = 3;
      categoryScore = 4;
      break;
    default:
      brandScore = 0;
      categoryScore = 0;
  }
  
  const totalScore = parseFloat((brandScore + categoryScore).toFixed(1));
  
  return {
    brandScore,
    categoryScore,
    priority,
    totalScore
  };
};

const showInfoModal = (recommendations) => {
  // Get top 5 recommendations for the table
  const top5Recommendations = recommendations?.data 
    ? recommendations.data
        .filter(product => product && product.parentAsin && product.image && product.title)
        .slice(0, 5)
    : [];
  
  const brandName = top5Recommendations[0]?.brandName || 'this brand';
  const categoryName = top5Recommendations[0]?.categoryName || 'this category';

  Swal.fire({
    title: 'Brand Based Recommendation Summary',
    html: `
      <div style="text-align: left; max-height: 70vh; overflow-y: auto;">
        <h3 class="info-heading">How Recommendation Works</h3>
        <p>Our recommendation system uses a sophisticated database query that searches for products based on brand and category relationships. Here's the step-by-step process:</p>
  
        <ol>
          <li><strong>Step 1: Find Products from Same Brand and Category (Priority 1)</strong><br />
            First, we search for products from the same brand you're viewing (<strong>${brandName}</strong>) that also belong to the same category (<strong>${categoryName}</strong>). These are considered the most relevant recommendations.</li>
            
          <li><strong>Step 2: Find Products from Different Brands but Same Category (Priority 2)</strong><br />
            Next, we look for products from different brands but in the same category. This helps you compare similar products across brands.</li>
            
          <li><strong>Step 3: Find Products from Same Brand but Different Categories (Priority 3)</strong><br />
            Then, we find other products from the same brand but in different categories. This helps you discover the brand's other offerings.</li>
            
          <li><strong>Step 4: Fallback to Popular Products (Priority 4)</strong><br />
            If we don't find enough recommendations from the above queries, we add some generally popular products as fallbacks.</li>
          
          <li><strong>Step 5: Filtering and Processing</strong><br />
            We filter out products with missing images or information, and exclude the product you're currently viewing.</li>
            
          <li><strong>Step 6: Ranking and Display</strong><br />
            We rank the results by priority first, then by average rating, and display them in the carousel.</li>
        </ol>
  
        <h3 class="info-heading">Scoring Pattern</h3>
        <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
          <h4>Priority Scoring</h4>
          <p>Each product is scored based on its relationship to what you're viewing:</p>
          <ul>
            <li>Same brand: 5 points</li>
            <li>Different brand: 3 points</li>
            <li>Same category: 5 points</li>
            <li>Different category: 4 points</li>
          </ul>
          
          <h4>Priority Categories</h4>
          <ul>
            <li><strong>Priority 1:</strong> Same brand, same category (10 points total)
              <br><em>Example: You're viewing a Samsung phone, and we show other Samsung phones</em></li>
            <li><strong>Priority 2:</strong> Different brand, same category (8 points total)
              <br><em>Example: You're viewing a Samsung phone, and we show Apple phones</em></li>
            <li><strong>Priority 3:</strong> Same brand, different category (9 points total)
              <br><em>Example: You're viewing a Samsung phone, and we show Samsung tablets</em></li>
            <li><strong>Priority 4:</strong> Different brand, different category (7 points total)
              <br><em>Example: Fallback recommendations with no direct relationship</em></li>
          </ul>
        </div>
  
        <h3 class="info-heading">Why These Recommendation?</h3>
        <p>
          You're seeing products related to <strong>${brandName}</strong> and <strong>${categoryName}</strong> because:
        </p>
        <ul>
          <li>Products from the same brand and category are most relevant to your current interest</li>
          <li>Products from other brands in the same category help you compare alternatives</li>
          <li>Products from the same brand in different categories help you discover more from brands you like</li>
        </ul>
  
        <h3 class="info-heading">Top 5 Recommendations with Detailed Scores</h3>
        <div class="info-table-container">
          <table class="info-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand Score</th>
                <th>Category Score</th>
                <th>Priority</th>
                <th>Total Score</th>
              </tr>
            </thead>
            <tbody>
              ${top5Recommendations.length > 0 ? top5Recommendations.map(product => {
                const score = calculatePriorityScore(product);
                let priorityText = "";
                switch(score.priority) {
                  case 1: priorityText = "Same brand, same category"; break;
                  case 2: priorityText = "Different brand, same category"; break;
                  case 3: priorityText = "Same brand, different category"; break;
                  case 4: priorityText = "Fallback recommendation"; break;
                  default: priorityText = "Unknown";
                }
                
                return `
                  <tr>
                    <td title="${product.title}" style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${product.title}
                    </td>
                    <td>${score.brandScore} ${score.brandScore === 5 ? '(Same brand)' : '(Different brand)'}</td>
                    <td>${score.categoryScore} ${score.categoryScore === 5 ? '(Same category)' : '(Different category)'}</td>
                    <td>${score.priority} - ${priorityText}</td>
                    <td class="total-score">
                      ${score.totalScore}
                    </td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="5" style="text-align:center">No recommendations available</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `,
    width: 800,
    confirmButtonText: 'Done!',
    confirmButtonColor: '#046e8f',
  });
};

const BrandCategoryRecommendation = ({ recommendations, triggerButton }) => {
  return triggerButton
    ? React.cloneElement(triggerButton, {
        onClick: () => showInfoModal(recommendations)
      })
    : null;
};

export default BrandCategoryRecommendation;
export const showBrandCategoryInfo = showInfoModal;