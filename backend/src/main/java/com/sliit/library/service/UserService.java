package com.sliit.library.service;

import com.sliit.library.dto.*;
import com.sliit.library.entity.Membership;
import com.sliit.library.entity.MembershipStatus;
import com.sliit.library.entity.Role;
import com.sliit.library.entity.User;
import com.sliit.library.repository.MembershipRepository;
import com.sliit.library.repository.UserRepository;
import com.sliit.library.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private PasswordEncoder encoder;

    public UserProfileResponse getCurrentUserProfile() {
        User user = getCurrentAuthenticatedUser();
        return mapToProfileResponse(user);
    }

    public UserProfileResponse getUserProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToProfileResponse(user);
    }

    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentAuthenticatedUser();

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getFaculty() != null) {
            user.setFaculty(request.getFaculty());
        }
        if (request.getProgramme() != null) {
            user.setProgramme(request.getProgramme());
        }
        if (request.getProfileImageUrl() != null) {
            user.setProfileImageUrl(request.getProfileImageUrl());
        }

        userRepository.save(user);
        return mapToProfileResponse(user);
    }

    public Page<UserProfileResponse> getAllUsers(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isEmpty()) {
            return userRepository.searchUsers(keyword, pageable).map(this::mapToProfileResponse);
        }
        return userRepository.findAll(pageable).map(this::mapToProfileResponse);
    }

    @org.springframework.transaction.annotation.Transactional
    public MessageResponse deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean hasActiveLoans = user.getBorrowRecords().stream()
                .anyMatch(b -> b.getStatus() == com.sliit.library.entity.BorrowStatus.ACTIVE ||
                               b.getStatus() == com.sliit.library.entity.BorrowStatus.OVERDUE);
        if (hasActiveLoans) {
            throw new RuntimeException("Cannot delete user with active or overdue borrowed books.");
        }

        boolean hasUnpaidFines = user.getFines().stream()
                .anyMatch(f -> f.getStatus() == com.sliit.library.entity.FineStatus.UNPAID);
        if (hasUnpaidFines) {
            throw new RuntimeException("Cannot delete user with unpaid fines.");
        }

        userRepository.delete(user);
        return new MessageResponse("User deleted successfully");
    }

    public List<UserProfileResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToProfileResponse)
                .toList();
    }

    public MessageResponse deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
        return new MessageResponse("User deactivated successfully");
    }

    public MessageResponse activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(true);
        userRepository.save(user);
        return new MessageResponse("User activated successfully");
    }

    public MessageResponse changeUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        userRepository.save(user);
        return new MessageResponse("User role updated to " + role.name());
    }

    public MessageResponse updatePassword(String oldPassword, String newPassword) {
        User user = getCurrentAuthenticatedUser();

        if (!encoder.matches(oldPassword, user.getPassword())) {
            return MessageResponse.builder()
                    .message("Error: Old password is incorrect")
                    .success(false)
                    .build();
        }

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        return new MessageResponse("Password updated successfully");
    }

    public MessageResponse createLibrarian(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return MessageResponse.builder().message("Error: Email is already in use!").success(false).build();
        }
        if (userRepository.existsByStudentStaffId(request.getStudentStaffId())) {
            return MessageResponse.builder().message("Error: Staff ID is already in use!").success(false).build();
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .studentStaffId(request.getStudentStaffId())
                .email(request.getEmail())
                .password(encoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role(Role.LIBRARIAN)
                .faculty(request.getFaculty())
                .programme(request.getProgramme())
                .isActive(true)
                .currentBorrowCount(0)
                .outstandingFine(0.0)
                .build();
        userRepository.save(user);
        return new MessageResponse("Librarian account created successfully!");
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        int maxBooks = getMaxBooksForRole(user.getRole());
        int maxDays = getMaxDaysForRole(user.getRole());

        boolean isMember = false;
        String membershipId = null;
        if (user.getRole() == Role.STUDENT || user.getRole() == Role.FACULTY) {
            var membership = membershipRepository.findByUserId(user.getId());
            if (membership.isPresent() && membership.get().getStatus() == MembershipStatus.APPROVED) {
                isMember = true;
                membershipId = membership.get().getMembershipId();
            }
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .studentStaffId(user.getStudentStaffId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .faculty(user.getFaculty())
                .programme(user.getProgramme())
                .profileImageUrl(user.getProfileImageUrl())
                .isActive(user.getIsActive())
                .currentBorrowCount(user.getCurrentBorrowCount())
                .outstandingFine(user.getOutstandingFine())
                .createdAt(user.getCreatedAt())
                .maxBooksAllowed(maxBooks)
                .maxDaysAllowed(maxDays)
                .isMember(isMember)
                .membershipId(membershipId)
                .build();
    }

    private int getMaxBooksForRole(Role role) {
        return switch (role) {
            case STUDENT -> 4;
            case FACULTY -> 10;
            case LIBRARIAN -> 15;
            case ADMIN -> 20;
        };
    }

    private int getMaxDaysForRole(Role role) {
        return switch (role) {
            case STUDENT -> 14;
            case FACULTY -> 30;
            case LIBRARIAN -> 30;
            case ADMIN -> 30;
        };
    }

    public UserProfileResponse uploadProfilePicture(MultipartFile file) {
        User user = getCurrentAuthenticatedUser();

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        try {
            String uploadDir = "uploads/profile-pictures/";
            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String newFilename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/profile-pictures/" + newFilename;

            user.setProfileImageUrl(fileUrl);
            userRepository.save(user);

            return mapToProfileResponse(user);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload profile picture", e);
        }
    }

    public MessageResponse deleteProfilePicture() {
        User user = getCurrentAuthenticatedUser();

        if (user.getProfileImageUrl() != null) {
            try {
                String normalizedPath = user.getProfileImageUrl().replaceFirst("^/", "");
                String filename = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);
                Path uploadFolder = normalizedPath.startsWith("uploads/profile-pictures/")
                        ? Paths.get("uploads/profile-pictures")
                        : Paths.get("uploads/membership-photos");
                Path filePath = uploadFolder.resolve(filename);
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                }
            } catch (IOException e) {
                // Continue even if file deletion fails
            }

            user.setProfileImageUrl(null);
            userRepository.save(user);
        }

        return new MessageResponse("Profile picture deleted successfully");
    }
}
