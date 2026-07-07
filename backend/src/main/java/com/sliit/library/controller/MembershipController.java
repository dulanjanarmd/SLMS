package com.sliit.library.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sliit.library.dto.MembershipRequest;
import com.sliit.library.dto.MembershipResponse;
import com.sliit.library.dto.MembershipReviewRequest;
import com.sliit.library.service.MembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class MembershipController {

    @Autowired
    private MembershipService membershipService;

    @Value("${app.upload.dir:uploads/membership-photos}")
    private String uploadDir;

    @PostMapping(value = "/membership/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY')")
    public ResponseEntity<MembershipResponse> apply(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "photo", required = false) MultipartFile photo) throws IOException {

        ObjectMapper mapper = new ObjectMapper();
        MembershipRequest request = mapper.readValue(dataJson, MembershipRequest.class);

        String photoPath = null;
        if (photo != null && !photo.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            String filename = UUID.randomUUID() + "_" + photo.getOriginalFilename();
            Files.copy(photo.getInputStream(), uploadPath.resolve(filename), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            photoPath = filename;
        }

        return ResponseEntity.ok(membershipService.applyForMembership(request, photoPath));
    }

    @GetMapping("/membership/photo/{filename:.+}")
    public ResponseEntity<Resource> getPhoto(@PathVariable String filename) throws MalformedURLException {
        Path file = Paths.get(uploadDir).resolve(filename);
        Resource resource = new UrlResource(file.toUri());
        if (!resource.exists()) return ResponseEntity.notFound().build();
        String contentType = "image/jpeg";
        try { contentType = Files.probeContentType(file); } catch (IOException ignored) {}
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).body(resource);
    }

    @GetMapping("/membership/my")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<MembershipResponse> getMyMembership() {
        return ResponseEntity.ok(membershipService.getMyMembership());
    }

    @GetMapping("/librarian/memberships/pending")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<MembershipResponse>> getPending() {
        return ResponseEntity.ok(membershipService.getPendingApplications());
    }

    @GetMapping("/librarian/memberships/all")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<MembershipResponse>> getAll() {
        return ResponseEntity.ok(membershipService.getAllMemberships());
    }

    @PostMapping("/librarian/memberships/{id}/review")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<MembershipResponse> review(
            @PathVariable Long id,
            @RequestBody MembershipReviewRequest request) {
        return ResponseEntity.ok(membershipService.reviewMembership(id, request));
    }
}
