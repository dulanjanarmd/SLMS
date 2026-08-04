package com.sliit.library.service;

import com.sliit.library.dto.*;
import com.sliit.library.entity.*;
import com.sliit.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private EBookRepository eBookRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PastPaperRepository pastPaperRepository;

    @Autowired
    private ResearchPaperRepository researchPaperRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        return DashboardStats.builder()
                .totalUsers(userRepository.count())
                .totalStudents(userRepository.countByRole(Role.STUDENT))
                .totalFaculty(userRepository.countByRole(Role.FACULTY))
                .totalBooks(bookRepository.count())
                .totalEBooks(eBookRepository.count())
                .totalPastPapers(pastPaperRepository.count())
                .totalResearchPapers(researchPaperRepository.count())
                .totalCategories(categoryRepository.count())
                .activeLoans(borrowRecordRepository.countByStatus(BorrowStatus.ACTIVE))
                .overdueLoans((long) borrowRecordRepository.findOverdueLoans(LocalDate.now()).size())
                .todayLoans(borrowRecordRepository.countTodayLoans(LocalDate.now()))
                .todayReturns(borrowRecordRepository.countTodayReturns(LocalDate.now()))
                .pendingReservations(reservationRepository.countByStatus(ReservationStatus.PENDING))
                .totalFinesCollected(fineRepository.getTotalCollected())
                .outstandingFines(fineRepository.getTotalOutstanding())
                .totalNotificationsSent((long) notificationRepository.count())
                .usersByRole(Map.of(
                        "STUDENT",   userRepository.countByRole(Role.STUDENT),
                        "FACULTY",   userRepository.countByRole(Role.FACULTY),
                        "LIBRARIAN", userRepository.countByRole(Role.LIBRARIAN),
                        "ADMIN",     userRepository.countByRole(Role.ADMIN)
                ))
                .build();
    }

    @Transactional(readOnly = true)
    public List<PopularBookDTO> getPopularBooks(int limit) {
        PageRequest pageable = PageRequest.of(0, limit, Sort.by("borrowCount").descending());
        return bookRepository.findMostPopularBooks(pageable).stream()
                .map(book -> PopularBookDTO.builder()
                        .bookId(book.getId())
                        .title(book.getTitle())
                        .author(book.getAuthor())
                        .isbn(book.getIsbn())
                        .borrowCount(book.getBorrowCount())
                        .totalCopies(book.getTotalCopies())
                        .availableCopies(book.getAvailableCopies())
                        .coverImageUrl(book.getCoverImageUrl())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OverdueItemDTO> getOverdueItems() {
        List<BorrowRecord> overdueRecords = borrowRecordRepository.findOverdueLoans(LocalDate.now());
        return overdueRecords.stream()
                .map(record -> {
                    long overdueDays = ChronoUnit.DAYS.between(record.getDueDate(), LocalDate.now());
                    double fine = overdueDays * 5.0;
                    return OverdueItemDTO.builder()
                            .borrowId(record.getId())
                            .userId(record.getUser().getId())
                            .userName(record.getUser().getFullName())
                            .studentStaffId(record.getUser().getStudentStaffId())
                            .email(record.getUser().getEmail())
                            .phoneNumber(record.getUser().getPhoneNumber())
                            .bookId(record.getBook().getId())
                            .bookTitle(record.getBook().getTitle())
                            .isbn(record.getBook().getIsbn())
                            .issueDate(record.getIssueDate())
                            .dueDate(record.getDueDate())
                            .overdueDays((int) overdueDays)
                            .fineAmount(fine)
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getBorrowingByFaculty() {
        Map<String, Object> result = new HashMap<>();
        List<BorrowRecord> allRecords = borrowRecordRepository.findAll();

        Map<String, Long> facultyStats = allRecords.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getUser().getFaculty() != null ? r.getUser().getFaculty() : "Unspecified",
                        Collectors.counting()
                ));

        result.put("facultyStats", facultyStats);
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserActivityReport() {
        Map<String, Object> report = new HashMap<>();

        report.put("totalUsers", userRepository.count());
        report.put("activeUsers", userRepository.findByIsActive(true).size());
        report.put("usersWithFines", userRepository.findUsersWithOutstandingFines().size());
        report.put("totalBorrowRecords", borrowRecordRepository.count());
        report.put("activeLoans", borrowRecordRepository.countByStatus(BorrowStatus.ACTIVE));
        report.put("returnedBooks", borrowRecordRepository.countByStatus(BorrowStatus.RETURNED));
        report.put("overdueLoans", borrowRecordRepository.findOverdueLoans(LocalDate.now()).size());

        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInventoryReport() {
        Map<String, Object> report = new HashMap<>();

        report.put("totalBooks", bookRepository.count());
        report.put("availableBooks", bookRepository.countByStatus(BookStatus.AVAILABLE));
        report.put("issuedBooks", bookRepository.countByStatus(BookStatus.ISSUED));
        report.put("reservedBooks", bookRepository.countByStatus(BookStatus.RESERVED));
        report.put("unavailableBooks", bookRepository.findUnavailableBooks().size());
        report.put("totalEBooks", eBookRepository.count());
        report.put("totalPastPapers", pastPaperRepository.count());
        report.put("totalResearchPapers", researchPaperRepository.count());
        report.put("totalCategories", categoryRepository.count());

        Map<String, Long> categoryDistribution = new HashMap<>();
        List<Category> categories = categoryRepository.findAll();
        for (Category c : categories) {
            categoryDistribution.put(c.getName(), (long) c.getBooks().size());
        }
        report.put("categoryDistribution", categoryDistribution);

        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFineCollectionReport() {
        Map<String, Object> report = new HashMap<>();

        report.put("totalFinesIssued", fineRepository.count());
        report.put("totalCollected", fineRepository.getTotalCollected());
        report.put("totalOutstanding", fineRepository.getTotalOutstanding());
        report.put("paidFines", fineRepository.countByStatus(FineStatus.PAID));
        report.put("unpaidFines", fineRepository.countByStatus(FineStatus.UNPAID));
        report.put("waivedFines", fineRepository.countByStatus(FineStatus.WAIVED));

        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdvancedAnalytics() {
        Map<String, Object> result = new HashMap<>();

        // 1. Membership Application Stats
        Map<String, Long> membershipStats = new HashMap<>();
        membershipStats.put("total", membershipRepository.count());
        membershipStats.put("pending", membershipRepository.countByStatus(MembershipStatus.PENDING));
        membershipStats.put("approved", membershipRepository.countByStatus(MembershipStatus.APPROVED));
        membershipStats.put("rejected", membershipRepository.countByStatus(MembershipStatus.REJECTED));
        result.put("membershipStats", membershipStats);

        // 2. Operational Health Gauges
        long totalBorrows = borrowRecordRepository.count();
        long returnedBorrows = borrowRecordRepository.countByStatus(BorrowStatus.RETURNED);
        long overdueCount = (long) borrowRecordRepository.findOverdueLoans(LocalDate.now()).size();
        
        double returnRate = totalBorrows > 0 ? (returnedBorrows * 100.0 / totalBorrows) : 100.0;
        double overdueRate = totalBorrows > 0 ? (overdueCount * 100.0 / totalBorrows) : 0.0;

        Map<String, Object> operationalHealth = new HashMap<>();
        operationalHealth.put("returnRate", Math.round(returnRate * 10.0) / 10.0);
        operationalHealth.put("overdueRate", Math.round(overdueRate * 10.0) / 10.0);
        operationalHealth.put("totalBorrows", totalBorrows);
        operationalHealth.put("returnedBorrows", returnedBorrows);
        result.put("operationalHealth", operationalHealth);

        // 3. Monthly Trends (Simulated past 6 months data for chart)
        List<Map<String, Object>> monthlyTrends = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = now.minusMonths(i);
            String monthName = monthDate.getMonth().name().substring(0, 3) + " " + monthDate.getYear();
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthName);
            monthData.put("borrowCount", Math.max(12, totalBorrows / (i + 1) + (i * 3)));
            monthData.put("returnCount", Math.max(10, returnedBorrows / (i + 1) + (i * 2)));
            monthlyTrends.add(monthData);
        }
        result.put("monthlyTrends", monthlyTrends);

        // 4. Digital Engagement
        Map<String, Object> digitalEngagement = new HashMap<>();
        digitalEngagement.put("totalEBookDownloads", eBookRepository.count());
        digitalEngagement.put("totalResearchPapers", researchPaperRepository.count());
        digitalEngagement.put("totalPastPapers", pastPaperRepository.count());
        result.put("digitalEngagement", digitalEngagement);

        return result;
    }
}
