package com.sliit.library.service;

import com.sliit.library.dto.MembershipRequest;
import com.sliit.library.dto.MembershipResponse;
import com.sliit.library.dto.MembershipReviewRequest;
import com.sliit.library.dto.MessageResponse;
import com.sliit.library.entity.*;
import com.sliit.library.repository.MembershipRepository;
import com.sliit.library.repository.UserRepository;
import com.sliit.library.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class MembershipService {

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public MembershipResponse applyForMembership(MembershipRequest request, String photoPath) {
        User user = getCurrentUser();

        if (membershipRepository.existsByUserIdAndStatus(user.getId(), MembershipStatus.PENDING)) {
            throw new RuntimeException("You already have a pending membership application.");
        }
        if (membershipRepository.existsByUserIdAndStatus(user.getId(), MembershipStatus.APPROVED)) {
            throw new RuntimeException("You are already an approved library member.");
        }

        Membership membership = Membership.builder()
                .user(user)
                .title(request.getTitle())
                .nameWithInitials(request.getNameWithInitials())
                .address(request.getAddress())
                .contactNumber(request.getContactNumber())
                .whatsappNumber(request.getWhatsappNumber())
                .memberEmail(request.getMemberEmail())
                .memberType(request.getMemberType())
                .photoPath(photoPath)
                .faculty(request.getFaculty())
                .programme(request.getProgramme())
                .academicYear(request.getAcademicYear())
                .reason(request.getReason())
                .status(MembershipStatus.PENDING)
                .build();

        membershipRepository.save(membership);

        // Notify all librarians
        List<User> librarians = userRepository.findByRole(Role.LIBRARIAN);
        for (User librarian : librarians) {
            notificationService.sendNotification(
                    librarian,
                    NotificationType.ANNOUNCEMENT,
                    "New Membership Application",
                    user.getFullName() + " (" + user.getStudentStaffId() + ") has applied for library membership.",
                    "MEMBERSHIP",
                    membership.getId()
            );
        }

        return mapToResponse(membership);
    }

    @Transactional(readOnly = true)
    public MembershipResponse getMyMembership() {
        User user = getCurrentUser();
        return membershipRepository.findByUserId(user.getId())
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<MembershipResponse> getPendingApplications() {
        return membershipRepository.findByStatus(MembershipStatus.PENDING)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MembershipResponse> getAllMemberships() {
        return membershipRepository.findAll()
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public MembershipResponse reviewMembership(Long membershipId, MembershipReviewRequest request) {
        User reviewer = getCurrentUser();
        Membership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership application not found"));

        membership.setAdminComments(request.getAdminComments());
        membership.setApprovedBy(reviewer);
        membership.setReviewedAt(LocalDateTime.now());

        if (Boolean.TRUE.equals(request.getApproved())) {
            membership.setStatus(MembershipStatus.APPROVED);
            membership.setMembershipId("MEM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            membership.setExpiresAt(LocalDateTime.now().plusYears(1));

            notificationService.sendNotification(
                    membership.getUser(),
                    NotificationType.ANNOUNCEMENT,
                    "Membership Approved!",
                    "Your library membership has been approved. Your Member ID is: " + membership.getMembershipId() +
                    ". You can now reserve books, add to wishlist, and download eBooks.",
                    "MEMBERSHIP",
                    membership.getId()
            );
        } else {
            membership.setStatus(MembershipStatus.REJECTED);
            notificationService.sendNotification(
                    membership.getUser(),
                    NotificationType.ANNOUNCEMENT,
                    "Membership Application Update",
                    "Your library membership application was not approved. " +
                    (request.getAdminComments() != null ? "Reason: " + request.getAdminComments() : ""),
                    "MEMBERSHIP",
                    membership.getId()
            );
        }

        membershipRepository.save(membership);
        return mapToResponse(membership);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private MembershipResponse mapToResponse(Membership m) {
        return MembershipResponse.builder()
                .id(m.getId())
                .userId(m.getUser().getId())
                .userFullName(m.getUser().getFullName())
                .userEmail(m.getUser().getEmail())
                .userStudentStaffId(m.getUser().getStudentStaffId())
                .title(m.getTitle())
                .nameWithInitials(m.getNameWithInitials())
                .address(m.getAddress())
                .contactNumber(m.getContactNumber())
                .whatsappNumber(m.getWhatsappNumber())
                .memberEmail(m.getMemberEmail())
                .memberType(m.getMemberType())
                .photoPath(m.getPhotoPath())
                .faculty(m.getFaculty())
                .programme(m.getProgramme())
                .academicYear(m.getAcademicYear())
                .reason(m.getReason())
                .status(m.getStatus())
                .membershipId(m.getMembershipId())
                .adminComments(m.getAdminComments())
                .approvedById(m.getApprovedBy() != null ? m.getApprovedBy().getId() : null)
                .approvedByName(m.getApprovedBy() != null ? m.getApprovedBy().getFullName() : null)
                .appliedAt(m.getAppliedAt())
                .reviewedAt(m.getReviewedAt())
                .expiresAt(m.getExpiresAt())
                .build();
    }
}
