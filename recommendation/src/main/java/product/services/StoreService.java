package product.services;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public class StoreService {
    private final Driver driver;

    public StoreService(Driver driver) {
        this.driver = driver;
    }
    
// Add this method to your StoreService.java class
public List<Map<String, Object>> getUserBasedStoreRecommendations(String userId, String productId) {
    System.out.println("Querying Neo4j for user-based store recommendations for user: " + userId);

    String query = """
        MATCH (user:User {user_id: $userId})-[:RATED1|RATED2|RATED3|RATED4|RATED5]->(p:Product)-[:SOLD_IN]->(store:Store) 
        WHERE p.product_id = $productId
        WITH store

        MATCH (otherProduct:Product)-[:SOLD_IN]->(sameStore:Store)
        WHERE sameStore = store 
          AND otherProduct.product_id <> $productId  
          AND NOT (user)-[:BOUGHT]->(otherProduct)  

        RETURN otherProduct {
            product_id: otherProduct.product_id,
            title: otherProduct.title,
            price: otherProduct.price,
            average_rating: otherProduct.average_rating,
            imageURL: head(collect(otherProduct.imageURL))
        } AS RecommendedProducts
        ORDER BY otherProduct.average_rating DESC
        LIMIT 10
    """;

    try (Session session = driver.session(SessionConfig.forDatabase("test"))) {
        List<Map<String, Object>> recommendations = session.run(query, Map.of(
                "userId", userId,
                "productId", productId
            )).list(result -> result.get("RecommendedProducts").asMap());

        return recommendations;
    } catch (Exception e) {
        e.printStackTrace();
        System.out.println("Failed to fetch user-based store recommendations: " + e.getMessage());
        return Collections.emptyList();
    }
}

}