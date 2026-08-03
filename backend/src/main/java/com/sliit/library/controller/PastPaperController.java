package com.sliit.library.controller;

import com.sliit.library.dto.MessageResponse;
import com.sliit.library.dto.PastPaperResponse;
import com.sliit.library.service.PastPaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class PastPaperController {

    @Autowired
    private PastPaperService paperService;

    @GetMapping("/past-papers/public/all")
    public ResponseEntity<List<PastPaperResponse>> allPublic() {
        return ResponseEntity.ok(paperService.getAllPublic());
    }

    @GetMapping("/past-papers/public/filters")
    public ResponseEntity<Map<String, Object>> filters() {
        return ResponseEntity.ok(paperService.getFilters());
    }

    @GetMapping("/past-papers/public/filter")
    public ResponseEntity<List<PastPaperResponse>> filter(
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String semester) {
        return ResponseEntity.ok(paperService.filter(year, semester));
    }

    @GetMapping("/past-papers/public/{id}")
    public ResponseEntity<PastPaperResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(paperService.getById(id));
    }

    @GetMapping("/past-papers/download/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> download(@PathVariable Long id) throws IOException {
        byte[] data = paperService.download(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"past-paper.pdf\"")
                .body(data);
    }

    @GetMapping("/past-papers/view/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<Resource> view(@PathVariable Long id) throws MalformedURLException {
        Resource resource = paperService.view(id);
        if (!resource.exists())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"past-paper.pdf\"")
                .body(resource);
    }

    @PostMapping(value = "/librarian/past-papers/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<PastPaperResponse> upload(
            @RequestParam("title") String title,
            @RequestParam("academicYear") String academicYear,
            @RequestParam(value = "academicSemester", required = false) String academicSemester,
            @RequestParam("semester") String semester,
            @RequestParam(value = "intakeBatch", required = false) String intakeBatch,
            @RequestParam(value = "faculty", required = false) String faculty,
            @RequestParam(value = "courseCode", required = false) String courseCode,
            @RequestParam(value = "courseName", required = false) String courseName,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "examType", required = false) String examType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(paperService.upload(title, academicYear, academicSemester, semester, intakeBatch,
                faculty, courseCode, courseName, department, examType, description, file));
    }

    @DeleteMapping("/librarian/past-papers/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        paperService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Past paper deleted"));
    }
}
