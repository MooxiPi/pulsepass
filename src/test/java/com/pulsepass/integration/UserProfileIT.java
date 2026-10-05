package com.pulsepass.integration;

import com.pulsepass.domain.User;
import com.pulsepass.domain.UserProfile;
import com.pulsepass.repository.UserProfileRepository;
import com.pulsepass.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Transactional
class UserProfileIT extends PostgresIntegrationTest {

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserProfileRepository userProfileRepository;

    @Test
    void shouldPersistOneProfilePerUser() {
        User user = userRepository.saveAndFlush(new User("andrea", "andrea@example.com", true));

        assertThat(userRepository.findByEmailIgnoreCase("ANDREA@EXAMPLE.COM"))
                .isPresent()
                .get()
                .extracting(User::getUsername)
                .isEqualTo("andrea");

        userProfileRepository.saveAndFlush(new UserProfile(
                "Andrea", "Lopez", "3000000000", "Santa Marta",
                LocalDate.of(2002, 5, 20), user
        ));

        UserProfile profile = userProfileRepository.findByUser_Id(user.getId()).orElseThrow();
        assertThat(profile.getFirstName()).isEqualTo("Andrea");
    }

    @Test
    void shouldRejectSecondProfileForSameUser() {
        User user = userRepository.saveAndFlush(new User("profiledup", "profiledup@example.com", true));

        userProfileRepository.saveAndFlush(new UserProfile(
                "First", "Profile", null, "Santa Marta", null, user
        ));

        assertThatThrownBy(() -> userProfileRepository.saveAndFlush(new UserProfile(
                "Second", "Profile", null, "Santa Marta", null, user
        ))).isInstanceOf(DataIntegrityViolationException.class);
    }
}
