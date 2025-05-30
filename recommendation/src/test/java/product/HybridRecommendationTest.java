package product;

import org.junit.jupiter.api.Test;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;

import product.services.UserService;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HybridRecommendationTest {

    @Test
    void testGetHybridRecommendations() {
        // Step 1: Mock Neo4j Driver and Session
        Driver mockDriver = mock(Driver.class);
        Session mockSession = mock(Session.class);
        when(mockDriver.session(any(SessionConfig.class))).thenReturn(mockSession);

        // Step 2: Mock the Result returned by the query
        Result mockResult = mock(Result.class);
        when(mockSession.run(anyString(), anyMap())).thenReturn(mockResult);

        // Step 3: Mock the data returned by the Result object
        when(mockResult.list(any()))
            .thenReturn(List.of(
                Map.of(
                    "parentAsin", "B0C4R4KKNZ",
                    "features", List.of("Strada Series is a premium leather Folio case..."),
                    "price", 28.86,
                    "averageRating", 4.3,
                    "description", List.of("Premium Leather. Proven Protection."),
                    "ratingNumber", 15,
                    "category", "Cases",
                    "title", "OtterBox Strada Case for Samsung Galaxy S22+",
                    "salesRank", "All Electronics"
                ),
                Map.of(
                    "parentAsin", "B07CMS5TXR",
                    "features", List.of("Access to all buttons and features"),
                    "price", 30.0,
                    "averageRating", 4.2,
                    "description", List.of("Keep your iPod touch safe with an OtterBox!"),
                    "ratingNumber", 194,
                    "category", "Cases",
                    "title", "OtterBox Commuter Series Case for iPod",
                    "salesRank", "All Electronics"
                )
            ));

        // Step 4: Create an instance of UserService with the mocked Driver
        UserService userService = new UserService(mockDriver);

        // Step 5: Call the getHybridRecommendations method
        List<Map<String, Object>> recommendations = userService.getHybridRecommendations("AGXVBIUFLFGMVLATYXHJYL4A5Q7Q");

        // Step 6: Assertions
        assertNotNull(recommendations);
        assertEquals(2, recommendations.size());

        // Validate the first recommendation
        Map<String, Object> firstRecommendation = recommendations.get(0);
        assertEquals("OtterBox Strada Case for Samsung Galaxy S22+", firstRecommendation.get("title"));
        assertEquals(28.86, firstRecommendation.get("price"));
        assertEquals(4.3, firstRecommendation.get("averageRating"));

        // Validate the second recommendation
        Map<String, Object> secondRecommendation = recommendations.get(1);
        assertEquals("OtterBox Commuter Series Case for iPod", secondRecommendation.get("title"));
        assertEquals(30.0, secondRecommendation.get("price"));
        assertEquals(4.2, secondRecommendation.get("averageRating"));

        // Step 7: Verify session interaction
        verify(mockSession).run(anyString(), eq(Map.of("userId", "AGXVBIUFLFGMVLATYXHJYL4A5Q7Q")));
        verify(mockSession).close();
    }
}
