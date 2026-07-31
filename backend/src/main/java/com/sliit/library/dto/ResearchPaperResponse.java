package com.sliit.library.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ResearchPaperResponse {
    private Long id;
    private String title;
    private String author;
    private String abstractText;
    private String journal;
    private Integer publicationYear;
    private String researchField;
    private String keywords;
    private String fileFormat;
    private Long fileSize;
    private String coverImageUrl;
    private Boolean isPublic;
    private Integer downloadCount;
    private Integer viewCount;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
}
