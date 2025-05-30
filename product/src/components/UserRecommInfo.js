import React from 'react';
import Swal from 'sweetalert2';
import './Info.css';

// Round up to the nearest clean boundary (like 1000, 10000)
const smartRoundUp = (value) => {
  const base = Math.pow(10, Math.max(2, value.toString().length - 1));
  const upper = Math.ceil(value / base) * base;
  const cleaner = Math.ceil(upper / 1000) * 1000;
  return cleaner;
};

// Format number with commas
const formatNumber = (num) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);

// Score logic per product
const calculateScore = (product, ranges) => {
  const ratingNumberScore = ranges.find(r => {
    const [maxVal, minVal] = r.range.split(' - ').map(x => Number(x.replace(/,/g, '')));
    return product.ratingNumber >= minVal && product.ratingNumber <= maxVal;
  })?.points || 0;

  const avgRating = parseFloat(product.averageRating.toFixed(1));
  const totalScore = parseFloat(((ratingNumberScore * 1.4) + (avgRating * 0.6)).toFixed(2));

  return {
    ratingNumberScore,
    avgRating,
    totalScore
  };
};

// Show modal with recommendation info
const showInfoModal = (recommendations) => {
  const max = recommendations.length > 0
    ? Math.max(...recommendations.map(rec => rec.ratingNumber))
    : 0;

  const topCap = smartRoundUp(max); // clean round-up
  const step = Math.floor(topCap / 10);

  const ranges = Array.from({ length: 10 }, (_, i) => {
    const min = step * i;
    const maxVal = step * (i + 1) - 1;
    return {
      range: `${formatNumber(maxVal)} - ${formatNumber(min)}`,
      points: parseFloat(((i + 1) * 0.5).toFixed(1))
    };
  }).reverse();

  const top5Recommendations = recommendations.slice(0, 5);
  const brandName = top5Recommendations[0]?.brandName || 'this brand';
  const interactionCount = top5Recommendations[0]?.sharedUserCount || 'multiple';

  Swal.fire({
    title: 'User Based Recommendation Summary',
    html: `
      <div style="text-align: left; max-height: 70vh; overflow-y: auto;">
        <h3 class="info-heading">How Recommendations Work</h3>
        <p>Our user-based recommendation system analyzes user behavior to suggest products that best match your interests. Here's how it works:</p>
  
         <ol>
    <li><strong>Step 1: Find Other Users Who Rated the Same Product</strong><br />
      We identify other users who have rated the same product that you viewed.</li>
    <li><strong>Step 2: Fetch Products Rated by These Users in the Same Category</strong><br />
      We gather products rated by these users within the same category as the product you viewed.</li>
    <li><strong>Step 3: Exclude Products You've Already Rated</strong><br />
      We filter out products you've already rated to ensure you don’t see them in your recommendations again.</li>
    <li><strong>Step 4: Rank Products by Popularity</strong><br />
      We prioritize products that have been rated by a larger number of users, as they are considered more popular.</li>
    <li><strong>Step 5: Recommend the Top Products</strong><br />
      We recommend the top products based on the number of users who rated them and their overall ratings.</li>
  </ol>
  
        <h3 class="info-heading">Top 5 Recommendations with Scores</h3>
        <div class="info-table-container">
          <table class="info-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Rating Count</th>
                <th>Rating Score</th>
                <th>Avg Rating</th>
                <th>Total Score <p>(Rating Score * 1.4 <br>+<br> Avg Rating * 0.6)</p></th>
              </tr>
            </thead>
            <tbody>
              ${top5Recommendations.length > 0 ? top5Recommendations.map(product => {
                const score = calculateScore(product, ranges);
                return `
                  <tr>
                    <td title="${product.title}" style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${product.title}
                    </td>
                    <td>${formatNumber(product.ratingNumber)}</td>
                    <td>${score.ratingNumberScore}</td>
                    <td>${score.avgRating}</td>
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

const UserRecommInfo = ({ recommendations, triggerButton }) => {
  return triggerButton
    ? React.cloneElement(triggerButton, {
        onClick: () => showInfoModal(recommendations)
      })
    : null;
};

export default UserRecommInfo;
export const showUserRecommInfo = showInfoModal;
