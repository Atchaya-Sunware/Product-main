package product;


import com.google.gson.*;
import java.lang.reflect.Type;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.logging.Logger;

public class GsonUtils {
    private static final Logger LOGGER = Logger.getLogger(GsonUtils.class.getName());


    // Create a configured Gson instance
    public static Gson gson() {
        try {
            // Get the EmptyList class type
            Class<?> type = Class.forName("java.util.Collections$EmptyList");
            GsonBuilder gsonBuilder = new GsonBuilder()
                // Register custom serializer for LocalDate
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                // Number policies for flexible handling of integers and decimals
                .setNumberToNumberStrategy(ToNumberPolicy.LONG_OR_DOUBLE)
                .setObjectToNumberStrategy(ToNumberPolicy.LONG_OR_DOUBLE)
                // Register custom serializer for empty lists
                .registerTypeAdapter(type, new EmptyListSerializer());
            return gsonBuilder.create();
        } catch (ClassNotFoundException cnfe) {
            LOGGER.severe("Class not found: java.util.Collections$EmptyList");
            throw new RuntimeException("Class not found: java.util.Collections$EmptyList", cnfe);
        }
    }

    // Custom serializer for LocalDate
    static class LocalDateSerializer implements JsonSerializer<LocalDate> {
        private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy"); // E.g., 01-Jan-2025
    
        @Override
        public JsonElement serialize(LocalDate localDate, Type srcType, JsonSerializationContext context) {
            return new JsonPrimitive(formatter.format(localDate));
        }
    }
    

    // Custom serializer for empty lists
    static class EmptyListSerializer implements JsonSerializer<List<?>> {
        @Override
        public JsonElement serialize(List<?> list, Type srcType, JsonSerializationContext context) {
            return new JsonArray(); // Serialize empty lists as []
        }
    }
    
}