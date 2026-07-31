package com.sliit.library.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "contact_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String type; // EMAIL, PHONE, ADDRESS, SOCIAL

    @Column(length = 200)
    private String label; // e.g., "Main Email", "Helpdesk", "Facebook"

    @Column(length = 500)
    private String value; // e.g., "library@university.edu", "+94 11 234 5678"

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    private Integer displayOrder;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
