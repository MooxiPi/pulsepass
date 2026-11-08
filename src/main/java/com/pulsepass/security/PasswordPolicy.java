package com.pulsepass.security;
import java.nio.charset.StandardCharsets;
public final class PasswordPolicy {
    private PasswordPolicy() {}
    public static boolean valid(String password) {
        return password != null && !password.isBlank() && password.codePointCount(0,password.length()) >= 12
            && password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }
}
