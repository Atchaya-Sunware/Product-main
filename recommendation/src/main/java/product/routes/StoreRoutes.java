package product.routes;

import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;
import product.services.StoreService;

import org.neo4j.driver.Driver;
import com.google.gson.Gson;

import static io.javalin.apibuilder.ApiBuilder.get;

import java.util.Collections;
import java.util.Map;

public class StoreRoutes implements EndpointGroup {
    private final StoreService storeService;
    private final Gson gson;

    public StoreRoutes(Driver driver, Gson gson) {
        this.storeService = new StoreService(driver);
        this.gson = gson;
    }

    @Override
    public void addEndpoints() {
        get("/storeUserBasedRecomm", this::getUserBasedStoreRecommendations);
    }

 // Add this method to your Store.java controller class

 public void getUserBasedStoreRecommendations(Context ctx) {
    String userId = ctx.queryParam("userId");
    String productId = ctx.queryParam("productId");

    if (userId == null || userId.isEmpty()) {
        ctx.status(400).result("Missing userId parameter.");
        return;
    }

    if (productId == null || productId.isEmpty()) {
        ctx.status(400).result("Missing productId parameter.");
        return;
    }

    try {
        var recommendations = storeService.getUserBasedStoreRecommendations(userId, productId);
        if (recommendations.isEmpty()) {
            ctx.json(Map.of("data", Collections.emptyList(), "message", "No user-based store recommendations found."));
        } else {
            ctx.json(Map.of("data", recommendations));
        }
    } catch (Exception e) {
        e.printStackTrace();
        ctx.status(500).result("Failed to fetch user-based store recommendations: " + e.getMessage());
    }
}

}
