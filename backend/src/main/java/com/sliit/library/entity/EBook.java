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
@Table(name = "ebooks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 500)
    @Column(length = 500)
    private String title;

    @NotBlank
    @Size(max = 200)
    private String author;

    @Size(max = 20)
    private String isbn;

    @Size(max = 2000)
    @Column(length = 2000)
    private String description;

    @Size(max = 100)
    private String publisher;

    private Integer publicationYear;

    @Size(max = 50)
    private String language;

    @NotBlank
    @Size(max = 50)
    private String fileFormat;

    @NotBlank
    private String filePath;

    private Long fileSize;

    @Size(max = 1000)
    @Column(length = 1000)
    private String coverImageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Builder.Default
    private Boolean isPublic = true;

    @Builder.Default
    private Integer downloadCount = 0;

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
