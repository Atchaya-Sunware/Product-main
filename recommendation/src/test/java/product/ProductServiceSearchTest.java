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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ProductServiceSearchTest {

    @Test
    void testSearchProducts() {
        // Step 1: Mock Neo4j Driver and Session
        //Fake Neo4j driver to simulate database interactions.
        Driver mockDriver = mock(Driver.class);
        //Fake database session to execute the query.
        Session mockSession = mock(Session.class);
        // Whenever mockDriver.session(...) is called, return mockSession.
        //ensures we don't connect to a real database but use a mock session instead.
        when(mockDriver.session(any(SessionConfig.class))).thenReturn(mockSession);

        // Step 2: Mock Result returned by the query
        Result mockResult = mock(Result.class);
        when(mockSession.run(anyString(), anyMap())).thenReturn(mockResult);

        // Step 3: Mock query result list
        when(mockResult.list(any()))
            .thenReturn(List.of(
                Map.of(
                    "product", Map.of(
                        "elementId", 136019,
                        "parentAsin", "1681983389",
                        "title", "David Busch's Canon EOS Rebel SL2/200D Guide",
                        "price", 24.49,
                        "averageRating", 4.7
                    ),
                    "brand", Map.of("brandName", "Unknown"),
                    "store", Map.of("storeName", "David D. Busch (Author)"),
                    "image", Map.of(
                        "large", "https://m.media-amazon.com/images/I/51gRZTR2Y0L._SX384_BO1,204,203,200_.jpg"
                    )
                )
            ));

        // Step 4: Create ProductService instance with mock driver
        ProductService productService = new ProductService(mockDriver);

        // Step 5: Call the searchProducts method
        List<Map<String, Object>> searchResults = productService.searchProducts("digital");

        // Step 6: Assertions
        assertNotNull(searchResults);
        assertEquals(1, searchResults.size());

        Map<String, Object> result = searchResults.get(0);
        assertEquals("David Busch's Canon EOS Rebel SL2/200D Guide", ((Map<String, Object>) result.get("product")).get("title"));
        assertEquals("Unknown", ((Map<String, Object>) result.get("brand")).get("brandName"));
        assertEquals("David D. Busch (Author)", ((Map<String, Object>) result.get("store")).get("storeName"));
        assertEquals("https://m.media-amazon.com/images/I/51gRZTR2Y0L._SX384_BO1,204,203,200_.jpg", ((Map<String, Object>) result.get("image")).get("large"));

        // Step 7: Verify session usage
        verify(mockSession).run(anyString(), eq(Map.of("keyword", "digital")));
        verify(mockSession).close();
    }
}
