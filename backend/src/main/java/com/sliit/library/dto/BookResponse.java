package com.sliit.library.dto;

import com.sliit.library.entity.BookStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BookResponse {

    private Long id;
    private String title;
    private String author;
    private String additionalAuthors;
    private String isbn;
    private String isbn13;
    private String publisher;
    private Integer publicationYear;
    private String description;
    private String edition;
    private String language;
    private String format;
    private String shelfLocation;
    private String coverImageUrl;
    private Integer totalCopies;
    private Integer availableCopies;
    private Integer reservedCopies;
    private Double replacementCost;
    private BookStatus status;
    private String ddcNumber;
    private String subjectHeadings;
    private String accessionNumber;
    private String categoryName;
    private Long categoryId;
    private LocalDate acquisitionDate;
    private LocalDateTime createdAt;
    private Integer borrowCount;
    private Boolean nonRenewable;
}
