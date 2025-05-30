package product.services;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;
import java.util.Collections; // Import Collections for shuffling
 

import java.util.List;
import java.util.Map;

public class UserService {
    private final Driver driver;

    public UserService(Driver driver) {
        this.driver = driver;
    }

//     public List<Map<String, Object>> getPersonalizedRecommendations(String userId) {
//         System.out.println("Querying Neo4j for personalized recommendations for user: " + userId);
//         String query = """
// // First get the user's highly rated products
// MATCH (u:User {user_id: $userId})-[userRated:RATED3|RATED4|RATED5]->(p:Product)
// WHERE userRated.rating >= 3

// // Get the leaf categories for each of the user's highly rated products
// MATCH (p)-[:BELONGS_TO]->(leafCat:Category)
// WHERE NOT (leafCat)-[:SUB_CATEGORY]->()

// // For each product-rating-category combination
// WITH u, p, leafCat, userRated.rating as userRating

// // Find other users who rated products in the same leaf categories with similar ratings
// MATCH (leafCat)<-[:BELONGS_TO]-(otherProd:Product)<-[otherRated:RATED3|RATED4|RATED5]-(otherUser:User)
// WHERE otherUser <> u
//   AND ((userRating = 3 AND otherRated.rating >= 3) OR
//        (userRating = 4 AND otherRated.rating >= 4) OR
//        (userRating = 5 AND otherRated.rating = 5))
//   AND NOT (u)-[:RATED3|RATED4|RATED5]->(otherProd)  // User hasn't rated this product

//   // Get brand and store information
// OPTIONAL MATCH (otherProd)-[:BY_BRAND]->(brand:Brand)
// OPTIONAL MATCH (otherProd)-[:SOLD_IN]->(store:Store)

// // Get images
// OPTIONAL MATCH (otherProd)-[:HAS_IMAGE]->(i:Image)
// WITH otherProd, leafCat, count(distinct otherUser) as userCount, 
//      avg(otherRated.rating) as avgRating, brand, store,
//      collect(distinct i.imageURL) AS images
// WHERE userCount >= 2

// // Return recommendations with image, brand and store information
// RETURN {
//     productId: otherProd.product_id,
//     title: otherProd.title,
//     price: otherProd.price,
//     category: leafCat.name,
//     averageRating: avgRating,
//     userCount: userCount,
//     ratingNumber: otherProd.rating_number,
//     brandName: brand.name,
//     storeName: store.name,
//     mainImage: head(images),
//     allImages: images
// } AS RecommendedProducts
// ORDER BY RecommendedProducts.ratingNumber DESC,RecommendedProducts.averageRating DESC
// LIMIT 500
//         """;
        
//         try (Session session = driver.session(SessionConfig.forDatabase("test"))) {
//             List<Map<String, Object>> personalizedRecommendations = session.run(query, Map.of("userId", userId))
//             .list(result -> result.get("RecommendedProducts").asMap());

//         // Shuffle the personalized recommendations before returning
//         // Collections.shuffle(personalizedRecommendations); // Shuffle the list

//         return personalizedRecommendations;
//         } catch (Exception e) {
//             e.printStackTrace();
//             throw new RuntimeException("Failed to fetch personalized recommendations from Neo4j.");
//         }
//     }

public List<Map<String, Object>> getPersonalizedRecommendations(String userId) {
    System.out.println("Querying Neo4j for personalized recommendations for user: " + userId);
    String query = """
// Step 1: Get the user's highly rated products with purchase dates grouped by category
MATCH (u:User {user_id: $userId})-[userRated:RATED3|RATED4|RATED5]->(p:Product)-[:BELONGS_TO]->(leafCat:Category)

// Step 2: Group by category and find most recent purchase date for each category
WITH u, leafCat, max(date(userRated.purchase_date)) AS mostRecentPurchaseDate// Step 3: Find Potential Recommendations
// - Identifies products in the same categories
// - Excludes products already rated by the user
// - Focuses on products rated by other users

// Step 3: Calculate recency score based on most recent purchase date per category
WITH u, leafCat, mostRecentPurchaseDate,
     CASE
       WHEN mostRecentPurchaseDate >= date() THEN 5.0
       ELSE
         CASE
           WHEN duration.between(mostRecentPurchaseDate, date()).days > 365 THEN 0.0
           ELSE 5.0 * (1.0 - (duration.between(mostRecentPurchaseDate, date()).days / 365.0))
         END
     END AS recencyScore

// Step 4: Find other users who rated products in the same leaf categories
MATCH (leafCat)<-[:BELONGS_TO]-(otherProd:Product)<-[otherRated:RATED3|RATED4|RATED5]-(otherUser:User)
WHERE otherUser <> u
  AND NOT (u)-[:RATED3|RATED4|RATED5]->(otherProd)  // User hasn't already rated this product

// Step 5: Get brand and store information, and product images
OPTIONAL MATCH (otherProd)-[:BY_BRAND]->(brand:Brand)
OPTIONAL MATCH (otherProd)-[:SOLD_IN]->(store:Store)
OPTIONAL MATCH (otherProd)-[:HAS_IMAGE]->(i:Image)

// Step 6: Aggregate user count and scoring
WITH otherProd, leafCat, recencyScore, mostRecentPurchaseDate AS categoryPurchaseDate, count(distinct otherUser) AS userCount, 
     brand, store, collect(distinct i.imageURL) AS images,
     CASE
       WHEN otherProd.rating_number IS NOT NULL
       THEN 3.0 * (1.0 - 1.0/(1.0 + toFloat(otherProd.rating_number)/100.0))
       ELSE 0.0
     END AS ratingCountScore,
     CASE
       WHEN otherProd.average_rating IS NOT NULL
       THEN 2.0 * (toFloat(otherProd.average_rating) / 5.0)
       ELSE 0.0
     END AS avgRatingScore

WHERE userCount >= 2     

// Step 7: Calculate the total score (out of 10)
WITH otherProd, leafCat, categoryPurchaseDate, userCount, brand, store, images, 
     recencyScore, ratingCountScore, avgRatingScore,
     toFloat(round((recencyScore + ratingCountScore + avgRatingScore) * 10) / 10.0) AS totalScore

// Step 8: Return recommendations with all information and scoring details
WITH DISTINCT otherProd, leafCat, categoryPurchaseDate, userCount, brand, store, images, 
     recencyScore, ratingCountScore, avgRatingScore, totalScore
RETURN {
    productId: otherProd.product_id,
    productName: otherProd.title,
    title: otherProd.title,
    price: otherProd.price,
    category: leafCat.name,
    averageRating: otherProd.average_rating,
    ratingNumber: otherProd.rating_number,
    purchaseDate: toString(categoryPurchaseDate),
    recencyScore: recencyScore,
    ratingCountScore: ratingCountScore,
    avgRatingScore: avgRatingScore,
    totalScore: totalScore,
    brandName: brand.name,
    storeName: store.name,
    mainImage: head(images),
    allImages: images
} AS RecommendedProducts
ORDER BY RecommendedProducts.totalScore DESC, RecommendedProducts.recencyScore DESC, RecommendedProducts.ratingNumber DESC
LIMIT 500
    """;
    
    try (Session session = driver.session(SessionConfig.forDatabase("test"))) {
        List<Map<String, Object>> personalizedRecommendations = session.run(query, Map.of("userId", userId))
        .list(result -> result.get("RecommendedProducts").asMap());

        return personalizedRecommendations;
    } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException("Failed to fetch personalized recommendations from Neo4j.");
    }
}
    
public List<Map<String, Object>> getHybridRecommendations(String userId) {
    System.out.println("Querying Neo4j for brand and category-based recommendations for user: " + userId);
    String query = """
            // Step 1: Get the user's rated products, their categories, and most interacted brand
MATCH (u:User {user_id: $userId})-[userRated:RATED3|RATED4|RATED5]->(p:Product)
MATCH (p)-[:BY_BRAND]->(b:Brand)
WITH u, b, COUNT(p) AS brandInteractionCount
ORDER BY brandInteractionCount DESC
LIMIT 1 // Get only the most interacted brand

// Step 2: Get all categories the user has interacted with in this brand
MATCH (u:User {user_id: $userId})-[:RATED3|RATED4|RATED5]->(p:Product)-[:BY_BRAND]->(b)
MATCH (p)-[:BELONGS_TO]->(userCategory:Category)
WITH u, b, collect(DISTINCT userCategory.name) AS userCategories

// Step 3: Get all products the user has rated in this brand with their purchase dates
MATCH (u)-[userRated:RATED3|RATED4|RATED5]->(p:Product)-[:BY_BRAND]->(b)
WITH u, b, userCategories, p, userRated.purchase_date AS purchaseDate
ORDER BY purchaseDate DESC  // Sort by purchase date (newest first)
WITH u, b, userCategories, collect({product: p, purchaseDate: purchaseDate}) AS userProductsWithDates

// Step 4: Iterate through user's products and find recommendations for each
UNWIND userProductsWithDates AS userProductWithDate
WITH u, b, userCategories, userProductWithDate.product AS userProduct, 
     date(userProductWithDate.purchaseDate) AS purchaseDate

// Step 5: Find other products from the same brand that user hasn't rated
MATCH (rec:Product)-[:BY_BRAND]->(b)
WHERE NOT (u)-[:RATED3|RATED4|RATED5]->(rec)
AND rec <> userProduct

// Step 6: Get the category of the recommended product
MATCH (rec)-[:BELONGS_TO]->(recCategory:Category)

// Step 7: Calculate category match score - 1.0 if user has interacted with this category before, 0.5 otherwise
WITH u, b, userCategories, userProduct, purchaseDate, rec, recCategory,
     CASE 
         WHEN recCategory.name IN userCategories THEN 1.0  // User has interacted with this category
         ELSE 0.5  // User hasn't interacted with this category
     END AS categoryMatchScore

// Step 8: Get other users who rated this recommended product
MATCH (rec)<-[otherRated:RATED3|RATED4|RATED5]-(otherUser:User)
WHERE otherUser <> u  // Exclude the current user
WITH u, b, userCategories, userProduct, purchaseDate, rec, recCategory, 
     categoryMatchScore, count(distinct otherUser) AS otherUserCount
WHERE otherUserCount >= 2  // Ensure at least 2 other users rated this product

// Step 9: Get additional product information
OPTIONAL MATCH (rec)-[:SOLD_IN]->(store:Store)
OPTIONAL MATCH (rec)-[:HAS_IMAGE]->(i:Image)
WITH u, b, userCategories, userProduct, purchaseDate, rec, recCategory, store,
     categoryMatchScore, otherUserCount,
     collect(DISTINCT i.imageURL) AS images

// Step 10: Calculate raw scores for each component
WITH u, b, userCategories, userProduct, purchaseDate, rec, recCategory, store, 
     categoryMatchScore, otherUserCount, images,
     
     // Recency score (higher for more recent purchases)
     CASE 
         WHEN purchaseDate IS NOT NULL 
         THEN 1000.0 / (1.0 + duration.between(purchaseDate, date()).days)
         ELSE 0.0
     END AS rawRecencyScore,
     
     // Rating count score - FIXED: using log instead of ln
     CASE
         WHEN rec.rating_number IS NOT NULL AND rec.rating_number > 0
         THEN log(1.0 + toFloat(rec.rating_number))
         ELSE 0.0
     END AS rawRatingCountScore,
     
     // Average rating score (0-5)
     CASE
         WHEN rec.average_rating IS NOT NULL
         THEN toFloat(rec.average_rating)
         ELSE 0.0
     END AS rawAvgRatingScore

// Step 11: Define weights that sum to 10
WITH u, b, userCategories, userProduct, purchaseDate, rec, recCategory, store, 
     categoryMatchScore, otherUserCount, images,
     rawRecencyScore, rawRatingCountScore, rawAvgRatingScore,
     5.0 AS recencyWeight,       // 50% - Highest priority
     2.5 AS categoryMatchWeight, // 25% - Second priority
     1.5 AS ratingCountWeight,   // 15% - Third priority
     1.0 AS avgRatingWeight      // 10% - Fourth priority

// Step 12: Calculate normalized component scores
WITH u, b, userCategories, userProduct, purchaseDate, rec, recCategory, store, 
     otherUserCount, images,
     // Category match score directly scaled by weight
     categoryMatchScore * categoryMatchWeight AS categoryMatchScore,
     
     // Recency score normalized with sigmoid function
     recencyWeight * (1.0 / (1.0 + exp(-0.05 * rawRecencyScore + 2.5))) AS recencyScore,
     
     // Rating count score normalized with sigmoid function
     ratingCountWeight * (1.0 / (1.0 + exp(-1.0 * rawRatingCountScore + 4.0))) AS ratingCountScore,
     
     // Average rating scaled from 0-5 to 0-weight
     avgRatingWeight * (rawAvgRatingScore / 5.0) AS avgRatingScore,
     
     // Keep original raw scores for debugging
     rawRecencyScore, rawRatingCountScore, rawAvgRatingScore
     
// Step 13: Calculate final score (out of 10)
WITH userProduct, rec, recCategory, store, purchaseDate, otherUserCount, images,
     categoryMatchScore, recencyScore, ratingCountScore, avgRatingScore,
     toFloat(round((categoryMatchScore + recencyScore + ratingCountScore + avgRatingScore) * 100) / 100.0) AS totalScore

// Step 14: Return recommendations with all relevant information
RETURN {
    productId: rec.product_id,
    title: rec.title,
    price: rec.price,
    category: recCategory.name,
    userPurchaseDate: purchaseDate,
    userProductId: userProduct.product_id,
    otherUsersCount: otherUserCount,
    averageRating: rec.average_rating,
    ratingNumber: rec.rating_number,
    storeName: store.name,
    mainImage: head(images),
    allImages: images,
    categoryMatchScore: categoryMatchScore,
    recencyScore: recencyScore, 
    ratingCountScore: ratingCountScore,
    avgRatingScore: avgRatingScore,
    totalScore: totalScore
} AS RecommendedProducts

// Step 15: Order by priority (recency, category match, rating count, average rating)
ORDER BY RecommendedProducts.recencyScore DESC,
         RecommendedProducts.categoryMatchScore DESC,
         RecommendedProducts.ratingCountScore DESC,
         RecommendedProducts.avgRatingScore DESC
LIMIT 500
        """;

    try (Session session = driver.session(SessionConfig.forDatabase("test"))) {
        List<Map<String, Object>> recommendations = session.run(query, Map.of("userId", userId))
        .list(record -> record.get("RecommendedProducts").asMap());

        return recommendations;
    } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException("Failed to fetch brand and category-based recommendations.");
    }
}

public List<Map<String, Object>> getUserBasedRecommendations(String userId, String currentProductId) {
    System.out.println("Querying Neo4j for user-based recommendations for user: " + userId + " for product: " + currentProductId);

    String query = """
        // Step 1: Get the current product and the category it belongs to
MATCH (currentUser:User {user_id: $userId})
MATCH (currentProduct:Product {product_id: $currentProductId})
MATCH (currentProduct)-[:BELONGS_TO]->(category:Category)

// Step 2: Find other products in the same category, rated by other users
MATCH (otherUsers:User)-[:RATED1|RATED2|RATED3|RATED4|RATED5]->(recommendedProduct:Product)
WHERE recommendedProduct.product_id <> 'B0B79D1NQ6'
  AND NOT (currentUser)-[:RATED1|RATED2|RATED3|RATED4|RATED5]->(recommendedProduct)
MATCH (recommendedProduct)-[:BELONGS_TO]->(category)

// Step 3: Get the purchase date of other users for the recommended products
MATCH (otherUsers)-[otherRated:RATED1|RATED2|RATED3|RATED4|RATED5]->(recommendedProduct)
WITH recommendedProduct, category, otherUsers, otherRated, date(otherRated.purchase_date) AS otherPurchaseDate

// Step 4: Calculate the recency score for other users' purchase dates
WITH recommendedProduct, category, otherUsers, otherRated, otherPurchaseDate,
     CASE
       // For future dates (including today), give them the highest score
       WHEN otherPurchaseDate >= date() THEN 100.0
       // For past dates, calculate based on how recent they are (closer = higher score)
       ELSE 100.0 * (1.0 - duration.between(otherPurchaseDate, date()).days / 365.0)
     END AS purchaseRecencyScore

// Step 5: Collect information per product, keeping the most recent purchase date
WITH recommendedProduct, category, 
     MAX(otherPurchaseDate) AS mostRecentPurchaseDate,
     MAX(purchaseRecencyScore) AS maxRecencyScore
     
// Step 6: Get additional product details
OPTIONAL MATCH (recommendedProduct)-[:BY_BRAND]->(brand:Brand)
OPTIONAL MATCH (recommendedProduct)-[:SOLD_IN]->(store:Store)
OPTIONAL MATCH (recommendedProduct)-[:HAS_IMAGE]->(image:Image)
WITH recommendedProduct, category, brand, store, collect(DISTINCT image.imageURL) AS images,
     maxRecencyScore AS purchaseRecencyScore, mostRecentPurchaseDate,
     recommendedProduct.average_rating AS avgRating, recommendedProduct.rating_number AS ratingNumber

// Step 7: Calculate the rating number score out of 100
WITH recommendedProduct, category, brand, store, images, purchaseRecencyScore, mostRecentPurchaseDate, avgRating, ratingNumber,
     CASE
       // Using logarithmic scaling for a smoother curve (out of 100)
       WHEN ratingNumber <= 0 THEN 0.0
       // Calculate the logarithmic score
       WHEN (log10(toFloat(ratingNumber))/5 * 100) > 100.0 THEN 100.0
       // Convert to a 0-100 scale (log10(1000)≈3, log10(100000)≈5, so ~2 orders of magnitude)
       // log10(ratingNumber)/5*100 would map up to 100000 ratings to 0-100
       ELSE toFloat(ROUND((log10(toFloat(ratingNumber))/5 * 100) * 10) / 10.0)
     END AS ratingNumberScore

// Step 8: Calculate the final total score out of 10 directly
WITH recommendedProduct, category, brand, store, images, purchaseRecencyScore, ratingNumberScore, mostRecentPurchaseDate, avgRating, ratingNumber,
     // Average rating is typically 0-5, convert to 0-100 scale
     avgRating * 20 AS avgRatingScore,
     // purchaseRecencyScore is already 0-100
     // ratingNumberScore is now 0-100
     toFloat(ROUND(((purchaseRecencyScore * 0.5) + (ratingNumberScore * 0.3) + (avgRating * 20 * 0.2)) / 10 * 10) / 10.0) AS totalScore

// Step 9: Cap the total score at 10.0 if it exceeds
WITH recommendedProduct, category, brand, store, images, purchaseRecencyScore, ratingNumberScore, mostRecentPurchaseDate, avgRating, ratingNumber,
     CASE
       WHEN totalScore > 10.0 THEN 10.0
       ELSE totalScore
     END AS normalizedTotalScore

// Step 10: Return the final recommendations with detailed scoring
RETURN {
    productId: recommendedProduct.product_id,
    title: recommendedProduct.title,
    price: recommendedProduct.price,
    category: category.name,
    averageRating: avgRating,
    ratingNumber: ratingNumber,
    purchaseDate: toString(mostRecentPurchaseDate),  // Use the most recent purchase date
    recencyScore: purchaseRecencyScore,
    ratingNumberScore: ratingNumberScore,
    totalScore: normalizedTotalScore,
    brandName: brand.name,
    storeName: store.name,
    mainImage: head(images),
    allImages: images
} AS RecommendedProducts
ORDER BY  RecommendedProducts.totalScore DESC
LIMIT 500

    """;

    try (Session session = driver.session(SessionConfig.forDatabase("test"))) {
        List<Map<String, Object>> userBasedRecommendations = session.run(query, Map.of("userId", userId, "currentProductId", currentProductId))
        .list(record -> record.get("RecommendedProducts").asMap());

        System.out.println("User-based recommendations: " + userBasedRecommendations);
        return userBasedRecommendations;
    } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException("Failed to fetch user-based recommendations.");
    }
}
}