package com.pulsepass.security;

import java.nio.charset.StandardCharsets;

/** Contraseña: al menos 12 caracteres y como máximo 72 bytes UTF-8 (límite de BCrypt). */
public final class PasswordPolicy {

    private static final int MIN_CODE_POINTS = 12;
    private static final int MAX_UTF8_BYTES = 72;

    private PasswordPolicy() {
    }

    public static boolean valid(String password) {

        return password != null
                && !password.isBlank()
                && password.codePointCount(0, password.length()) >= MIN_CODE_POINTS
                && password.getBytes(StandardCharsets.UTF_8).length <= MAX_UTF8_BYTES;
    }
}
