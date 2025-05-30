package product;

import at.favre.lib.crypto.bcrypt.BCrypt;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.util.Calendar;
import java.util.Date;
import java.util.Map;

public class AuthUtils {

    // Encrypt a password using BCrypt with a strength factor of 12
    public static String encryptPassword(String password) {
        return BCrypt.withDefaults().hashToString(12, password.toCharArray());
    }

    // Verify a password against a hashed value
    public static boolean verifyPassword(String password, String hashed) {
        BCrypt.Result result = BCrypt.verifyer().verify(password.toCharArray(), hashed);
        return result.verified;
    }

    // Verify a JWT token and return the subject (e.g., userId)
    public static String verify(String token, String secret) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer("auth0") // Use the same issuer used during token signing
                    .build();
            DecodedJWT jwt = verifier.verify(token);
            return jwt.getSubject(); // Subject typically stores the userId
        } catch (JWTVerificationException exception) {
            throw new RuntimeException("Invalid JWT token: " + exception.getMessage(), exception);
        }
    }

    // Sign and generate a JWT token with userId as the subject and additional claims
    public static String sign(String userId, Map<String, Object> claims, String secret) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);

            // Set token expiration to 1 day from now
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DATE, 1);

            // Create the token
            return JWT.create()
                    .withIssuer("auth0") // Use a consistent issuer for validation
                    .withSubject(userId) // Subject stores the userId
                    .withIssuedAt(new Date()) // Token issued at current time
                    .withExpiresAt(cal.getTime()) // Expiration time
                    .withPayload(claims) // Additional claims
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Error creating JWT token: " + exception.getMessage(), exception);
        }
    }
}