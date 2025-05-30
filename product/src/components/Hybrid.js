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
  const interactionCount = top5Recommendations[0]?.interactionCount || 'multiple';

  Swal.fire({
    title: 'Brand Based Recommendation Summary',
    html: `
      <div style="text-align: left; max-height: 70vh; overflow-y: auto;">
        <h3 class="info-heading">How Recommendation Works</h3>
        <p>Our brand based recommendation system blends brand affinity with user ratings to recommend products that might best match your interests. Here's how it works:</p>
  
        <ol>
          <li><strong>Step 1: Identify Your Most Interacted Brand</strong><br />
            We identify the brand you've interacted with most frequently, based on your previous activity.</li>
          <li><strong>Step 2: Fetch Highly-Rated Products</strong><br />
            We find other highly-rated products (3+ stars) from that brand, ensuring the recommendations are relevant and based on user preferences.</li>
          <li><strong>Step 3: Filter Out Already Rated Products</strong><br />
            Any products you've already rated are filtered out to avoid suggesting products you've already reviewed.</li>
          <li><strong>Step 4: Rank Products by Popularity</strong><br />
            We rank products by the number of ratings (rating count) to prioritize more popular items.</li>
          <li><strong>Step 5: Recommend Top Products</strong><br />
            Finally, we return up to 1000 recommendations that might best match your tastes based on user interactions and product popularity.</li>
        </ol>
  
        <h3 class="info-heading">Scoring Pattern</h3>
        <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
          <h4>Rating Count Range</h4>
          <ul>
            ${ranges.map(r => `<li>${r.range}: ${r.points} points</li>`).join('') || '<li>No data available</li>'}
          </ul>
        </div>
  
        <h3 class="info-heading">Why This Brand?</h3>
        <p>
          You're seeing products from <strong>${brandName}</strong> because our analysis shows it's the brand you've interacted with most frequently
          (${interactionCount} interactions).
        </p>
  
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
                    <td>${score.avgRating}</td>
                    <td>${score.ratingNumberScore}</td>
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
}  

const Hybrid = ({ recommendations, triggerButton }) => {
  return triggerButton
    ? React.cloneElement(triggerButton, {
        onClick: () => showInfoModal(recommendations)
      })
    : null;
};

export default Hybrid;
export const showHybridInfo = showInfoModal;
