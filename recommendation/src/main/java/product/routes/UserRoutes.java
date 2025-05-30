package product.routes;

import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;
import product.services.UserService;

import org.neo4j.driver.Driver;
import com.google.gson.Gson;

import static io.javalin.apibuilder.ApiBuilder.get;

public class UserRoutes implements EndpointGroup {
    private final UserService userService;
    private final Gson gson;

    public UserRoutes(Driver driver, Gson gson) {
        this.userService = new UserService(driver);
        this.gson = gson;
    }

    @Override
    public void addEndpoints() {
        // Endpoints for recommendations
        get("/personalRecomm", this::getPersonalizedRecommendations);
        get("/hybridRecomm", this::getHybridRecommendations);
        get("/userBasedRecomm", this::getUserBasedRecommendations);
    }

    // Get personalized recommendations for the user
    public void getPersonalizedRecommendations(Context ctx) {
        String userId = ctx.queryParam("user_id");
        if (userId == null || userId.isEmpty()) {
            ctx.status(400).result("Missing userId parameter.");
            return;
        }

        System.out.println("Fetching personalized recommendations for user: " + userId);
        
        // Fetch the personalized recommendations
        var recommendations = userService.getPersonalizedRecommendations(userId);
        
        // Return the recommendations as a JSON response
        if (recommendations.isEmpty()) {
            ctx.json("No personalized recommendations found.");
        } else {
            ctx.json(recommendations); // No need to wrap it in an extra "data" key
        }
    }

    // Get hybrid recommendations for the user (based on multiple factors)
    public void getHybridRecommendations(Context ctx) {
        String userId = ctx.queryParam("userId");
        if (userId == null || userId.isEmpty()) {
            ctx.status(400).result("Missing userId parameter.");
            return;
        }

        try {
            var recommendations = userService.getHybridRecommendations(userId);
            if (recommendations.isEmpty()) {
                ctx.json("No hybrid recommendations found.");
            } else {
                ctx.result(gson.toJson(recommendations));
            }
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).result("Failed to fetch hybrid recommendations.");
        }
    }

    // Get user-based recommendations for the user
public void getUserBasedRecommendations(Context ctx) {
    String userId = ctx.queryParam("userId");
    String currentProductId = ctx.queryParam("currentProductId");

    // Validate query parameters
    if (userId == null || userId.isEmpty() || currentProductId == null || currentProductId.isEmpty()) {
        ctx.status(400).result("Missing userId or currentProductId parameter.");
        return;
    }

    System.out.println("Fetching user-based recommendations for user: " + userId + " for product: " + currentProductId);

    try {
        // Fetch user-based recommendations based on userId and current product
        var recommendations = userService.getUserBasedRecommendations(userId, currentProductId);

        // Return the recommendations as a JSON response
        if (recommendations.isEmpty()) {
            ctx.json("No user-based recommendations found.");
        } else {
            ctx.json(recommendations);
        }
    } catch (Exception e) {
        e.printStackTrace();
        ctx.status(500).result("Failed to fetch user-based recommendations.");
    }
}

}
