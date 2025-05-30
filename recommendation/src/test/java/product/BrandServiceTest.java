// package product;

// import org.junit.jupiter.api.Test;
// import org.neo4j.driver.Driver;
// import org.neo4j.driver.Result;
// import org.neo4j.driver.Session;
// import org.neo4j.driver.SessionConfig;

// import product.services.BrandService;

// import java.util.List;
// import java.util.Map;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.Mockito.*;

// class BrandServiceTest {

//     @Test
//     void testGetBrandRecommendations() {
//         // Step 1: Mock Neo4j Driver and Session
//         Driver mockDriver = mock(Driver.class);
//         Session mockSession = mock(Session.class);
//         when(mockDriver.session(any(SessionConfig.class))).thenReturn(mockSession);

//         // Step 2: Mock Result returned by the query
//         Result mockResult = mock(Result.class);
//         when(mockSession.run(anyString(), anyMap())).thenReturn(mockResult);

//         // Step 3: Mock query result list
//         when(mockResult.list(any()))
//             .thenReturn(List.of(
//                 Map.of(
//                     "parentAsin", "B010BVYLMA",
//                     "features", List.of(
//                         "USB A to USB Motherboard 4-Pin Header F/F Cable, 6\", 5 Pack"
//                     ),
//                     "price", 45.49,
//                     "averageRating", 5.0,
//                     "ratingNumber", 3,
//                     "title", "StarTech USB A to USB Motherboard 4-Pin Header F/F 2.0 Cable, 6\" (USBMBADAPT) 5 Pack",
//                     "brand", "StarTech"
//                 ),
//                 Map.of(
//                     "parentAsin", "B00U384EZG",
//                     "features", List.of(
//                         "Tooless connection Just plug one cable into the front and one into the back of each port.",
//                         "Wall plate looks the same on the front and back (female to female)."
//                     ),
//                     "price", 17.98,
//                     "averageRating", 5.0,
//                     "ratingNumber", 3,
//                     "title", "RiteAV Brush Coax Shielded Cat6 Wall Plate White",
//                     "brand", "RiteAV"
//                 ),
//                 Map.of(
//                     "parentAsin", "B00UFQ3KOC",
//                     "features", List.of(
//                         "RiteAV - Heavy Duty Extension Power Cord, C19 TO C20, 12AWG, 20 AMPS, 250V (Red, 10ft)"
//                     ),
//                     "price", 23.99,
//                     "averageRating", 5.0,
//                     "ratingNumber", 2,
//                     "title", "RiteAV - Heavy Duty Extension Power Cord, C19 TO C20, 12AWG, 20 AMPS, 250V (Red, 10ft)",
//                     "brand", "RiteAV"
//                 )
//             ));

//         // Step 4: Create BrandService instance with mock driver
//         BrandService brandService = new BrandService(mockDriver);

//         // Step 5: Call the getBrandRecommendations method
//         List<Map<String, Object>> recommendations = brandService.getBrandRecommendations("AEFKF6R2GUSK2AWPSWRR4ZO36JVQ");

//         // Step 6: Assertions
//         assertNotNull(recommendations);
//         assertEquals(3, recommendations.size());

//         Map<String, Object> firstRecommendation = recommendations.get(0);
//         assertEquals("StarTech USB A to USB Motherboard 4-Pin Header F/F 2.0 Cable, 6\" (USBMBADAPT) 5 Pack", firstRecommendation.get("title"));
//         assertEquals(45.49, firstRecommendation.get("price"));
//         assertEquals(5.0, firstRecommendation.get("averageRating"));
//         assertEquals("StarTech", firstRecommendation.get("brand"));

//         Map<String, Object> secondRecommendation = recommendations.get(1);
//         assertEquals("RiteAV Brush Coax Shielded Cat6 Wall Plate White", secondRecommendation.get("title"));
//         assertEquals(17.98, secondRecommendation.get("price"));
//         assertEquals(5.0, secondRecommendation.get("averageRating"));
//         assertEquals("RiteAV", secondRecommendation.get("brand"));

//         Map<String, Object> thirdRecommendation = recommendations.get(2);
//         assertEquals("RiteAV - Heavy Duty Extension Power Cord, C19 TO C20, 12AWG, 20 AMPS, 250V (Red, 10ft)", thirdRecommendation.get("title"));
//         assertEquals(23.99, thirdRecommendation.get("price"));
//         assertEquals(5.0, thirdRecommendation.get("averageRating"));
//         assertEquals("RiteAV", thirdRecommendation.get("brand"));

//         // Step 7: Verify session usage
//         verify(mockSession).run(anyString(), eq(Map.of("userId", "AEFKF6R2GUSK2AWPSWRR4ZO36JVQ")));
//         verify(mockSession).close();
//     }
// }

























