package com.pulsepass.service.impl;

import com.pulsepass.domain.User;
import com.pulsepass.domain.UserProfile;
import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.UserMapper;
import com.pulsepass.repository.UserProfileRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserMapper userMapper;
    private final com.pulsepass.repository.UserCredentialRepository credentials;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            UserMapper userMapper,
            com.pulsepass.repository.UserCredentialRepository credentials,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.userMapper = userMapper;
        this.credentials = credentials; this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterUserRequest request) {

        if (request.username().contains("@")) {
            throw new IllegalArgumentException("Username must not contain @");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException(
                    "Username already exists: " + request.username()
            );
        }

        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException(
                    "Email already exists: " + request.email()
            );
        }

        if (userRepository.existsByUsernameIgnoreCase(request.email())) {
            throw new DuplicateResourceException(
                    "Email conflicts with an existing username"
            );
        }

        if (request.birthDate() != null
                && request.birthDate().isAfter(LocalDate.now())) {

            throw new BusinessRuleException(
                    "Birth date cannot be in the future."
            );
        }

        if (!com.pulsepass.security.PasswordPolicy.valid(request.password()))
            throw new IllegalArgumentException("Invalid password length");
        User user = new User(
                request.username(),
                request.email(),
                true
        );

        User savedUser = userRepository.save(user);

        credentials.save(new com.pulsepass.domain.UserCredential(savedUser.getId(),
            passwordEncoder.encode(request.password()), java.util.Set.of(com.pulsepass.domain.enums.Role.USER)));
        UserProfile profile = new UserProfile(
                request.firstName(),
                request.lastName(),
                request.phone(),
                request.city(),
                request.birthDate(),
                savedUser
        );

        UserProfile savedProfile =
                userProfileRepository.save(profile);

        return userMapper.toResponse(
                savedUser,
                savedProfile
        );
    }

    @Override
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or @authorizationService.email(#email)")
    public UserResponse findByEmail(String email) {

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + email
                        )
                );

        UserProfile profile = findProfileOrThrow(user);

        return userMapper.toResponse(user, profile);
    }

    @Override
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or @authorizationService.username(#username)")
    public UserResponse findByUsername(String username) {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + username
                        )
                );

        UserProfile profile = findProfileOrThrow(user);

        return userMapper.toResponse(user, profile);
    }

    private UserProfile findProfileOrThrow(User user) {

        return userProfileRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User profile not found for user: "
                                        + user.getUsername()
                        )
                );
    }
}
