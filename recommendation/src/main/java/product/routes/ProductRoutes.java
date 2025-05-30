package product.routes;

import io.javalin.apibuilder.EndpointGroup;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import product.services.ProductService;

import org.neo4j.driver.Driver;
import com.google.gson.Gson;

import static io.javalin.apibuilder.ApiBuilder.get;
import java.util.List;
import java.util.Map;

public class ProductRoutes implements EndpointGroup {
    private final ProductService productService;
    private final Gson gson;

    public ProductRoutes(Driver driver, Gson gson) {
        this.productService = new ProductService(driver);
        this.gson = gson;
    }

    @Override
    public void addEndpoints() {
        get("/all", this::getAllProducts);
        get("/product/{id}", this::getProductById);
        get("/search", this::searchProducts);
        get("/getAllCategory", this::getAllByCategory);
    }

    public void getAllProducts(Context ctx) {
        System.out.println("Fetching all products...");
    
        var products = productService.getAllProducts(); // ✅ No pagination parameters needed
    
        if (products == null || products.isEmpty()) {
            ctx.status(HttpStatus.NOT_FOUND)
               .json(Map.of("message", "No products found.", "data", List.of()));
        } else {
            ctx.json(Map.of("message", "Products retrieved successfully.", "data", products));
        }
    }

    public void getAllByCategory(Context ctx) {
        System.out.println("Fetching products by category...");
        System.out.println("Received query params: " + ctx.queryParamMap());
    
        String categoryName = ctx.queryParam("categoryName");
    
        if (categoryName == null || categoryName.trim().isEmpty()) {
            ctx.status(HttpStatus.BAD_REQUEST)
               .json(Map.of("message", "Category name is required.", "data", List.of()));
            return;
        }
    
        System.out.println("Fetching products for category: " + categoryName);
        
        try {
            var products = productService.getAllByCategory(categoryName);
    
            if (products == null || products.isEmpty()) {
                // Log additional debug information
                System.out.println("No products found for category: " + categoryName);
                ctx.status(HttpStatus.NOT_FOUND)
                   .json(Map.of("message", "No products found for category: " + categoryName, "data", List.of()));
            } else {
                System.out.println("Found " + products.size() + " products in category: " + categoryName);
                ctx.json(Map.of(
                    "message", "Products retrieved successfully for category: " + categoryName, 
                    "data", products,
                    "category", categoryName
                ));
            }
        } catch (Exception e) {
            // Log the full exception for detailed debugging
            e.printStackTrace();
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .json(Map.of("message", "Error retrieving products: " + e.getMessage(), "data", List.of()));
        }
    }
    

    

    public void getProductById(Context ctx) {
        String productId = ctx.pathParam("id");

        if (productId == null || productId.trim().isEmpty()) {
            ctx.status(HttpStatus.BAD_REQUEST)
               .json(Map.of("error", "Missing product ID."));
            return;
        }

        System.out.println("Fetching product details for ID: " + productId);
        var product = productService.getProductById(productId);

        if (product == null) { // Fix: Check for null instead of isEmpty()
            ctx.status(HttpStatus.NOT_FOUND)
               .json(Map.of("error", "Product not found."));
        } else {
            ctx.json(Map.of("message", "Product retrieved successfully.", "data", product));
        }
    }

    public void searchProducts(Context ctx) {
        // Accept both "q" and "keyword" parameters to be flexible
        String keyword = ctx.queryParam("q");
        if (keyword == null || keyword.trim().isEmpty()) {
            keyword = ctx.queryParam("keyword");
        }
        
        if (keyword == null || keyword.trim().isEmpty()) {
            ctx.status(HttpStatus.BAD_REQUEST)
               .json(Map.of("error", "Search keyword is required."));
            return;
        }

        System.out.println("Searching for products with keyword: " + keyword);
        List<Map<String, Object>> products = productService.searchProducts(keyword.toLowerCase());

        if (products.isEmpty()) {
            ctx.status(HttpStatus.NOT_FOUND)
               .json(Map.of("message", "No products found for the given keyword.", "data", List.of()));
        } else {
            ctx.json(Map.of("message", "Search results retrieved successfully.", "data", products));
        }
    }
}
