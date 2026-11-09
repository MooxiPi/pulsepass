package com.pulsepass.integration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;
@SpringBootTest
public abstract class PostgresIntegrationTest {
    private static PostgreSQLContainer postgres;
    private static final String SCHEMA = "test_" + java.util.UUID.randomUUID().toString().replace("-", "");
    @DynamicPropertySource
    static synchronized void configurePostgres(DynamicPropertyRegistry registry) {
        String url = System.getenv("PULSEPASS_TEST_DB_URL");
        if (url != null && !url.isBlank()) {
            if (!url.matches("jdbc:postgresql://(localhost|127\\.0\\.0\\.1):[0-9]+/pulsepass_test"))
                throw new IllegalArgumentException("External tests require loopback pulsepass_test database");
            registry.add("spring.datasource.url", () -> url + "?currentSchema=" + SCHEMA);
            registry.add("spring.datasource.username", () -> System.getenv("PULSEPASS_TEST_DB_USERNAME"));
            registry.add("spring.datasource.password", () -> System.getenv("PULSEPASS_TEST_DB_PASSWORD"));
        } else {
            if (postgres == null) {
                postgres = new PostgreSQLContainer("postgres:17-alpine").withDatabaseName("pulsepass_test")
                    .withUsername("pulsepass").withPassword("pulsepass");
                postgres.start();
            }
            registry.add("spring.datasource.url", () -> postgres.getJdbcUrl() + (postgres.getJdbcUrl().contains("?") ? "&" : "?") + "currentSchema=" + SCHEMA);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
        }
        registry.add("spring.flyway.schemas", () -> SCHEMA);
        registry.add("spring.jpa.properties.hibernate.default_schema", () -> SCHEMA);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.flyway.enabled", () -> "true");
    }
}
