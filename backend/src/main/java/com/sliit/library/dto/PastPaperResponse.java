package com.sliit.library.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PastPaperResponse {
    private Long id;
    private String title;
    private String academicYear;
    private String semester;
    private String courseCode;
    private String courseName;
    private String department;
    private String examType;
    private String description;
    private String fileFormat;
    private Long fileSize;
    private Boolean isPublic;
    private Integer downloadCount;
    private Integer viewCount;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
}
