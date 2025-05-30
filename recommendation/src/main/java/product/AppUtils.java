package product;

import org.neo4j.driver.*;

import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;

import io.javalin.http.Context;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;
import java.util.Map;

public class AppUtils {

    

    // Load application properties into system properties
    public static void loadProperties() {
        try {
            var file = AppUtils.class.getResourceAsStream("/application.properties");
            if (file != null) {
                System.getProperties().load(file);
            } else {
                throw new RuntimeException("application.properties not found.");
            }
        } catch (IOException e) {
            throw new RuntimeException("Error loading application.properties", e);
        }
    }

    // Get userId from the context (e.g., for authenticated requests)
    public static String getUserId(Context ctx) {
        Object user = ctx.attribute("user");
        return user != null ? user.toString() : null;
    }

    // Handle JWT-based authentication and set user attribute in the request
    public static void handleAuthAndSetUser(Context ctx, String jwtSecret) {
    String token = ctx.header("Authorization");
    if (token != null && token.startsWith("Bearer ")) {
        token = token.substring("Bearer ".length());
        try {
            String userId = AuthUtils.verify(token, jwtSecret);
            ctx.attribute("user", userId);
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT token.");
        }
    } else {
        throw new RuntimeException("Authorization header is missing or invalid.");
    }
}

    

    // Initialize the Neo4j driver
    public static Driver initDriver() {
        System.out.println("Initializing Neo4j driver...");
        System.out.println("Neo4j URI: " + getNeo4jUri());
        System.out.println("Neo4j Username: " + getNeo4jUsername());
        AuthToken auth = AuthTokens.basic(getNeo4jUsername(), getNeo4jPassword());
        Driver driver = GraphDatabase.driver(getNeo4jUri(), auth);
        try {
            driver.verifyConnectivity();
            System.out.println("Successfully connected to Neo4j!");
        } catch (Exception e) {
            System.err.println("Failed to connect to Neo4j: " + e.getMessage());
            e.printStackTrace();
        }
        return driver;
    }
    
    

    // Get the server port from properties or use default (3000)
    public static int getServerPort() {
        return Integer.parseInt(System.getProperty("APP_PORT", "9000"));
    }

    // Get the JWT secret from properties
    public static String getJwtSecret() {
        return System.getProperty("JWT_SECRET");
    }

    // Get the Neo4j URI from properties
    public static String getNeo4jUri() {
        return System.getProperty("NEO4J_URI");
    }

    // Get the Neo4j username from properties
    public static String getNeo4jUsername() {
        return System.getProperty("NEO4J_USERNAME");
    }

    // Get the Neo4j password from properties
    public static String getNeo4jPassword() {
        return System.getProperty("NEO4J_PASSWORD");
    }

    // Load a JSON fixture file as a List of Maps
    public static List<Map<String, Object>> loadFixtureList(final String name) {
    try (var fixture = new InputStreamReader(AppUtils.class.getResourceAsStream("/fixtures/" + name + ".json"))) {
        Type type = new TypeToken<List<Map<String, Object>>>() {}.getType();
        return GsonUtils.gson().fromJson(fixture, type);
    } catch (IOException e) {
        throw new RuntimeException("Error loading fixture: " + name, e);
    }
}

public static Map<String, Object> loadFixtureSingle(final String name) {
    try (var fixture = new InputStreamReader(AppUtils.class.getResourceAsStream("/fixtures/" + name + ".json"))) {
        Type type = new TypeToken<Map<String, Object>>() {}.getType();
        return GsonUtils.gson().fromJson(fixture, type);
    } catch (IOException e) {
        throw new RuntimeException("Error loading fixture: " + name, e);
    }
}


    // Process results with sorting, pagination, and limiting
public static List<Map<String, Object>> process(List<Map<String, Object>> result, Params params) {
    return params == null ? result : result.stream()
            .sorted((m1, m2) -> {
                Object value1 = m1.getOrDefault(params.sort().name(), "");
                Object value2 = m2.getOrDefault(params.sort().name(), "");

                // Ensure values are Comparable
                if (value1 instanceof Comparable<?> && value2 instanceof Comparable<?>) {
                    @SuppressWarnings("unchecked") // Suppress unchecked cast warning
                    Comparable<Object> comparableValue1 = (Comparable<Object>) value1;
                    @SuppressWarnings("unchecked")
                    Comparable<Object> comparableValue2 = (Comparable<Object>) value2;
                    return (params.order() == Params.Order.ASC ? 1 : -1) * comparableValue1.compareTo(comparableValue2);
                }

                // If values are not comparable, consider them equal
                return 0;
            })
            .skip(params.skip())
            .limit(params.limit())
            .toList();
}


}

