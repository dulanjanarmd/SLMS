package com.sliit.library.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "past_papers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PastPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 300)
    private String title;

    @NotBlank
    @Size(max = 50)
    private String academicYear;

    @NotBlank
    @Size(max = 50)
    private String academicSemester;

    @NotBlank
    @Size(max = 20)
    private String semester;

    @Size(max = 100)
    private String intakeBatch;

    @Size(max = 100)
    private String faculty;

    @Size(max = 100)
    private String courseCode;

    @Size(max = 200)
    private String courseName;

    @Size(max = 100)
    private String department;

    @Size(max = 50)
    private String examType;

    @Size(max = 500)
    private String description;

    @Size(max = 50)
    private String fileFormat;

    @NotBlank
    private String filePath;

    private Long fileSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Builder.Default
    private Boolean isPublic = true;

    @Builder.Default
    private Integer downloadCount = 0;

    @Builder.Default
    private Integer viewCount = 0;

    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
