package com.sliit.library;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaFixer {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixSchema() {
        try {
            jdbcTemplate.execute("ALTER TABLE ebooks MODIFY COLUMN description VARCHAR(2000)");
            jdbcTemplate.execute("ALTER TABLE ebooks MODIFY COLUMN title VARCHAR(500)");
            jdbcTemplate.execute("ALTER TABLE ebooks MODIFY COLUMN cover_image_url VARCHAR(1000)");
            System.out.println("Schema updated successfully for ebooks table.");
        } catch (Exception e) {
            System.out.println("Schema update skipped or failed: " + e.getMessage());
        }
    }
}
