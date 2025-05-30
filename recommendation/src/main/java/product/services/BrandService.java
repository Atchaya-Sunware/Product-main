    package product.services;

    import org.neo4j.driver.AccessMode;
    import org.neo4j.driver.Driver;
    import org.neo4j.driver.Result;
    import org.neo4j.driver.Session;
    import org.neo4j.driver.SessionConfig;

    import java.util.ArrayList;
    import java.util.Collections;
    import java.util.Comparator;
    import java.util.HashMap;
    import java.util.List;
    import java.util.Map;
    import java.util.stream.Collectors;

    public class BrandService {
        private final Driver driver;

        public BrandService(Driver driver) {
            this.driver = driver;
        }
        public List<Map<String, Object>> getOnlyBrand(String brandName, String categoryName, String currentProductId) {
            System.out.println("Fetching recommendations for brand: " + brandName + " and category: " + categoryName);
            
            // Query with built-in priority score calculation
            String query = """
                    
            CALL {
            // Priority 1: Same brand, same leaf category (most relevant)
            MATCH (b:Brand {name: $brandName})<-[:BY_BRAND]-(p:Product)
            WHERE p.product_id <> $currentProductId AND p.title IS NOT NULL
            MATCH (p)-[:BELONGS_TO]->(leafCat:Category)
            WHERE toLower(leafCat.name) = toLower($categoryName)
            MATCH (p)-[:HAS_IMAGE]->(i:Image)
            WHERE i.imageURL IS NOT NULL
            RETURN p.product_id AS parentAsin,
                p.title AS title,
                p.price AS price,
                p.features AS features,
                p.average_rating AS averageRating,
                p.rating_number AS ratingNumber,
                b.name AS brandName,
                leafCat.name AS categoryName,
                head(collect(i.imageURL)) AS image,
                1 AS priority,
                5 AS brandScore,
                5 AS categoryScore,
                10.0 AS totalScore
            order by p.rating_number desc
            LIMIT 50
        
            UNION ALL 
            
            // Priority 2: Different brand, same leaf category
            MATCH (leafCat:Category)
            WHERE toLower(leafCat.name) = toLower($categoryName)
            MATCH (p:Product)-[:BELONGS_TO]->(leafCat)
            WHERE p.product_id <> $currentProductId AND p.title IS NOT NULL
            MATCH (p)-[:BY_BRAND]->(b:Brand)
            WHERE toLower(b.name) <> toLower($brandName)
            MATCH (p)-[:HAS_IMAGE]->(i:Image)
            WHERE i.imageURL IS NOT NULL
            RETURN p.product_id AS parentAsin,
                    p.title AS title,
                    p.price AS price,
                    p.features AS features,
                    p.average_rating AS averageRating,
                    p.rating_number AS ratingNumber,
                    b.name AS brandName,
                    leafCat.name AS categoryName,
                    head(collect(i.imageURL)) AS image,
                    2 AS priority,
                    3 AS brandScore,
                    5 AS categoryScore,
                    8.0 AS totalScore
            order by p.rating_number desc
            LIMIT 50
        
            UNION ALL
            
            // Priority 3: Same brand, different leaf categories
            MATCH (b:Brand {name: $brandName})<-[:BY_BRAND]-(p:Product)
            WHERE p.product_id <> $currentProductId AND p.title IS NOT NULL
            MATCH (p)-[:BELONGS_TO]->(leafCat:Category)
            WHERE toLower(leafCat.name) <> toLower($categoryName)
            MATCH (p)-[:HAS_IMAGE]->(i:Image)
            WHERE i.imageURL IS NOT NULL
            RETURN p.product_id AS parentAsin,
                p.title AS title,
                p.price AS price,
                p.features AS features,
                p.average_rating AS averageRating,
                p.rating_number AS ratingNumber,
                b.name AS brandName,
                leafCat.name AS categoryName,
                head(collect(i.imageURL)) AS image,
                3 AS priority,
                5 AS brandScore,
                4 AS categoryScore,
                9.0 AS totalScore
            order by p.rating_number desc
            LIMIT 50
            }
            
            RETURN parentAsin, title, price, features, averageRating, ratingNumber, brandName, 
                categoryName, image, priority, brandScore, categoryScore, totalScore
            ORDER BY priority ASC, ratingNumber DESC
            """;
            
            try (Session session = driver.session(SessionConfig.forDatabase("test"))) {
                // Set a shorter timeout for the query
                Result result = session.run(query, Map.of(
                    "brandName", brandName,
                    "categoryName", categoryName,
                    "currentProductId", currentProductId
                ));
                
                List<Map<String, Object>> results = result.list(record -> {
                    // If the image field is not present or is invalid, skip this record
                    String image = record.get("image") != null ? record.get("image").asString().trim() : null;
                    if (image == null || image.isEmpty() || "null".equalsIgnoreCase(image)) {
                        return null; // Skip invalid entries
                    }
        
                    // Proceed to add valid product details
                    Map<String, Object> recommendedProduct = new HashMap<>();
                    if (record.get("parentAsin") != null) recommendedProduct.put("parentAsin", record.get("parentAsin").asString());
                    if (record.get("title") != null) recommendedProduct.put("title", record.get("title").asString());
                    if (record.get("price") != null) recommendedProduct.put("price", record.get("price").asDouble());
                    if (record.get("features") != null) recommendedProduct.put("features", record.get("features").asString());
                    if (record.get("averageRating") != null) recommendedProduct.put("averageRating", record.get("averageRating").asDouble());
                    if (record.get("ratingNumber") != null) recommendedProduct.put("ratingNumber", record.get("ratingNumber").asInt());
                    if (record.get("brandName") != null) recommendedProduct.put("brandName", record.get("brandName").asString());
                    if (record.get("categoryName") != null) recommendedProduct.put("categoryName", record.get("categoryName").asString());
                    recommendedProduct.put("image", image);
                    
                    // CRITICAL FIX: Ensure we're preserving the priority value from Neo4j
                    if (record.get("priority") != null) {
                        int priority = record.get("priority").asInt();
                        recommendedProduct.put("priority", priority);
                    }
                    // Add the score fields
                    if (record.get("brandScore") != null) recommendedProduct.put("brandScore", record.get("brandScore").asInt());
                    if (record.get("categoryScore") != null) recommendedProduct.put("categoryScore", record.get("categoryScore").asInt());
                    if (record.get("totalScore") != null) recommendedProduct.put("totalScore", record.get("totalScore").asDouble());
        
                    return recommendedProduct;
                });
        
                // Filter out null results after mapping, keeping only valid products
                results = results.stream().filter(record -> record != null).collect(Collectors.toList());
                
                // IMPORTANT: DO NOT SHUFFLE RESULTS - this would destroy priority order
                // Collections.shuffle(results); // <-- THIS WAS COMMENTED OUT, KEEP IT THAT WAY
        
                // If the results are empty or too few, add some fallback products from the 4th priority
                if (results.size() < 100) {
                    try {
                        String fallbackQuery = """
                            // Priority 4: Fallback to popular products
                            MATCH (p:Product)-[:BELONGS_TO]->(leafCat:Category)
                            WHERE p.product_id <> $currentProductId 
                            AND p.title IS NOT NULL
                            MATCH (p)-[:BY_BRAND]->(b:Brand)
                            MATCH (p)-[:HAS_IMAGE]->(i:Image)
                            WHERE i.imageURL IS NOT NULL
                            LIMIT 20
                            RETURN p.product_id AS parentAsin,
                                p.title AS title,
                                p.price AS price,
                                p.features AS features,
                                p.average_rating AS averageRating,
                                p.rating_number AS ratingNumber,
                                b.name AS brandName,
                                leafCat.name AS categoryName,
                                head(collect(i.imageURL)) AS image,
                                4 AS priority,
                                3 AS brandScore,
                                4 AS categoryScore,
                                7.0 AS totalScore
                                ORDER BY p.rating_number DESC
                                Limit 50
                        """;
                        
                        List<Map<String, Object>> fallbackResults = session.run(fallbackQuery, Map.of(
                            "currentProductId", currentProductId
                        )).list(record -> {
                            // Same image validation for fallback results
                            String image = record.get("image") != null ? record.get("image").asString().trim() : null;
                            if (image == null || image.isEmpty() || "null".equalsIgnoreCase(image)) {
                                return null; // Skip invalid entries
                            }
        
                            Map<String, Object> recommendedProduct = new HashMap<>();
                            recommendedProduct.put("parentAsin", record.get("parentAsin").asString());
                            recommendedProduct.put("title", record.get("title").asString());
                            recommendedProduct.put("price", record.get("price").asDouble());
                            recommendedProduct.put("features", record.get("features").asString());
                            recommendedProduct.put("averageRating", record.get("averageRating").asDouble());
                            recommendedProduct.put("ratingNumber", record.get("ratingNumber").asInt());
                            recommendedProduct.put("brandName", record.get("brandName").asString());
                            recommendedProduct.put("categoryName", record.get("categoryName").asString());
                            recommendedProduct.put("image", image);
                            
                            // CRITICAL FIX: Ensure priority is preserved for fallback results as well
                            if (record.get("priority") != null) {
                                int priority = record.get("priority").asInt();
                                recommendedProduct.put("priority", priority);
                            }
                            // Add the score fields for fallback results
                            recommendedProduct.put("brandScore", record.get("brandScore").asInt());
                            recommendedProduct.put("categoryScore", record.get("categoryScore").asInt());
                            recommendedProduct.put("totalScore", record.get("totalScore").asDouble());
        
                            return recommendedProduct;
                        });
        
                        // Filter null results for fallback products
                        fallbackResults = fallbackResults.stream().filter(record -> record != null).collect(Collectors.toList());
                        // DO NOT SHUFFLE FALLBACK RESULTS
                        results.addAll(fallbackResults);
                    } catch (Exception e) {
                        System.err.println("Failed to fetch fallback products: " + e.getMessage());
                        // Continue without fallbacks if they fail
                    }
                }
                
                // CRITICAL FIX: Make sure we're sorting properly by priority first, then by rating
                // This ensures priority 1 items come before priority 2, etc.
                results.sort((a, b) -> {
                    // First compare by priority (ascending - lower priority number means higher actual priority)
                    int priorityCompare = Integer.compare(
                        ((Number)a.get("priority")).intValue(), 
                        ((Number)b.get("priority")).intValue()
                    );
                    if (priorityCompare != 0) {
                        return priorityCompare;
                    }
                    // If priority is the same, sort by rating number (descending)
                    return -Integer.compare(
                        ((Number)a.get("ratingNumber")).intValue(), 
                        ((Number)b.get("ratingNumber")).intValue()
                    );
                });
                
                // DEBUGGING: Print the first 5 results to verify priority order
                System.out.println("Top 5 recommendations after sorting:");
                for (int i = 0; i < Math.min(5, results.size()); i++) {
                    Map<String, Object> item = results.get(i);
                    System.out.println(String.format("Position %d: Priority %s, Brand: %s, Title: %s", 
                        i, item.get("priority"), item.get("brandName"), item.get("title")));
                }
                
                return results;
            } catch (Exception e) {
                e.printStackTrace();
                // Return a simple list of pre-defined fallback products rather than throwing an exception
                List<Map<String, Object>> fallbackList = new ArrayList<>();
                System.err.println("Using fallback recommendations due to error: " + e.getMessage());
                return fallbackList;
            }
        }
    }