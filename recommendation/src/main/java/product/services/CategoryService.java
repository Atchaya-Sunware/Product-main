package product.services;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;

import java.util.List;
import java.util.Map;

public class CategoryService {
    private final Driver driver;

    public CategoryService(Driver driver) {
        this.driver = driver;
    }

    public List<Map<String, Object>> getCategoryRecommendation(String userId) {
        System.out.println("Querying Neo4j for recommendations for user: " + userId);
        String query = """
            MATCH (u:User {userId: $userId})-[:RATED]->(p:Product)-[:BELONGS_TO]->(c:Category)
                MATCH (u)-[r:RATED]->(p)
                WHERE r.rating >= 3
            MATCH (rec:Product)-[:BELONGS_TO]->(c)
            WHERE NOT (u)-[:RATED]->(rec)
              AND rec.averageRating >= 3
            RETURN rec {
                parentAsin: rec.parentAsin,
                title: rec.title,
                price: rec.price,
                features: rec.features,
                averageRating: rec.averageRating,
                ratingNumber: rec.ratingNumber,
                description: rec.description,
                category: c.name
            } AS RecommendedProducts
            ORDER BY rec.averageRating DESC, rec.ratingNumber DESC
            LIMIT 20
            """;
        try (Session session = driver.session(SessionConfig.forDatabase("dump"))) {
            return session.run(query, Map.of("userId", userId))
                    .list(result -> result.get("RecommendedProducts").asMap());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch personalized recommendations from Neo4j.");
        }
    }
}
