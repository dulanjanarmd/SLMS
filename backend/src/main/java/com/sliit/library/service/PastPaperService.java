package com.sliit.library.service;

import com.sliit.library.dto.PastPaperResponse;
import com.sliit.library.entity.PastPaper;
import com.sliit.library.entity.User;
import com.sliit.library.repository.PastPaperRepository;
import com.sliit.library.repository.UserRepository;
import com.sliit.library.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PastPaperService {

    @Autowired
    private PastPaperRepository paperRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.upload.past-papers:uploads/past-papers}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public List<PastPaperResponse> getAllPublic() {
        return paperRepository.findByIsPublicTrueOrderByAcademicYearDescSemesterAscUploadedAtDesc()
                .stream().map(this::map).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFilters() {
        Map<String, Object> filters = new LinkedHashMap<>();
        filters.put("years", paperRepository.findDistinctYears());
        filters.put("semesters", paperRepository.findDistinctSemesters());
        return filters;
    }

    @Transactional(readOnly = true)
    public List<PastPaperResponse> filter(String year, String semester) {
        return paperRepository.filter(year, semester).stream().map(this::map).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PastPaperResponse getById(Long id) {
        return map(paperRepository.findById(id).orElseThrow(() -> new RuntimeException("Past paper not found")));
    }

    @Transactional
    public PastPaperResponse upload(String title, String academicYear, String semester,
            String courseCode, String courseName, String department, String examType,
            String description, MultipartFile file) throws IOException {
        User user = getCurrentUser();
        String ext = resolveExt(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + "." + ext;
        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        Path filePath = dir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        PastPaper paper = PastPaper.builder()
                .title(title).academicYear(academicYear).semester(semester)
                .courseCode(courseCode).courseName(courseName).department(department)
                .examType(examType).description(description)
                .fileFormat(ext.toUpperCase()).filePath(filePath.toString()).fileSize(file.getSize())
                .uploadedBy(user).isPublic(true).downloadCount(0).viewCount(0)
                .build();
        paperRepository.save(paper);
        return map(paper);
    }

    @Transactional
    public void delete(Long id) {
        PastPaper p = paperRepository.findById(id).orElseThrow(() -> new RuntimeException("Past paper not found"));
        try { Files.deleteIfExists(Paths.get(p.getFilePath())); } catch (IOException ignored) { }
        paperRepository.delete(p);
    }

    @Transactional
    public byte[] download(Long id) throws IOException {
        PastPaper p = paperRepository.findById(id).orElseThrow(() -> new RuntimeException("Past paper not found"));
        p.setDownloadCount(p.getDownloadCount() + 1);
        paperRepository.save(p);
        return Files.readAllBytes(Paths.get(p.getFilePath()));
    }

    @Transactional
    public Resource view(Long id) throws MalformedURLException {
        PastPaper p = paperRepository.findById(id).orElseThrow(() -> new RuntimeException("Past paper not found"));
        p.setViewCount((p.getViewCount() == null ? 0 : p.getViewCount()) + 1);
        paperRepository.save(p);
        return new UrlResource(Paths.get(p.getFilePath()).toUri());
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl ud = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(ud.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String resolveExt(String name) {
        return (name != null && name.contains(".")) ? name.substring(name.lastIndexOf(".") + 1) : "pdf";
    }

    private PastPaperResponse map(PastPaper p) {
        return PastPaperResponse.builder()
                .id(p.getId()).title(p.getTitle())
                .academicYear(p.getAcademicYear()).semester(p.getSemester())
                .courseCode(p.getCourseCode()).courseName(p.getCourseName())
                .department(p.getDepartment()).examType(p.getExamType())
                .description(p.getDescription()).fileFormat(p.getFileFormat()).fileSize(p.getFileSize())
                .isPublic(p.getIsPublic()).downloadCount(p.getDownloadCount()).viewCount(p.getViewCount())
                .uploadedByName(p.getUploadedBy() != null ? p.getUploadedBy().getFullName() : null)
                .uploadedAt(p.getUploadedAt())
                .build();
    }
}
