package product;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;
import product.routes.BrandRoutes;
import product.routes.CategoryRoutes;
import product.routes.ProductRoutes;
import product.routes.StoreRoutes;
import product.routes.UserRoutes;

import org.neo4j.driver.Driver;
import product.services.ProductService;
import com.google.gson.Gson;

import static io.javalin.apibuilder.ApiBuilder.path;

@SuppressWarnings("java:S2095")
public class Recommendation {
    public static void main(String[] args) {
        System.out.println("Starting Recommendation Application...");
        AppUtils.loadProperties();

        // Initialize Neo4j driver
        Driver driver = AppUtils.initDriver();

        // Initialize Gson
        Gson gson = GsonUtils.gson();

        // Start the Javalin server
        Javalin app = Javalin.create(config -> {
            config.staticFiles.add(staticFileConfig -> {
                staticFileConfig.hostedPath = "/";
                staticFileConfig.directory = "/public";
                staticFileConfig.location = Location.CLASSPATH;
            });
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
        });
        // Add routes
        app.routes(() -> {
            path("/api", () -> {
                path("/products", new ProductRoutes(driver, gson)); //Add product routes
                path("/users", new UserRoutes(driver, gson)); // Add user routes
                path("/stores", new StoreRoutes(driver, gson)); // Add stores routes
                path("/brands", new BrandRoutes(driver, gson)); // Added Brand Routes
                path("/category", new CategoryRoutes(driver, gson)); // Added Category Routes


            });
            });

        // Global exception handler
        app.exception(Exception.class, (exception, ctx) -> {
            System.err.println("Unhandled exception: " + exception.getMessage());
            ctx.status(500).result("Internal Server Error");
        });

        // Start the server
        int port = AppUtils.getServerPort();
        app.start(port);
        System.out.printf("Server listening on http://localhost:%d/%n", port);
    }
}
