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

class PersonalizedRecommendationTest {

    @Test
    void testGetPersonalizedRecommendations() {
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
                    "otherUserRatings", List.of(3.0),
                    "price", 2288.01,
                    "averageRating", 3.0,
                    "avgRating", 3.0,
                    "category", "LED & LCD TVs",
                    "title", "SYLVOX 65 Inch Outdoor TV",
                    "ratingCount", 1
                ),
                Map.of(
                    "otherUserRatings", List.of(4.0),
                    "price", 391.0,
                    "averageRating", 4.0,
                    "avgRating", 4.0,
                    "category", "LED & LCD TVs",
                    "title", "VIZIO V436-G1 V-Series 43”",
                    "ratingCount", 1
                )
            ));

        // Step 4: Create an instance of UserService with the mocked Driver
        UserService userService = new UserService(mockDriver);

        // Step 5: Call the getPersonalizedRecommendations method
        List<Map<String, Object>> recommendations = userService.getPersonalizedRecommendations("AFNT6ZJCYQN3WDIKUSWHJDXNND2Q");

        // Step 6: Assertions
        assertNotNull(recommendations);
        assertEquals(2, recommendations.size());

        // Validate the first recommendation
        Map<String, Object> firstRecommendation = recommendations.get(0);
        assertEquals("SYLVOX 65 Inch Outdoor TV", firstRecommendation.get("title"));
        assertEquals(2288.01, firstRecommendation.get("price"));
        assertEquals(3.0, firstRecommendation.get("averageRating"));

        // Validate the second recommendation
        Map<String, Object> secondRecommendation = recommendations.get(1);
        assertEquals("VIZIO V436-G1 V-Series 43”", secondRecommendation.get("title"));
        assertEquals(391.0, secondRecommendation.get("price"));
        assertEquals(4.0, secondRecommendation.get("averageRating"));

        // Step 7: Verify session interaction
        verify(mockSession).run(anyString(), eq(Map.of("userId", "AFNT6ZJCYQN3WDIKUSWHJDXNND2Q")));
        verify(mockSession).close();
    }
}
