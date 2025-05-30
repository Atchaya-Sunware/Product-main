package product.routes;

import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;
import product.services.CategoryService;

import org.neo4j.driver.Driver;
import com.google.gson.Gson;

import static io.javalin.apibuilder.ApiBuilder.get;

public class CategoryRoutes implements EndpointGroup {
    private final CategoryService categoryService;
    private final Gson gson;

    public CategoryRoutes(Driver driver, Gson gson) {
        this.categoryService = new CategoryService(driver);
        this.gson = gson;
    }

    @Override
    public void addEndpoints() {
        // Define the endpoint to fetch category recommendations
        get("/categoryRecomm", this::getCategoryRecommendations);
    }

    public void getCategoryRecommendations(Context ctx) {
        String userId = ctx.queryParam("userId");
        if (userId == null || userId.isEmpty()) {
            ctx.status(400).result("Missing userId parameter.");
            return;
        }

        try {
            var recommendations = categoryService.getCategoryRecommendation(userId);
            if (recommendations.isEmpty()) {
                ctx.json("No category-based recommendations found.");
            } else {
                ctx.result(gson.toJson(recommendations));
            }
        } catch (Exception e) {
            e.printStackTrace();
            ctx.status(500).result("Failed to fetch category-based recommendations.");
        }
    }
}
