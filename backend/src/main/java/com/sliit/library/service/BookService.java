package com.sliit.library.service;

import com.sliit.library.dto.*;
import com.sliit.library.entity.*;
import com.sliit.library.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${app.upload.book-covers:uploads/book-covers}")
    private String coverUploadDir;

    @Value("${library.loan.undergraduate.max-books:4}")
    private int undergradMaxBooks;

    @Value("${library.loan.postgraduate.max-books:6}")
    private int postgradMaxBooks;

    @Value("${library.loan.faculty.max-books:10}")
    private int facultyMaxBooks;

    @Transactional
    public BookResponse addBook(BookRequestDTO request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .additionalAuthors(request.getAdditionalAuthors())
                .isbn(request.getIsbn())
                .isbn13(request.getIsbn13())
                .publisher(request.getPublisher())
                .publicationYear(request.getPublicationYear())
                .description(request.getDescription())
                .edition(request.getEdition())
                .language(request.getLanguage())
                .format(request.getFormat())
                .shelfLocation(request.getShelfLocation())
                .coverImageUrl(request.getCoverImageUrl())
                .totalCopies(request.getTotalCopies() != null ? request.getTotalCopies() : 1)
                .availableCopies(request.getTotalCopies() != null ? request.getTotalCopies() : 1)
                .replacementCost(request.getReplacementCost())
                .status(request.getStatus() != null ? request.getStatus() : BookStatus.AVAILABLE)
                .ddcNumber(request.getDdcNumber())
                .subjectHeadings(request.getSubjectHeadings())
                .accessionNumber(request.getAccessionNumber())
                .category(category)
                .acquisitionDate(request.getAcquisitionDate())
                .build();

        bookRepository.save(book);
        return mapToBookResponse(book);
    }

    @Transactional
    public BookResponse addBookWithImage(String dataJson, MultipartFile coverImage) throws IOException {
        BookRequestDTO request = objectMapper.readValue(dataJson, BookRequestDTO.class);
        if (coverImage != null && !coverImage.isEmpty()) {
            request.setCoverImageUrl(saveImage(coverImage));
        }
        return addBook(request);
    }

    @Transactional
    public BookResponse updateBookWithImage(Long id, String dataJson, MultipartFile coverImage) throws IOException {
        BookRequestDTO request = objectMapper.readValue(dataJson, BookRequestDTO.class);
        if (coverImage != null && !coverImage.isEmpty()) {
            request.setCoverImageUrl(saveImage(coverImage));
        }
        return updateBook(id, request);
    }

    private String saveImage(MultipartFile file) throws IOException {
        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + ext;
        Path dir = Paths.get(coverUploadDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        return "/api/uploads/book-covers/" + fileName;
    }

    @Transactional
    public BookResponse updateBook(Long id, BookRequestDTO request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (request.getTitle() != null) book.setTitle(request.getTitle());
        if (request.getAuthor() != null) book.setAuthor(request.getAuthor());
        if (request.getAdditionalAuthors() != null) book.setAdditionalAuthors(request.getAdditionalAuthors());
        if (request.getIsbn() != null) book.setIsbn(request.getIsbn());
        if (request.getIsbn13() != null) book.setIsbn13(request.getIsbn13());
        if (request.getPublisher() != null) book.setPublisher(request.getPublisher());
        if (request.getPublicationYear() != null) book.setPublicationYear(request.getPublicationYear());
        if (request.getDescription() != null) book.setDescription(request.getDescription());
        if (request.getEdition() != null) book.setEdition(request.getEdition());
        if (request.getLanguage() != null) book.setLanguage(request.getLanguage());
        if (request.getFormat() != null) book.setFormat(request.getFormat());
        if (request.getShelfLocation() != null) book.setShelfLocation(request.getShelfLocation());
        if (request.getCoverImageUrl() != null) book.setCoverImageUrl(request.getCoverImageUrl());
        if (request.getTotalCopies() != null) {
            int diff = request.getTotalCopies() - book.getTotalCopies();
            book.setTotalCopies(request.getTotalCopies());
            book.setAvailableCopies(Math.max(0, book.getAvailableCopies() + diff));
        }
        if (request.getReplacementCost() != null) book.setReplacementCost(request.getReplacementCost());
        if (request.getStatus() != null) book.setStatus(request.getStatus());
        if (request.getDdcNumber() != null) book.setDdcNumber(request.getDdcNumber());
        if (request.getSubjectHeadings() != null) book.setSubjectHeadings(request.getSubjectHeadings());
        if (request.getAccessionNumber() != null) book.setAccessionNumber(request.getAccessionNumber());
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            book.setCategory(category);
        }

        bookRepository.save(book);
        return mapToBookResponse(book);
    }

    @Transactional(readOnly = true)
    public BookResponse getBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        return mapToBookResponse(book);
    }

    @Transactional(readOnly = true)
    public Page<BookResponse> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable).map(this::mapToBookResponse);
    }

    @Transactional(readOnly = true)
    public Page<BookResponse> searchBooks(String keyword, Pageable pageable) {
        return bookRepository.searchBooks(keyword, pageable).map(this::mapToBookResponse);
    }

    @Transactional(readOnly = true)
    public Page<BookResponse> advancedSearch(String title, String author, String isbn,
                                              Long categoryId, BookStatus status, Integer year, Pageable pageable) {
        return bookRepository.advancedSearch(title, author, isbn, categoryId, status, year, pageable)
                .map(this::mapToBookResponse);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        book.setStatus(BookStatus.WITHDRAWN);
        bookRepository.save(book);
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getPopularBooks(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("borrowCount").descending());
        return bookRepository.findMostPopularBooks(pageable).stream()
                .map(this::mapToBookResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getBooksByCategory(Long categoryId) {
        return bookRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToBookResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getBooksByStatus(BookStatus status) {
        return bookRepository.findByStatus(status).stream()
                .map(this::mapToBookResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getTotalBookCount() {
        return bookRepository.count();
    }

    private BookResponse mapToBookResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .additionalAuthors(book.getAdditionalAuthors())
                .isbn(book.getIsbn())
                .isbn13(book.getIsbn13())
                .publisher(book.getPublisher())
                .publicationYear(book.getPublicationYear())
                .description(book.getDescription())
                .edition(book.getEdition())
                .language(book.getLanguage())
                .format(book.getFormat())
                .shelfLocation(book.getShelfLocation())
                .coverImageUrl(book.getCoverImageUrl())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .reservedCopies(book.getReservedCopies())
                .replacementCost(book.getReplacementCost())
                .status(book.getStatus())
                .ddcNumber(book.getDdcNumber())
                .subjectHeadings(book.getSubjectHeadings())
                .accessionNumber(book.getAccessionNumber())
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
                .acquisitionDate(book.getAcquisitionDate())
                .createdAt(book.getCreatedAt())
                .borrowCount(book.getBorrowCount())
                .build();
    }
}
