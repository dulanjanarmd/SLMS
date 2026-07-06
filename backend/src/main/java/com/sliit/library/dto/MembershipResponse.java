package com.sliit.library.dto;

import com.sliit.library.entity.MembershipStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MembershipResponse {

 private Long id;
 private Long userId;
 private String userFullName;
 private String userEmail;
 private String userStudentStaffId;
 private String title;
 private String nameWithInitials;
 private String address;
 private String contactNumber;
 private String whatsappNumber;
 private String memberEmail;
 private String memberType;
 private String photoPath;
 private String faculty;
 private String programme;
 private String academicYear;
 private String reason;
 private MembershipStatus status;
 private String membershipId;
 private String adminComments;
 private Long approvedById;
 private String approvedByName;
 private LocalDateTime appliedAt;
 private LocalDateTime reviewedAt;
 private LocalDateTime expiresAt;
}
