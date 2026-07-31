package com.sliit.library.controller;

import com.sliit.library.dto.MessageResponse;
import com.sliit.library.dto.ResearchPaperResponse;
import com.sliit.library.service.ResearchPaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ResearchPaperController {

    @Autowired
    private ResearchPaperService paperService;

    @GetMapping("/research-papers/public/all")
    public ResponseEntity<List<ResearchPaperResponse>> allPublic() {
        return ResponseEntity.ok(paperService.getAllPublic());
    }

    @GetMapping("/research-papers/public/search")
    public ResponseEntity<Page<ResearchPaperResponse>> search(
            @RequestParam String keyword, Pageable pageable) {
        return ResponseEntity.ok(paperService.search(keyword, pageable));
    }

    @GetMapping("/research-papers/public/{id}")
    public ResponseEntity<ResearchPaperResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(paperService.getById(id));
    }

    @GetMapping("/research-papers/download/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> download(@PathVariable Long id) throws IOException {
        byte[] data = paperService.download(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"research-paper.pdf\"")
                .body(data);
    }

    @GetMapping("/research-papers/view/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<Resource> view(@PathVariable Long id) throws MalformedURLException {
        Resource resource = paperService.view(id);
        if (!resource.exists()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"research-paper.pdf\"")
                .body(resource);
    }

    @GetMapping("/uploads/research-paper-covers/{filename:.+}")
    public ResponseEntity<Resource> getCover(@PathVariable String filename) throws MalformedURLException {
        Resource resource = paperService.getCover(filename);
        if (!resource.exists()) return ResponseEntity.notFound().build();
        String contentType = "image/jpeg";
        try { contentType = Files.probeContentType(resource.getFile().toPath()); } catch (Exception ignored) {}
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "image/jpeg"))
                .body(resource);
    }

    @PostMapping(value = "/librarian/research-papers/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<ResearchPaperResponse> upload(
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam(value = "abstractText", required = false) String abstractText,
            @RequestParam(value = "journal", required = false) String journal,
            @RequestParam(value = "publicationYear", required = false) Integer publicationYear,
            @RequestParam(value = "researchField", required = false) String researchField,
            @RequestParam(value = "keywords", required = false) String keywords,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage) throws IOException {
        return ResponseEntity.ok(paperService.upload(title, author, abstractText, journal, publicationYear, researchField, keywords, file, coverImage));
    }

    @DeleteMapping("/librarian/research-papers/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        paperService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Research paper deleted"));
    }
}
