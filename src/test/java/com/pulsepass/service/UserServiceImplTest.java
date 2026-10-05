package com.pulsepass.service;

import com.pulsepass.domain.User;
import com.pulsepass.domain.UserProfile;
import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.mapper.UserMapper;
import com.pulsepass.repository.UserProfileRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void register_validUser_savesUserAndProfile() {

        // ARRANGE
        RegisterUserRequest request =
                new RegisterUserRequest(
                        "andrea",
                        "andrea@email.com",
                        "Andrea",
                        "Perez",
                        "3001234567",
                        "Santa Marta",
                        LocalDate.of(2000, 5, 10)
                );

        User savedUser =
                new User(
                        "andrea",
                        "andrea@email.com",
                        true
                );

        UserProfile savedProfile =
                new UserProfile(
                        "Andrea",
                        "Perez",
                        "3001234567",
                        "Santa Marta",
                        LocalDate.of(2000, 5, 10),
                        savedUser
                );

        UserResponse expected =
                new UserResponse(
                        null,
                        "andrea",
                        "andrea@email.com",
                        true,
                        "Andrea",
                        "Perez",
                        "3001234567",
                        "Santa Marta",
                        LocalDate.of(2000, 5, 10)
                );

        when(userRepository.existsByUsername("andrea"))
                .thenReturn(false);

        when(userRepository.existsByEmailIgnoreCase("andrea@email.com"))
                .thenReturn(false);

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        when(userProfileRepository.save(any(UserProfile.class)))
                .thenReturn(savedProfile);

        when(userMapper.toResponse(savedUser, savedProfile))
                .thenReturn(expected);

        // ACT
        UserResponse result = userService.register(request);

        // ASSERT
        assertThat(result).isEqualTo(expected);
        assertThat(result.active()).isTrue();

        verify(userRepository)
                .save(any(User.class));

        verify(userProfileRepository)
                .save(any(UserProfile.class));
    }

    @Test
    void register_duplicateUsername_throwsDuplicateResourceException() {

        // ARRANGE
        RegisterUserRequest request =
                new RegisterUserRequest(
                        "andrea",
                        "andrea@email.com",
                        "Andrea",
                        "Perez",
                        null,
                        "Santa Marta",
                        LocalDate.of(2000, 5, 10)
                );

        when(userRepository.existsByUsername("andrea"))
                .thenReturn(true);

        // ACT + ASSERT
        assertThatThrownBy(() ->
                userService.register(request)
        )
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("andrea");

        verify(userRepository, never())
                .save(any(User.class));

        verify(userProfileRepository, never())
                .save(any(UserProfile.class));
    }

    @Test
    void register_duplicateEmail_throwsDuplicateResourceException() {

        // ARRANGE
        RegisterUserRequest request =
                new RegisterUserRequest(
                        "andrea",
                        "andrea@email.com",
                        "Andrea",
                        "Perez",
                        null,
                        "Santa Marta",
                        LocalDate.of(2000, 5, 10)
                );

        when(userRepository.existsByUsername("andrea"))
                .thenReturn(false);

        when(userRepository.existsByEmailIgnoreCase("andrea@email.com"))
                .thenReturn(true);

        // ACT + ASSERT
        assertThatThrownBy(() ->
                userService.register(request)
        )
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("andrea@email.com");

        verify(userRepository, never())
                .save(any(User.class));

        verify(userProfileRepository, never())
                .save(any(UserProfile.class));
    }

    @Test
    void register_futureBirthDate_throwsBusinessRuleException() {

        // ARRANGE
        RegisterUserRequest request =
                new RegisterUserRequest(
                        "andrea",
                        "andrea@email.com",
                        "Andrea",
                        "Perez",
                        null,
                        "Santa Marta",
                        LocalDate.now().plusDays(1)
                );

        when(userRepository.existsByUsername("andrea"))
                .thenReturn(false);

        when(userRepository.existsByEmailIgnoreCase("andrea@email.com"))
                .thenReturn(false);

        // ACT + ASSERT
        assertThatThrownBy(() ->
                userService.register(request)
        )
                .isInstanceOf(BusinessRuleException.class);

        verify(userRepository, never())
                .save(any(User.class));

        verify(userProfileRepository, never())
                .save(any(UserProfile.class));
    }
}