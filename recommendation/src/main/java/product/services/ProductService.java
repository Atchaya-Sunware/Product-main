package product.services;

import org.neo4j.driver.*;
import org.neo4j.driver.Record;
import java.util.Collections; // Import Collections for shuffling
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;

public class ProductService {
    private final Driver driver;

    public ProductService(Driver driver) {
        this.driver = driver;
    }

    // Fetch All Products with Fixed Limit of 20
    public List<Map<String, Object>> getAllProducts() {  
        System.out.println("Querying Neo4j for products...");
    
        String query = """
        PROFILE
                MATCH (p:Product)-[:BY_BRAND]->(b:Brand)
                OPTIONAL MATCH (p)-[:HAS_IMAGE]->(i:Image)
                OPTIONAL MATCH (p)-[:SOLD_IN]->(s:Store)
                OPTIONAL MATCH (p)-[:BELONGS_TO]->(cat:Category)
                OPTIONAL MATCH (p)-[:HAS_SALES_RANK]->(sales:SalesRank)
                WITH p,s,b,cat,sales, COLLECT(DISTINCT i.imageURL) AS images
                limit 50
                RETURN 
                    p { 
                        parentAsin: p.product_id, 
                        title: p.title, 
                        description: p.description, 
                        features: p.features,
                        price: p.price, 
                        ratingNumber: p.rating_number, 
                        averageRating: p.average_rating 
                    } AS product,
                    b {brandName: b.name} AS brand,
                    CASE WHEN cat IS NOT NULL
                        THEN { categoryName: cat.name }
                        ELSE null
                    END AS category,
                    sales{salesRankName : sales.name} as salesRank,
                    s { storeName: s.name } AS store,
                    head(images) as mainImage,
                    images AS allImages        
        """;
    
        try (Session session = driver.session(SessionConfig.forDatabase("test"))) {
            List<Map<String, Object>> products = new ArrayList<>();
            Result result = session.run(query);
    
            for (Record record : result.list()) {
                String mainImage = record.get("mainImage").isNull() ? null : record.get("mainImage").asString();

                // Skip this record if mainImage is null
                if (mainImage == null) {
                    continue;
                }
                Map<String, Object> productData = new HashMap<>();
                productData.put("product", record.get("product").isNull() ? null : record.get("product").asMap());
                productData.put("brand", record.get("brand").isNull() ? null : record.get("brand").asMap());
                productData.put("category", record.get("category").isNull() ? null : record.get("category").asMap());
                productData.put("store", record.get("store").isNull() ? null : record.get("store").asMap());
                productData.put("mainImage", record.get("mainImage").isNull() ? null : record.get("mainImage").asString());
                // productData.put("ratingNumber", record.get("ratingNumber").asInt());
                productData.put("allImages", record.get("allImages").isNull() ? List.of() : record.get("allImages").asList(Value::asString));
                productData.put("salesRank", record.get("salesRank").isNull() ? null : record.get("salesRank").asMap());
                    
                products.add(productData);
            }
    
            System.out.println("Neo4j query result for products: " + products);
            return products;
    
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error fetching products from Neo4j: " + e.getMessage());
            throw new RuntimeException("Failed to fetch products from Neo4j.");
        }
    }
    

    public List<Map<String, Object>> getAllByCategory(String categoryName) {  
        System.out.println("Querying Neo4j for products in category: " + categoryName);
       
        String query = """
        MATCH (p:Product)-[:HAS_SALES_RANK]->(cat:SalesRank {name: $categoryName})
        OPTIONAL MATCH (p)-[:BY_BRAND]->(b:Brand)
        OPTIONAL MATCH (p)-[:HAS_IMAGE]->(i:Image)
        OPTIONAL MATCH (p)-[:SOLD_IN]->(s:Store)
        WITH p, b, s, COLLECT(DISTINCT i.imageURL) AS images
        
        RETURN
            p {
                productId: p.product_id,
                title: p.title,
                description: p.description,
                features: p.features,
                price: p.price,
                ratingNumber: p.rating_number,
                averageRating: p.average_rating,
                mainImage: images[0]
            } AS product,
            b {brandName: b.name} AS brand,
            {categoryName: $categoryName} AS category,
            s {storeName: s.name} AS store,
            head(images) as mainImage,
            images AS allImages
        ORDER BY p.average_rating DESC
        LIMIT 100
        """;
       
        try (Session session = driver.session(SessionConfig.forDatabase("test"))) {
            List<Map<String, Object>> products = new ArrayList<>();
            Result result = session.run(query, Values.parameters("categoryName", categoryName));
            
            result.list().forEach(record -> {
                // Only proceed if the product is not null
                if (record.get("product") != null) {
                    String mainImage = record.get("mainImage") != null ? record.get("mainImage").asString().trim() : null;
                    
                    // Skip this record if mainImage is null or empty
                    if (mainImage == null || mainImage.isEmpty() || "null".equalsIgnoreCase(mainImage)) {
                        return; // Continue to the next record
                    }
        
                    Map<String, Object> productData = new HashMap<>();
                    
                    if (record.get("product") != null) 
                        productData.put("product", record.get("product").asMap());
                    
                    if (record.get("brand") != null) 
                        productData.put("brand", record.get("brand").asMap());
                    
                    if (record.get("category") != null) 
                        productData.put("category", record.get("category").asMap());
                    
                    if (record.get("store") != null) 
                        productData.put("store", record.get("store").asMap());
                    
                    productData.put("mainImage", mainImage);
                    
                    if (record.get("allImages") != null) 
                        productData.put("allImages", record.get("allImages").asList(Value::asString));
                    
                    products.add(productData);
                }
            });
        
            Collections.shuffle(products); // Shuffle the list
        
            System.out.println("Neo4j query result for category " + categoryName + ": " + products.size() + " products");
            return products;
        }
         catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error fetching products from Neo4j: " + e.getMessage());
            throw new RuntimeException("Failed to fetch products from Neo4j.");
        }
    }
    
    public Map<String, Object> getProductById(String parentAsin) {
        System.out.println("Fetching product details for ID: " + parentAsin);
    
        String query = """
        MATCH (p:Product {product_id: $parentAsin})
OPTIONAL MATCH (p)-[:BY_BRAND]->(b:Brand)
OPTIONAL MATCH (p)-[:HAS_IMAGE]->(i:Image)
OPTIONAL MATCH (p)-[:SOLD_IN]->(s:Store)
OPTIONAL MATCH (p)-[:BELONGS_TO]->(leafCat:Category)
WHERE NOT (leafCat)-[:SUB_CATEGORY]->()  // This ensures we get the leaf category
WITH p, b, s, COLLECT(DISTINCT i.imageURL) AS images, leafCat
RETURN 
    p { 
        parentAsin: p.product_id,
        title: p.title, 
        description: p.description, 
        features: p.features,
        price: p.price, 
        ratingNumber: p.rating_number, 
        averageRating: p.average_rating 
    } AS product, 
    COALESCE(b { brandName: b.name }, null) AS brand,
    COALESCE(leafCat { categoryName: leafCat.name }, null) AS category,
    COALESCE(s { storeName: s.name }, null) AS store,
    images AS allImages
        """;
    
try (Session session = driver.session(SessionConfig.forDatabase("test"))) {
    Result result = session.run(query, Map.of("parentAsin", parentAsin));
    
    if (!result.hasNext()) {
        return Map.of("message", "Product not found", "data", Map.of());
    }
    
    Record record = result.next();
    
    return Map.of(
        "product", Optional.ofNullable(record.get("product"))
            .filter(v -> !v.isNull())
            .map(Value::asMap)
            .orElse(Map.of()),
        "brand", Optional.ofNullable(record.get("brand"))
            .filter(v -> !v.isNull())
            .map(Value::asMap)
            .orElse(Map.of()),
        
        "category", Optional.ofNullable(record.get("category"))
            .filter(v -> !v.isNull())
            .map(Value::asMap)
            .orElse(Map.of()),
        
        "salesRank", Optional.ofNullable(record.get("salesRank"))
            .filter(v -> !v.isNull())
            .map(Value::asMap)
            .orElse(Map.of()),
        
        "store", Optional.ofNullable(record.get("store"))
            .filter(v -> !v.isNull())
            .map(Value::asMap)
            .orElse(Map.of()),
        
        "allImages", Optional.ofNullable(record.get("allImages"))
            .filter(v -> !v.isNull())
            .map(Value::asList)
            .orElse(List.of())
    );
} catch (Exception e) {
    e.printStackTrace();
    return Map.of("error", "Failed to fetch product details");
}
    }
    
    public List<Map<String, Object>> searchProducts(String keyword) {
    System.out.println("Querying Neo4j for products matching keyword: " + keyword);
    
    // Process the keyword to handle multiple terms
    String processedKeyword = keyword.trim().toLowerCase();
    
    // Optimized query with index hints and simplified pattern
    String query = """
        MATCH (p:Product)
        WHERE toLower(p.title) CONTAINS toLower($keyword)
        // Calculate relevance score early to improve sorting efficiency
        WITH p,
             CASE 
                 WHEN toLower(p.title) CONTAINS (' ' + toLower($keyword) + ' ') THEN 3
                 WHEN toLower(p.title) STARTS WITH toLower($keyword) THEN 2
                 ELSE 1
             END AS relevanceScore
        ORDER BY relevanceScore DESC
        LIMIT 50
        
        // Only after limiting results, fetch related entities
        OPTIONAL MATCH (p)-[:BY_BRAND]->(b:Brand)
        OPTIONAL MATCH (p)-[:HAS_IMAGE]->(i:Image)
        OPTIONAL MATCH (p)-[:SOLD_IN]->(s:Store)
        OPTIONAL MATCH (p)-[:BELONGS_TO]->(c:Category)
        
        WITH p, b, s, collect(i.imageURL) AS images, last(collect(c)) AS lastCategory, relevanceScore
        
        RETURN 
            p { 
                parentAsin: p.product_id, 
                title: p.title, 
                description: p.description, 
                features: p.features,
                price: p.price, 
                ratingNumber: p.rating_number, 
                averageRating: p.average_rating 
            } AS product, 
            b { brandName: b.name } AS brand,
            CASE 
                WHEN lastCategory IS NOT NULL 
                THEN lastCategory { categoryName: lastCategory.name }
                ELSE null
            END AS category,  
            s { storeName: s.name } AS store,  
            head(images) AS mainImage,  
            images AS allImages
    """;

    try (Session session = driver.session(SessionConfig.forDatabase("test"))) {
        Map<String, Object> params = Collections.singletonMap("keyword", processedKeyword);
        
        return session.executeRead(tx -> {
            Result result = tx.run(query, params);
            
            List<Map<String, Object>> products = new ArrayList<>(50);
            
            while (result.hasNext()) {
                Record record = result.next();
                Map<String, Object> productData = new HashMap<>(5);

                
                // Null checks for each field
                if (record.get("product") != null && !record.get("product").isNull()) {
                    productData.put("product", record.get("product").asMap());
                }
                
                
                if (record.get("brand") != null && !record.get("brand").isNull()) {
                    productData.put("brand", record.get("brand").asMap());
                }
                
                if (record.get("category") != null && !record.get("category").isNull()) {
                    productData.put("category", record.get("category").asMap());
                }
                
                if (record.get("store") != null && !record.get("store").isNull()) {
                    productData.put("store", record.get("store").asMap());
                }
                
                String mainImage = record.get("mainImage") != null ? record.get("mainImage").asString().trim() : null;
            if (mainImage == null || mainImage.isEmpty() || "null".equalsIgnoreCase(mainImage)) {
                continue; // Skip invalid product
            }
            productData.put("mainImage", mainImage);

                
                if (record.get("allImages") != null && !record.get("allImages").isNull()) {
                    productData.put("allImages", record.get("allImages").asList());
                }
        
                products.add(productData);
            }

            Collections.shuffle(products); // Shuffle the list

            
            return products;
        });
    } catch (Exception e) {
        e.printStackTrace();
        System.err.println("Error searching for products: " + e.getMessage());
        throw new RuntimeException("Failed to fetch products from Neo4j for search.", e);
    }
}
        
}
