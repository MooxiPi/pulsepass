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
    @Autowired javax.sql.DataSource datasource;
    @Test void upgradesV3WithoutChangingLegacyUsers() throws Exception {
        String schema="upgrade_"+java.util.UUID.randomUUID().toString().replace("-", "");
        var old=Flyway.configure().dataSource(datasource).schemas(schema).defaultSchema(schema).target("3").load();
        old.migrate();
        try(var connection=datasource.getConnection(); var statement=connection.createStatement()) {
            statement.executeUpdate("insert into "+schema+".users(username,email,active) values ('legacy','legacy@example.test',true)");
        }
        Flyway.configure().dataSource(datasource).schemas(schema).defaultSchema(schema).load().migrate();
        try(var connection=datasource.getConnection(); var statement=connection.createStatement()) {
            var result=statement.executeQuery("select count(*) from "+schema+".users where username='legacy' and active=true");
            result.next(); assertThat(result.getLong(1)).isEqualTo(1);
            result=statement.executeQuery("select count(*) from "+schema+".user_credentials");
            result.next(); assertThat(result.getLong(1)).isZero();
        }
    }

    @Test
    void shouldApplyAllRequiredMigrations() {
        String[] versions = Arrays.stream(flyway.info().applied())
                .map(MigrationInfo::getVersion)
                .filter(java.util.Objects::nonNull)
                .map(Object::toString)
                .toArray(String[]::new);

        assertThat(versions).contains("1", "2", "3", "4");
    }
}
