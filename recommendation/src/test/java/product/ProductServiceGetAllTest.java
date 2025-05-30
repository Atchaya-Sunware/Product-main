package product;

import org.junit.jupiter.api.Test;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;
import product.services.ProductService;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductServiceGetAllTest {

    //AAA - Arrange,Act,Assert

    @Test
    void testGetAllProducts() {
        // Step 1: Mock Neo4j Driver and Session
        Driver mockDriver = mock(Driver.class);
        Session mockSession = mock(Session.class);
        when(mockDriver.session(any(SessionConfig.class))).thenReturn(mockSession);

        // Step 2: Mock Result returned by the query
        Result mockResult = mock(Result.class);
        when(mockSession.run(anyString())).thenReturn(mockResult);
 
        // Step 3: Mock query result list
        when(mockResult.list(any()))
            .thenReturn(List.of(
                Map.of(
                    "product", Map.of(
                        "elementId", 66205,
                        "parentAsin", "B08PCSD1BP",
                        "title", "TN310 Toner Cartridge Replacement",
                        "price", 153.98,
                        "averageRating", 4.6
                    ),
                    "brand", Map.of("brandName", "!iT Jeans"),
                    "store", Map.of("storeName", "!iT Jeans"),
                    "image", Map.of(
                        "large", "https://m.media-amazon.com/images/I/5131rl+E0wL._AC_.jpg"
                    )
                )
            ));

        // Step 4: Create ProductService instance with mock driver
        ProductService productService = new ProductService(mockDriver);

        // Step 5: Call the getAllProducts method
        List<Map<String, Object>> products = productService.getAllProducts();

        // Step 6: Assertions
        assertNotNull(products);
        assertEquals(1, products.size());

        Map<String, Object> product = products.get(0);
        assertEquals("TN310 Toner Cartridge Replacement", ((Map<String, Object>) product.get("product")).get("title"));
        assertEquals("!iT Jeans", ((Map<String, Object>) product.get("brand")).get("brandName"));
        assertEquals("!iT Jeans", ((Map<String, Object>) product.get("store")).get("storeName"));
        assertEquals("https://m.media-amazon.com/images/I/5131rl+E0wL._AC_.jpg", ((Map<String, Object>) product.get("image")).get("large"));

        // Step 7: Verify session usage
        verify(mockSession).run(anyString());
        verify(mockSession).close();
    }
}
