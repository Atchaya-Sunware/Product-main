// package product;

// import org.junit.jupiter.api.Test;
// import org.neo4j.driver.Driver;
// import org.neo4j.driver.Result;
// import org.neo4j.driver.Session;
// import org.neo4j.driver.SessionConfig;

// import product.services.StoreService;

// import java.util.List;
// import java.util.Map;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.Mockito.*;

// class StoreServiceTest {

//     @Test
//     void testGetStoreBasedRecommendations() {
//         // Step 1: Mock the Neo4j Driver and Session
//         Driver mockDriver = mock(Driver.class);
//         Session mockSession = mock(Session.class);
//         when(mockDriver.session(any(SessionConfig.class))).thenReturn(mockSession);

//         // Step 2: Mock the Result returned by the query
//         Result mockResult = mock(Result.class);
//         when(mockSession.run(anyString(), anyMap())).thenReturn(mockResult);

//         // Step 3: Mock the data returned by the Result object
//         when(mockResult.list(any()))
//             .thenReturn(List.of(
//                 Map.of(
//                     "parentAsin", "B007I1QYF4",
//                     "title", "Sony MDRV55 White Extra Bass & DJ Headphones MDR-V55 MDRV55W",
//                     "price", 157.85,
//                     "averageRating", 5.0,
//                     "store", "Sony",
//                     "salesRank", "All Electronics",
//                     "popularity", 1
//                 ),
//                 Map.of(
//                     "parentAsin", "B000VQOVLC",
//                     "title", "Sony 4 GB 300x CompactFlash Memory Card NCFD4G",
//                     "price", 29.95,
//                     "averageRating", 5.0,
//                     "store", "Sony",
//                     "salesRank", "All Electronics",
//                     "popularity", 1
//                 )
//             ));

//         // Step 4: Create an instance of StoreService with the mocked Driver
//         StoreService storeService = new StoreService(mockDriver);

//         // Step 5: Call the getStoreBasedRecommendations method
//         List<Map<String, Object>> recommendations = storeService.getStoreBasedRecommendations("AGXVBIUFLFGMVLATYXHJYL4A5Q7Q");

//         // Step 6: Log the retrieved recommendations
//         System.out.println("Retrieved Recommendations from Service: ");
//         recommendations.forEach(System.out::println);

//         // Step 7: Expected data
//         List<Map<String, Object>> expectedRecommendations = List.of(
//             Map.of(
//                 "parentAsin", "B007I1QYF4",
//                 "title", "Sony MDRV55 White Extra Bass & DJ Headphones MDR-V55 MDRV55W",
//                 "price", 157.85,
//                 "averageRating", 5.0,
//                 "store", "Sony",
//                 "salesRank", "All Electronics",
//                 "popularity", 1
//             ),
//             Map.of(
//                 "parentAsin", "B000VQOVLC",
//                 "title", "Sony 4 GB 300x CompactFlash Memory Card NCFD4G",
//                 "price", 29.95,
//                 "averageRating", 5.0,
//                 "store", "Sony",
//                 "salesRank", "All Electronics",
//                 "popularity", 1
//             )
//         );

//         System.out.println("Expected Recommendations: ");
//         expectedRecommendations.forEach(System.out::println);

//         // Step 8: Assert the results
//         assertNotNull(recommendations);
//         assertEquals(expectedRecommendations.size(), recommendations.size());

//         for (int i = 0; i < recommendations.size(); i++) {
//             Map<String, Object> actual = recommendations.get(i);
//             Map<String, Object> expected = expectedRecommendations.get(i);

//             // Log what is being compared
//             System.out.println("Comparing: ");
//             System.out.println("Actual: " + actual);
//             System.out.println("Expected: " + expected);

//             // Validate individual fields
//             assertEquals(expected.get("parentAsin"), actual.get("parentAsin"));
//             assertEquals(expected.get("title"), actual.get("title"));
//             assertEquals(expected.get("price"), actual.get("price"));
//             assertEquals(expected.get("averageRating"), actual.get("averageRating"));
//             assertEquals(expected.get("store"), actual.get("store"));
//             assertEquals(expected.get("salesRank"), actual.get("salesRank"));
//         }

//         // Verify the session interaction
//         verify(mockSession).run(anyString(), eq(Map.of("userId", "AGXVBIUFLFGMVLATYXHJYL4A5Q7Q")));
//         verify(mockSession).close(); // Ensure the session is closed
//     }
// }
