package com.sliit.library.service;

import com.sliit.library.dto.*;
import com.sliit.library.entity.*;
import com.sliit.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BorrowService {

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ReservationService reservationService;

    @Value("${library.fine.rate-per-day:5.0}")
    private double fineRatePerDay;

    @Value("${library.fine.max-cap-percentage:150}")
    private int maxFineCapPercentage;

    @Value("${library.loan.max-renewals:2}")
    private int maxRenewals;

    @Value("${library.loan.undergraduate.max-days:14}")
    private int undergradMaxDays;

    @Value("${library.loan.postgraduate.max-books:6}")
    private int postgradMaxBooks;

    @Value("${library.loan.postgraduate.max-days:21}")
    private int postgradMaxDays;

    @Value("${library.loan.faculty.max-books:10}")
    private int facultyMaxBooks;

    @Value("${library.loan.faculty.max-days:30}")
    private int facultyMaxDays;

    @Value("${library.loan.undergraduate.max-books:4}")
    private int undergradMaxBooks;

    @Transactional
    public BorrowResponse issueBook(BorrowRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is not available for borrowing");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("User account is not active");
        }

        if (user.getOutstandingFine() != null && user.getOutstandingFine() > 500) {
            throw new RuntimeException("Cannot borrow: Outstanding fine exceeds LKR 500. Please pay your fines first.");
        }

        long activeLoans = borrowRecordRepository.countActiveLoansByUser(user.getId());
        int maxBooks = getMaxBooksForRole(user.getRole());
        if (activeLoans >= maxBooks) {
            throw new RuntimeException("Maximum borrow limit reached (" + maxBooks + " books)");
        }

        int loanDays = getLoanDaysForRole(user.getRole());
        LocalDate issueDate = LocalDate.now();
        LocalDate dueDate = issueDate.plusDays(loanDays);

        BorrowRecord borrowRecord = BorrowRecord.builder()
                .user(user)
                .book(book)
                .issueDate(issueDate)
                .dueDate(dueDate)
                .status(BorrowStatus.ACTIVE)
                .renewalCount(0)
                .build();

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        if (book.getAvailableCopies() == 0) {
            book.setStatus(BookStatus.ISSUED);
        }
        book.setBorrowCount(book.getBorrowCount() + 1);
        user.setCurrentBorrowCount(user.getCurrentBorrowCount() + 1);

        borrowRecordRepository.save(borrowRecord);
        bookRepository.save(book);
        userRepository.save(user);

        notificationService.sendNotification(
                user,
                NotificationType.BOOK_ISSUED,
                "Book Issued: " + book.getTitle(),
                "You have successfully borrowed \"" + book.getTitle() + "\". Due date: " + dueDate);

        return mapToBorrowResponse(borrowRecord);
    }

    @Transactional
    public BorrowResponse returnBook(Long borrowId) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (borrowRecord.getStatus() == BorrowStatus.RETURNED) {
            throw new RuntimeException("Book is already returned");
        }

        Book book = borrowRecord.getBook();
        User user = borrowRecord.getUser();
        LocalDate returnDate = LocalDate.now();

        borrowRecord.setReturnDate(returnDate);
        borrowRecord.setStatus(BorrowStatus.RETURNED);

        if (returnDate.isAfter(borrowRecord.getDueDate())) {
            long overdueDays = ChronoUnit.DAYS.between(borrowRecord.getDueDate(), returnDate);
            double fineAmount = overdueDays * fineRatePerDay;

            double maxFine = book.getReplacementCost() * maxFineCapPercentage / 100.0;
            if (maxFine > 0 && fineAmount > maxFine) {
                fineAmount = maxFine;
            }

            Fine fine = Fine.builder()
                    .user(user)
                    .borrowRecord(borrowRecord)
                    .book(book)
                    .amount(fineAmount)
                    .status(FineStatus.UNPAID)
                    .overdueDays((int) overdueDays)
                    .fineDate(returnDate)
                    .dueDate(borrowRecord.getDueDate())
                    .returnDate(returnDate)
                    .description("Overdue fine for \"" + book.getTitle() + "\" (" + overdueDays + " days)")
                    .build();

            fineRepository.save(fine);
            borrowRecord.setFineAmount(fineAmount);

            user.setOutstandingFine(user.getOutstandingFine() + fineAmount);
            userRepository.save(user);

            notificationService.sendNotification(
                    user,
                    NotificationType.FINE_IMPOSED,
                    "Fine Imposed: " + book.getTitle(),
                    "A fine of LKR " + fineAmount + " has been imposed for overdue book \"" + book.getTitle() + "\" ("
                            + overdueDays + " days overdue).");
        }

        book.setAvailableCopies(book.getAvailableCopies() + 1);
        book.setStatus(BookStatus.AVAILABLE);
        user.setCurrentBorrowCount(Math.max(0, user.getCurrentBorrowCount() - 1));

        borrowRecordRepository.save(borrowRecord);
        bookRepository.save(book);
        userRepository.save(user);

        notificationService.sendNotification(
                user,
                NotificationType.BOOK_RETURNED,
                "Book Returned: " + book.getTitle(),
                "\"" + book.getTitle() + "\" has been successfully returned.");

        reservationService.processReturnedBookNotifications(book.getId());

        return mapToBorrowResponse(borrowRecord);
    }

    @Transactional
    public BorrowResponse renewBook(Long borrowId) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (borrowRecord.getStatus() != BorrowStatus.ACTIVE && borrowRecord.getStatus() != BorrowStatus.RENEWED) {
            throw new RuntimeException("Cannot renew: Book is not currently active");
        }

        if (borrowRecord.getRenewalCount() >= maxRenewals) {
            throw new RuntimeException("Maximum renewals (" + maxRenewals + ") reached");
        }

        User user = borrowRecord.getUser();
        if (user.getOutstandingFine() != null && user.getOutstandingFine() > 200) {
            throw new RuntimeException("Cannot renew: Outstanding fine exceeds LKR 200");
        }

        int loanDays = getLoanDaysForRole(user.getRole());
        LocalDate newDueDate = LocalDate.now().plusDays(loanDays);

        borrowRecord.setDueDate(newDueDate);
        borrowRecord.setRenewalCount(borrowRecord.getRenewalCount() + 1);
        borrowRecord.setStatus(BorrowStatus.RENEWED);

        borrowRecordRepository.save(borrowRecord);

        notificationService.sendNotification(
                user,
                NotificationType.DUE_REMINDER,
                "Book Renewed: " + borrowRecord.getBook().getTitle(),
                "Your book \"" + borrowRecord.getBook().getTitle() + "\" has been renewed. New due date: "
                        + newDueDate);

        return mapToBorrowResponse(borrowRecord);
    }

    @Transactional(readOnly = true)
    public List<BorrowResponse> getUserBorrowHistory(Long userId) {
        return borrowRecordRepository.findByUserId(userId).stream()
                .map(this::mapToBorrowResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowResponse> getActiveLoans(Long userId) {
        return borrowRecordRepository.findByUserIdAndStatus(userId, BorrowStatus.ACTIVE).stream()
                .map(this::mapToBorrowResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowResponse> getOverdueLoans() {
        return borrowRecordRepository.findOverdueLoans(LocalDate.now()).stream()
                .map(this::mapToBorrowResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowResponse> getTodayLoans() {
        return borrowRecordRepository.findTodayLoans(LocalDate.now()).stream()
                .map(this::mapToBorrowResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowResponse> getTodayReturns() {
        return borrowRecordRepository.findTodayReturns(LocalDate.now()).stream()
                .map(this::mapToBorrowResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getActiveLoanCount() {
        return borrowRecordRepository.countByStatus(BorrowStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public long getOverdueLoanCount() {
        return borrowRecordRepository.findOverdueLoans(LocalDate.now()).size();
    }

    @Transactional(readOnly = true)
    public List<BorrowResponse> getAllActiveLoans() {
        return borrowRecordRepository.findByStatus(BorrowStatus.ACTIVE).stream()
                .map(this::mapToBorrowResponse)
                .toList();
    }

    private int getMaxBooksForRole(Role role) {
        return switch (role) {
            case STUDENT -> undergradMaxBooks;
            case FACULTY -> facultyMaxBooks;
            case LIBRARIAN -> 15;
            case ADMIN -> 20;
        };
    }

    private int getLoanDaysForRole(Role role) {
        return switch (role) {
            case STUDENT -> undergradMaxDays;
            case FACULTY -> facultyMaxDays;
            case LIBRARIAN -> facultyMaxDays;
            case ADMIN -> facultyMaxDays;
        };
    }

    private BorrowResponse mapToBorrowResponse(BorrowRecord record) {
        return BorrowResponse.builder()
                .id(record.getId())
                .userId(record.getUser().getId())
                .userName(record.getUser().getFullName())
                .studentStaffId(record.getUser().getStudentStaffId())
                .bookId(record.getBook().getId())
                .bookTitle(record.getBook().getTitle())
                .bookAuthor(record.getBook().getAuthor())
                .isbn(record.getBook().getIsbn())
                .issueDate(record.getIssueDate())
                .dueDate(record.getDueDate())
                .returnDate(record.getReturnDate())
                .status(record.getStatus())
                .renewalCount(record.getRenewalCount())
                .fineAmount(record.getFineAmount())
                .issuedByName(record.getIssuedBy() != null ? record.getIssuedBy().getFullName() : null)
                .createdAt(record.getCreatedAt())
                .build();
    }
}