package product.routes;

import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;
import product.services.BrandService;

import org.neo4j.driver.Driver;
import com.google.gson.Gson;

import static io.javalin.apibuilder.ApiBuilder.get;

import java.util.List;
import java.util.Map;

public class BrandRoutes implements EndpointGroup {
    private final BrandService brandService;
    private final Gson gson;

    public BrandRoutes(Driver driver, Gson gson) {
        this.brandService = new BrandService(driver);
        this.gson = gson;
    }

    @Override
    public void addEndpoints() {
        // get("/brandRecomm", this::getBrandRecommendations);
        get("/brandOnly",this::getOnlyBrand);
    }

    // public void getBrandRecommendations(Context ctx) {
    //     String userId = ctx.queryParam("userId");
    //     if (userId == null || userId.isEmpty()) {
    //         ctx.status(400).result("Missing userId parameter.");
    //         return;
    //     }

    //     try {
    //         var recommendations = brandService.getBrandRecommendations(userId);
    //         if (recommendations.isEmpty()) {
    //             ctx.json("No brand-based recommendations found.");
    //         } else {
    //             ctx.result(gson.toJson(recommendations));
    //         }
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //         ctx.status(500).result("Failed to fetch brand-based recommendations.");
    //     }
    // }

    public void getOnlyBrand(Context ctx) {
        try {
            // Extract query parameters
            String brandName = ctx.queryParam("brandName");
            String categoryName = ctx.queryParam("categoryName");
            String currentProductId = ctx.queryParam("currentProductId"); // 🔹 Retrieve from request
    
            // Validate required parameters
            if (brandName == null || brandName.isEmpty()) {
                ctx.status(400).json(Map.of("message", "Missing brandName parameter."));
                return;
            }
    
            if (categoryName == null || categoryName.isEmpty()) {
                ctx.status(400).json(Map.of("message", "Missing categoryName parameter."));
                return;
            }
    
            if (currentProductId == null || currentProductId.isEmpty()) {
                currentProductId = "defaultId"; // 🔹 Set a default value if not provided
            }
    
            // Log the request (Optional for debugging)
            System.out.println("Fetching recommendations for brand: " + brandName + 
                               ", category: " + categoryName + 
                               ", currentProductId: " + currentProductId);
    
            // Call service method
            var recommendations = brandService.getOnlyBrand(brandName, categoryName, currentProductId);
    
            // Return response
            if (recommendations.isEmpty()) {
                ctx.json(Map.of("message", "No recommendations found", "data", List.of()));
            } else {
                ctx.json(Map.of("message", "Recommendations retrieved successfully.", "data", recommendations));
            }
        } catch (Exception e) {
            e.printStackTrace(); // 🔹 Log the exception for debugging
            ctx.status(500).json(Map.of(
                "message", "Error retrieving recommendations", 
                "error", e.getMessage()
            ));
        }
    }
    
}
