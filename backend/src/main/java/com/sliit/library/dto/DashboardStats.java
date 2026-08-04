package com.sliit.library.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardStats {

    private Long totalUsers;
    private Long totalStudents;
    private Long totalFaculty;
    private Long totalBooks;
    private Long totalEBooks;
    private Long totalPastPapers;
    private Long totalResearchPapers;
    private Long totalCategories;
    private Long activeLoans;
    private Long overdueLoans;
    private Long todayLoans;
    private Long todayReturns;
    private Long pendingReservations;
    private Double totalFinesCollected;
    private Double outstandingFines;
    private Long totalNotificationsSent;
    private Map<String, Long> usersByRole;
}
