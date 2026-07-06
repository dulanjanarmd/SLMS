package com.sliit.library.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "memberships")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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

    @Column(length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MembershipStatus status = MembershipStatus.PENDING;

    @Column(unique = true)
    private String membershipId;

    @Column(length = 1000)
    private String adminComments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
    }
}
