package com.pulsepass.controller;

import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import(GlobalExceptionHandler.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    private UserResponse user() {
        return new UserResponse(
                2L, "carlos123", "carlos@example.com", true,
                "Carlos", "Perez", "3001234567", "Santa Marta",
                LocalDate.of(2000, 5, 15));
    }

    private static final String VALID_REQUEST = """
            {
              "username": "carlos123",
              "email": "carlos@example.com",
              "firstName": "Carlos",
              "lastName": "Perez",
              "phone": "3001234567",
              "city": "Santa Marta",
              "birthDate": "2000-05-15"
            }
            """;

    @Test
    void register_validRequest_returns201() throws Exception {
        when(userService.register(any(RegisterUserRequest.class))).thenReturn(user());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_REQUEST))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username").value("carlos123"))
                .andExpect(jsonPath("$.email").value("carlos@example.com"));

        verify(userService).register(new RegisterUserRequest(
                "carlos123", "carlos@example.com", "Carlos", "Perez",
                "3001234567", "Santa Marta", LocalDate.of(2000, 5, 15)));
    }

    @Test
    void register_invalidEmail_returns400_withoutCallingService() throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "username": "carlos123",
                              "email": "correo-invalido",
                              "firstName": "Carlos",
                              "lastName": "Perez",
                              "birthDate": "2000-05-15"
                            }
                            """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details.email").exists());

        verifyNoInteractions(userService);
    }

    @Test
    void register_duplicateUsername_returns409() throws Exception {
        when(userService.register(any(RegisterUserRequest.class)))
                .thenThrow(new DuplicateResourceException("Username already exists: carlos123"));

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_REQUEST))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"));

        verify(userService).register(any(RegisterUserRequest.class));
    }

    @Test
    void findByEmail_returns200() throws Exception {
        when(userService.findByEmail("carlos@example.com")).thenReturn(user());

        mockMvc.perform(get("/api/users/by-email")
                        .param("email", "carlos@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.email").value("carlos@example.com"));

        verify(userService).findByEmail("carlos@example.com");
    }

    @Test
    void findByUsername_returns200() throws Exception {
        when(userService.findByUsername("carlos123")).thenReturn(user());

        mockMvc.perform(get("/api/users/by-username")
                        .param("username", "carlos123"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username").value("carlos123"));

        verify(userService).findByUsername("carlos123");
    }
}
