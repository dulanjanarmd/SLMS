package com.sliit.library.service;

import com.sliit.library.repository.BorrowRecordRepository;
import com.sliit.library.repository.ReservationRepository;
import com.sliit.library.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserStatsService {

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private FineRepository fineRepository;

    public Map<String, Object> getUserStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Count books borrowed by user
        int booksBorrowed = borrowRecordRepository.findByUserId(userId).size();
        stats.put("booksBorrowed", booksBorrowed);
        
        // Count books returned by user
        int booksReturned = (int) borrowRecordRepository.findByUserId(userId).stream()
            .filter(br -> "RETURNED".equals(br.getStatus().toString()))
            .count();
        stats.put("booksReturned", booksReturned);
        
        // Count active reservations by user
        int activeReservations = reservationRepository.findByUserId(userId).size();
        stats.put("activeReservations", activeReservations);
        
        // Calculate unpaid fines for user (default to 0 for now)
        stats.put("unpaidFines", 0.0);
        
        // Set default reading goal (could be made configurable per user)
        stats.put("readingGoal", 24);
        
        // Estimate books read (same as returned for now)
        stats.put("booksRead", booksReturned);
        
        return stats;
    }
}
