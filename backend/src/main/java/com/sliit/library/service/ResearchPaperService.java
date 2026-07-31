package com.sliit.library.service;

import com.sliit.library.dto.ResearchPaperResponse;
import com.sliit.library.entity.ResearchPaper;
import com.sliit.library.entity.User;
import com.sliit.library.repository.ResearchPaperRepository;
import com.sliit.library.repository.UserRepository;
import com.sliit.library.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class ResearchPaperService {

    @Autowired
    private ResearchPaperRepository paperRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.upload.research-papers:uploads/research-papers}")
    private String uploadDir;

    @Value("${app.upload.research-paper-covers:uploads/research-paper-covers}")
    private String coverDir;

    @Transactional(readOnly = true)
    public List<ResearchPaperResponse> getAllPublic() {
        return paperRepository.findByIsPublicTrueOrderByUploadedAtDesc().stream()
                .map(this::map).toList();
    }

    @Transactional(readOnly = true)
    public Page<ResearchPaperResponse> search(String keyword, Pageable pageable) {
        return paperRepository.searchPapers(keyword, pageable).map(this::map);
    }

    @Transactional(readOnly = true)
    public ResearchPaperResponse getById(Long id) {
        return map(paperRepository.findById(id).orElseThrow(() -> new RuntimeException("Paper not found")));
    }

    @Transactional
    public ResearchPaperResponse upload(String title, String author, String abstractText,
            String journal, Integer publicationYear, String researchField, String keywords,
            MultipartFile file, MultipartFile coverImage) throws IOException {
        User user = getCurrentUser();
        String ext = resolveExt(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + "." + ext;
        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        Path filePath = dir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String coverUrl = null;
        if (coverImage != null && !coverImage.isEmpty()) {
            coverUrl = saveCover(coverImage);
        }

        ResearchPaper paper = ResearchPaper.builder()
                .title(title).author(author).abstractText(abstractText)
                .journal(journal).publicationYear(publicationYear)
                .researchField(researchField).keywords(keywords)
                .fileFormat(ext.toUpperCase()).filePath(filePath.toString()).fileSize(file.getSize())
                .coverImageUrl(coverUrl).uploadedBy(user).isPublic(true)
                .downloadCount(0).viewCount(0)
                .build();
        paperRepository.save(paper);
        return map(paper);
    }

    @Transactional
    public void delete(Long id) {
        ResearchPaper p = paperRepository.findById(id).orElseThrow(() -> new RuntimeException("Paper not found"));
        try { Files.deleteIfExists(Paths.get(p.getFilePath())); } catch (IOException ignored) { }
        if (p.getCoverImageUrl() != null) {
            String name = p.getCoverImageUrl().replace("/api/uploads/research-paper-covers/", "");
            try { Files.deleteIfExists(Paths.get(coverDir).resolve(name)); } catch (IOException ignored) { }
        }
        paperRepository.delete(p);
    }

    @Transactional
    public byte[] download(Long id) throws IOException {
        ResearchPaper p = paperRepository.findById(id).orElseThrow(() -> new RuntimeException("Paper not found"));
        p.setDownloadCount(p.getDownloadCount() + 1);
        paperRepository.save(p);
        return Files.readAllBytes(Paths.get(p.getFilePath()));
    }

    @Transactional
    public Resource view(Long id) throws MalformedURLException {
        ResearchPaper p = paperRepository.findById(id).orElseThrow(() -> new RuntimeException("Paper not found"));
        p.setViewCount((p.getViewCount() == null ? 0 : p.getViewCount()) + 1);
        paperRepository.save(p);
        return new UrlResource(Paths.get(p.getFilePath()).toUri());
    }

    public Resource getCover(String filename) throws MalformedURLException {
        return new UrlResource(Paths.get(coverDir).resolve(filename).toUri());
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl ud = (UserDetailsImpl) auth.getPrincipal();
        return userRepository.findById(ud.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String resolveExt(String name) {
        return (name != null && name.contains(".")) ? name.substring(name.lastIndexOf(".") + 1) : "pdf";
    }

    private String saveCover(MultipartFile file) throws IOException {
        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) ext = original.substring(original.lastIndexOf("."));
        String fileName = UUID.randomUUID() + ext;
        Path dir = Paths.get(coverDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        return "/api/uploads/research-paper-covers/" + fileName;
    }

    private ResearchPaperResponse map(ResearchPaper p) {
        return ResearchPaperResponse.builder()
                .id(p.getId()).title(p.getTitle()).author(p.getAuthor())
                .abstractText(p.getAbstractText()).journal(p.getJournal())
                .publicationYear(p.getPublicationYear()).researchField(p.getResearchField())
                .keywords(p.getKeywords()).fileFormat(p.getFileFormat()).fileSize(p.getFileSize())
                .coverImageUrl(p.getCoverImageUrl()).isPublic(p.getIsPublic())
                .downloadCount(p.getDownloadCount()).viewCount(p.getViewCount())
                .uploadedByName(p.getUploadedBy() != null ? p.getUploadedBy().getFullName() : null)
                .uploadedAt(p.getUploadedAt())
                .build();
    }
}
