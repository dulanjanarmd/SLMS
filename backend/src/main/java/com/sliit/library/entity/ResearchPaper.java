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
@Table(name = "research_papers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResearchPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 300)
    private String title;

    @NotBlank
    @Size(max = 300)
    private String author;

    @Size(max = 1000)
    private String abstractText;

    @Size(max = 200)
    private String journal;

    private Integer publicationYear;

    @Size(max = 100)
    private String researchField;

    @Size(max = 100)
    private String keywords;

    @Size(max = 50)
    private String fileFormat;

    @NotBlank
    private String filePath;

    private Long fileSize;

    @Size(max = 500)
    private String coverImageUrl;

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
