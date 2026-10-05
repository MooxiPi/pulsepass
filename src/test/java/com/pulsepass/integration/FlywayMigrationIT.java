package com.pulsepass.integration;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

class FlywayMigrationIT extends PostgresIntegrationTest {

    @Autowired
    Flyway flyway;

    @Test
    void shouldApplyAllRequiredMigrations() {
        String[] versions = Arrays.stream(flyway.info().applied())
                .map(MigrationInfo::getVersion)
                .map(Object::toString)
                .toArray(String[]::new);

        assertThat(versions).contains("1", "2", "3");
    }
}
