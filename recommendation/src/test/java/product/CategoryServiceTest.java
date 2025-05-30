package product;

import org.junit.jupiter.api.Test;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;

import product.services.CategoryService;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CategoryServiceTest {

    @Test
    void testGetCategoryRecommendation() {
        // Step 1: Mock Neo4j Driver and Session
        Driver mockDriver = mock(Driver.class);
        Session mockSession = mock(Session.class);
        when(mockDriver.session(any(SessionConfig.class))).thenReturn(mockSession);

        // Step 2: Mock Result returned by the query
        Result mockResult = mock(Result.class);
        when(mockSession.run(anyString(), anyMap())).thenReturn(mockResult);

        // Step 3: Mock query result list
        when(mockResult.list(any()))
            .thenReturn(List.of(
                Map.of(
                    "parentAsin", "B0C7MDYRWW",
                    "features", List.of(
                        "Greater Capacity : The Hard case can fits your Xbox Wireless Headset",
                        "Sturdy and Strong case : High quality EVA material",
                        "Perfect Travel Carrying Case"
                    ),
                    "price", 21.99,
                    "averageRating", 5.0,
                    "description", List.of(),
                    "ratingNumber", 36,
                    "category", "Cases",
                    "title", "XANAD Hard Case for Xbox Wireless Headset"
                ),
                Map.of(
                    "parentAsin", "B084QVGR2C",
                    "features", List.of(
                        "Essential utility, leading-edge technologies",
                        "Cutting edge technology"
                    ),
                    "price", 24.99,
                    "averageRating", 5.0,
                    "description", List.of(
                        "Protect your Edge 530 with this form-fitting silicone case."
                    ),
                    "ratingNumber", 22,
                    "category", "Cases",
                    "title", "GARMIN Edge 530 Case"
                )
            ));

        // Step 4: Create CategoryService instance with mock driver
        CategoryService categoryService = new CategoryService(mockDriver);

        // Step 5: Call the getCategoryRecommendation method
        List<Map<String, Object>> recommendations = categoryService.getCategoryRecommendation("AGXVBIUFLFGMVLATYXHJYL4A5Q7Q");

        // Step 6: Assertions
        assertNotNull(recommendations);
        assertEquals(2, recommendations.size());

        Map<String, Object> firstRecommendation = recommendations.get(0);
        assertEquals("XANAD Hard Case for Xbox Wireless Headset", firstRecommendation.get("title"));
        assertEquals(21.99, firstRecommendation.get("price"));
        assertEquals(5.0, firstRecommendation.get("averageRating"));
        assertEquals("Cases", firstRecommendation.get("category"));

        Map<String, Object> secondRecommendation = recommendations.get(1);
        assertEquals("GARMIN Edge 530 Case", secondRecommendation.get("title"));
        assertEquals(24.99, secondRecommendation.get("price"));
        assertEquals(5.0, secondRecommendation.get("averageRating"));
        assertEquals("Cases", secondRecommendation.get("category"));

        // Step 7: Verify session usage
        verify(mockSession).run(anyString(), eq(Map.of("userId", "AGXVBIUFLFGMVLATYXHJYL4A5Q7Q")));
        verify(mockSession).close();
    }
}
