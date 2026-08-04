package com.sliit.library.dto;

import lombok.Data;

@Data
public class EBookUpdateRequest {
    private String title;
    private String author;
    private String isbn;
    private String description;
    private String publisher;
    private Integer publicationYear;
    private String language;
    private Boolean isPublic;
}
