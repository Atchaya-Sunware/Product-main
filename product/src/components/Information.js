import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './Information.css';

const Information = ({ userId, triggerButton }) => {
  const [topRecommendations, setTopRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scoringDetails, setScoringDetails] = useState({
    ratingCountRanges: [],
    calculationDetails: []
  });

  useEffect(() => {
    if (userId) fetchTopRecommendations(userId);
  }, [userId]);

  const formatNumber = (num) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const smartRoundUp = (value) => {
    const digits = value.toString().length;
    const base = Math.pow(10, digits - 1);
    const rounded = Math.ceil(value / base) * base;
    return Math.ceil(rounded / 10000) * 10000; // Always round to nearest 10,000
  };

  const fetchTopRecommendations = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:9005/api/users/personalRecomm?user_id=${userId}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const processedData = calculateScores(data);
      setTopRecommendations(processedData.topFive);
      setScoringDetails({
        ratingCountRanges: processedData.ratingCountRanges,
        calculationDetails: processedData.calculationDetails
      });
    } catch (err) {
      setError(err.message);
      setTopRecommendations([]);
      setScoringDetails({ ratingCountRanges: [], calculationDetails: [] });
    } finally {
      setLoading(false);
    }
  };

  const calculateScores = (products) => {
    if (!products || products.length === 0) return { topFive: [], ratingCountRanges: [], calculationDetails: [] };

    const sanitized = products.map(p => ({
      ...p,
      productId: p.productId || `product-${Math.random().toString(36).substr(2, 9)}`,
      productName: p.productName || p.title || 'Unknown Product',
      brand: p.brand || p.brandName || 'Unknown Brand',
      rating: p.rating || p.averageRating || 0,
      ratingCount: p.ratingCount || p.ratingNumber || p.userCount || 0,
      price: p.price || 0
    }));

    const max = Math.max(...sanitized.map(p => p.ratingCount));
    const roundedMax = smartRoundUp(max);
    const binSize = Math.floor(roundedMax / 10);

    const ranges = Array.from({ length: 10 }, (_, i) => {
      const min = i * binSize;
      const maxVal = (i + 1) * binSize - 1;
      return {
        range: `${formatNumber(maxVal)} - ${formatNumber(min)}`,
        points: parseFloat(((i + 1) * 0.5).toFixed(1))
      };
    }).reverse();

    const calculationDetails = sanitized.map(product => {
      const ratingCountScore = ranges.find(r => {
        const [maxVal, minVal] = r.range.split(' - ').map(s => parseInt(s.replace(/,/g, '')));
        return product.ratingCount >= minVal && product.ratingCount <= maxVal;
      })?.points || 0;

      const ratingScore = parseFloat(product.rating.toFixed(1));
      const totalScore = parseFloat((ratingCountScore * 1.4 + ratingScore * 0.6).toFixed(1));

      return {
        ...product,
        ratingScore,
        ratingCountScore,
        totalScore
      };
    }).sort((a, b) => b.totalScore - a.totalScore || b.ratingCount - a.ratingCount);

    calculationDetails.forEach((p, i) => p.rank = i + 1);

    return {
      topFive: calculationDetails.slice(0, 5),
      ratingCountRanges: ranges,
      calculationDetails
    };
  };

  const showModal = () => {
    Swal.fire({
      title: 'Personal Recommendation Summary',
      html: `
<div style="text-align: left; max-height: 70vh; overflow-y: auto;">
  <h3 class="info-heading">How Our Recommendation Works</h3>
  <p>We analyze your highly rated products to identify specific leaf-level categories you've shown preference for. Then we find similar users who also rated products in these same categories with similar ratings. Here's how it works:</p>

  <ol>
    <li><strong>Step 1: Identify Highly Rated Products</strong><br />
      We begin by identifying products you've rated <b>3 stars or more</b>.</li>
    <li><strong>Step 2: Extract Leaf-Level Category</strong><br />
      For each product, we extract the most specific categories (leaf categories) that best define the product type.</li>
    <li><strong>Step 3: Find Similar Users</strong><br />
      We then find similar users who rated products in the same leaf categories with same rating or more than that rating. For example, if you gave a product 4 stars, we find users who rated products in the same category , 4 and 4+ ratings.</li>
    <li><strong>Step 4: Filter Already Rated Products</strong><br />
      We ensure that no products you've already rated are included in the recommendations. This guarantees that the suggestions are fresh and new to you.</li>
    <li><strong>Step 5: Recommend New Products</strong><br />
      Finally, we recommend new products based on rating quality and popularity. These are products that similar users have rated highly, but you haven't rated yet.</li>
  </ol>

  <h3 class="info-heading">Scoring Pattern</h3>
  <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
    <h4>Rating Count Range</h4>
    <ul>
      ${scoringDetails.ratingCountRanges.map(r => `<li>${r.range}: ${r.points} points</li>`).join('') || '<li>No data available</li>'}
    </ul>
  </div>

  <h3 class="info-heading">Top 5 Recommendations with Scores</h3>
  <table class="info-table">
    <thead>
      <tr>
        <th>Product</th>
        <th>Rating Count</th>
        <th>Rating Score</th>
        <th>Avg Rating</th>
        <th>Total Score<br><p>(Rating Score * 1.4<br> +<br> Avg Rating * 0.6)</p></th>
      </tr>
    </thead>
    <tbody>
      ${topRecommendations.length > 0 ? topRecommendations.map(product => `
        <tr>
          <td title="${product.productName}" style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${product.productName}</td>
          <td>${formatNumber(product.ratingCount)}</td>
          <td>${product.ratingCountScore}</td>
          <td>${product.ratingScore}</td>
          <td class="total-score">${product.totalScore}</td>
        </tr>
      `).join('') : '<tr><td colspan="6" style="text-align:center">No recommendations available</td></tr>'}
    </tbody>
  </table>
</div>

      `,
      width: 800,
      confirmButtonText: 'Done!',
      confirmButtonColor: '#046e8f',
    });
  };

  return triggerButton ? React.cloneElement(triggerButton, { onClick: showModal }) : null;
};

export default Information;
