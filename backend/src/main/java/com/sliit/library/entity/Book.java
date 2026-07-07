package com.sliit.library.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    @Size(max = 200)
    private String author;

    @Size(max = 500)
    private String additionalAuthors;

    @NotBlank
    @Size(max = 20)
    @Column(unique = true)
    private String isbn;

    @Size(max = 20)
    private String isbn13;

    @Size(max = 200)
    private String publisher;

    private Integer publicationYear;

    @Size(max = 2000)
    private String description;

    @Size(max = 50)
    private String edition;

    @Size(max = 20)
    private String language;

    @Size(max = 50)
    private String format;

    @Size(max = 100)
    private String shelfLocation;

    @Size(max = 500)
    private String coverImageUrl;

    @Builder.Default
    private Integer totalCopies = 1;

    @Builder.Default
    private Integer availableCopies = 1;

    @Builder.Default
    private Integer reservedCopies = 0;

    @Builder.Default
    private Double replacementCost = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private BookStatus status = BookStatus.AVAILABLE;

    @Size(max = 50)
    private String ddcNumber;

    @Size(max = 500)
    private String subjectHeadings;

    @Size(max = 20)
    private String accessionNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<BorrowRecord> borrowRecords = new ArrayList<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Reservation> reservations = new ArrayList<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<EBook> eBooks = new ArrayList<>();

    private LocalDate acquisitionDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private Integer borrowCount = 0;

    @Builder.Default
    private Boolean nonRenewable = false;

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
