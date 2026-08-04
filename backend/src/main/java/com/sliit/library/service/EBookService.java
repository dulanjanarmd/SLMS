package com.sliit.library.service;

import com.sliit.library.dto.*;
import com.sliit.library.entity.*;
import com.sliit.library.repository.*;
import com.sliit.library.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.core.io.Resource;
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
public class EBookService {

    @Autowired
    private EBookRepository eBookRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.upload.ebooks:uploads/ebooks}")
    private String uploadPath;

    @Value("${app.upload.ebook-covers:uploads/ebook-covers}")
    private String coverUploadDir;

    @Transactional(readOnly = true)
    public List<EBookResponse> getAllPublicEBooks() {
        return eBookRepository.findByIsPublicTrue().stream()
                .map(this::mapToEBookResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<EBookResponse> searchEBooks(String keyword, Pageable pageable) {
        return eBookRepository.searchEBooks(keyword, pageable)
                .map(this::mapToEBookResponse);
    }

    @Transactional(readOnly = true)
    public EBookResponse getEBook(Long id) {
        EBook eBook = eBookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("eBook not found"));
        return mapToEBookResponse(eBook);
    }

    @Transactional
    public EBookResponse uploadEBook(String title, String author, String isbn, String description,
            String publisher, Integer publicationYear, String language,
            MultipartFile file, MultipartFile coverImage) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".") + 1)
                : "pdf";
        String fileName = UUID.randomUUID() + "." + extension;

        Path uploadDir = Paths.get(uploadPath).toAbsolutePath();
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        Path filePath = uploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String coverImageUrl = null;
        if (coverImage != null && !coverImage.isEmpty()) {
            coverImageUrl = saveCoverImage(coverImage);
        }

        EBook eBook = EBook.builder()
                .title(title)
                .author(author)
                .isbn(isbn)
                .description(description)
                .publisher(publisher)
                .publicationYear(publicationYear)
                .language(language)
                .fileFormat(extension.toUpperCase())
                .filePath(filePath.toString())
                .fileSize(file.getSize())
                .coverImageUrl(coverImageUrl)
                .uploadedBy(user)
                .isPublic(true)
                .downloadCount(0)
                .build();

        eBookRepository.save(eBook);
        return mapToEBookResponse(eBook);
    }

    @Transactional
    public void deleteEBook(Long id) {
        EBook eBook = eBookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("eBook not found"));

        try {
            Path filePath = Paths.get(eBook.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but continue
        }

        if (eBook.getCoverImageUrl() != null) {
            String fileName = eBook.getCoverImageUrl().replace("/api/uploads/ebook-covers/", "");
            try {
                Path coverPath = Paths.get(coverUploadDir).resolve(fileName);
                Files.deleteIfExists(coverPath);
            } catch (IOException ignored) { }
        }

        eBookRepository.delete(eBook);
    }

    @Transactional
    public byte[] downloadEBook(Long id) throws IOException {
        EBook eBook = eBookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("eBook not found"));

        eBook.setDownloadCount(eBook.getDownloadCount() + 1);
        eBookRepository.save(eBook);

        return Files.readAllBytes(Paths.get(eBook.getFilePath()));
    }

    @Transactional
    public Resource viewEBookOnline(Long id) throws MalformedURLException {
        EBook eBook = eBookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("eBook not found"));
        Path filePath = Paths.get(eBook.getFilePath());
        return new UrlResource(filePath.toUri());
    }

    public Resource getEBookCover(String filename) throws MalformedURLException {
        Path file = Paths.get(coverUploadDir).toAbsolutePath().resolve(filename);
        return new UrlResource(file.toUri());
    }

    private String saveCoverImage(MultipartFile file) throws IOException {
        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + ext;
        Path dir = Paths.get(coverUploadDir).toAbsolutePath();
        if (!Files.exists(dir)) Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        return "/api/uploads/ebook-covers/" + fileName;
    }

    private EBookResponse mapToEBookResponse(EBook eBook) {
        return EBookResponse.builder()
                .id(eBook.getId())
                .title(eBook.getTitle())
                .author(eBook.getAuthor())
                .isbn(eBook.getIsbn())
                .description(eBook.getDescription())
                .publisher(eBook.getPublisher())
                .publicationYear(eBook.getPublicationYear())
                .language(eBook.getLanguage())
                .fileFormat(eBook.getFileFormat())
                .fileSize(eBook.getFileSize())
                .coverImageUrl(eBook.getCoverImageUrl())
                .filePath(eBook.getFilePath())
                .isPublic(eBook.getIsPublic())
                .downloadCount(eBook.getDownloadCount())
                .uploadedByName(eBook.getUploadedBy() != null ? eBook.getUploadedBy().getFullName() : null)
                .uploadedAt(eBook.getUploadedAt())
                .build();
    }
}
