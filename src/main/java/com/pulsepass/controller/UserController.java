
package com.pulsepass.controller;

import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Registrar un nuevo usuario
    @PostMapping
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterUserRequest request) {

        UserResponse response = userService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Buscar usuario por email
    @GetMapping("/by-email")
    public ResponseEntity<UserResponse> findByEmail(
            @RequestParam String email) {

        return ResponseEntity.ok(
                userService.findByEmail(email)
        );
    }

    // Buscar usuario por username
    @GetMapping("/by-username")
    public ResponseEntity<UserResponse> findByUsername(
            @RequestParam String username) {

        return ResponseEntity.ok(
                userService.findByUsername(username)
        );
    }
}
