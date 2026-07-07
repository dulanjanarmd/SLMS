package com.sliit.library.dto;

import com.sliit.library.entity.BookStatus;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookRequestDTO {

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
    private Double replacementCost;
    private String ddcNumber;
    private String subjectHeadings;
    private String accessionNumber;
    private Long categoryId;
    private BookStatus status;
    private LocalDate acquisitionDate;
    private Boolean nonRenewable;
}
