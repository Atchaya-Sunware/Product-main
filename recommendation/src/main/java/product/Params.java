package product;

import io.javalin.http.Context;

import java.util.EnumSet;
import java.util.Optional;

public record Params(String query, Sort sort, Order order, int limit, int skip) {
    public Sort sort(Sort defaultSort) {
        return sort == null ? defaultSort : sort;
    }

    public enum Order {
        ASC, DESC;

        static Order of(String value) {
            if (value == null || value.isBlank() || !"DESC".equalsIgnoreCase(value)) return ASC;
            return DESC;
        }
    }

    public enum Sort {
        price, averageRating, title, timestamp; // Declare valid sort fields here

        static Sort of(String name) {
            if (name == null || name.isBlank()) return null;
            try {
                return Sort.valueOf(name);
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
    }

    // Define valid sort fields for product-related queries
    public static final EnumSet<Sort> PRODUCT_SORT = EnumSet.of(Sort.price, Sort.averageRating, Sort.title, Sort.timestamp);

    // Parse query parameters into a Params object
    public static Params parse(Context ctx, EnumSet<Sort> validSort) {
        String q = ctx.queryParam("q"); // Search query
        Sort sort = Sort.of(ctx.queryParam("sort")); // Sort field
        Order order = Order.of(ctx.queryParam("order")); // Sort order
        int limit = Integer.parseInt(Optional.ofNullable(ctx.queryParam("limit")).orElse("10")); // Default limit = 10
        int skip = Integer.parseInt(Optional.ofNullable(ctx.queryParam("skip")).orElse("0")); // Default skip = 0

        // Ensure the sort field is valid; fallback to the first valid sort field if invalid
        if (!validSort.contains(sort)) {
            sort = validSort.iterator().next();
        }

        return new Params(q, sort, order, limit, skip);
    }
}
