package com.sliit.library.controller;

import com.sliit.library.dto.*;
import com.sliit.library.service.BorrowService;
import com.sliit.library.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;

    @Autowired
    private ReservationService reservationService;

    @PostMapping("/librarian/borrow/issue")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<BorrowResponse> issueBook(@RequestBody BorrowRequest request) {
        return ResponseEntity.ok(borrowService.issueBook(request));
    }

    @PostMapping("/borrow/self")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<BorrowResponse> borrowSelf(@RequestBody BorrowRequest request,
            org.springframework.security.core.Authentication authentication) {
        com.sliit.library.security.UserDetailsImpl userDetails =
                (com.sliit.library.security.UserDetailsImpl) authentication.getPrincipal();
        // Force userId to the authenticated user — students cannot borrow on behalf of others
        request.setUserId(userDetails.getId());
        return ResponseEntity.ok(borrowService.issueBook(request));
    }

    @PostMapping("/librarian/borrow/return/{borrowId}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<BorrowResponse> returnBook(@PathVariable Long borrowId) {
        BorrowResponse response = borrowService.returnBook(borrowId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/borrow/renew/{borrowId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<BorrowResponse> renewBook(@PathVariable Long borrowId) {
        return ResponseEntity.ok(borrowService.renewBook(borrowId));
    }

    @GetMapping("/borrow/user/{userId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<BorrowResponse>> getUserBorrowHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowService.getUserBorrowHistory(userId));
    }

    @GetMapping("/borrow/user/{userId}/active")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<BorrowResponse>> getActiveLoans(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowService.getActiveLoans(userId));
    }

    @GetMapping("/librarian/borrow/overdue")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<BorrowResponse>> getOverdueLoans() {
        return ResponseEntity.ok(borrowService.getOverdueLoans());
    }

    @GetMapping("/librarian/borrow/today")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<BorrowResponse>> getTodayLoans() {
        return ResponseEntity.ok(borrowService.getTodayLoans());
    }

    @GetMapping("/librarian/borrow/returns-today")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<BorrowResponse>> getTodayReturns() {
        return ResponseEntity.ok(borrowService.getTodayReturns());
    }

    @GetMapping("/librarian/borrow/all-active")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<BorrowResponse>> getAllActiveLoans() {
        return ResponseEntity.ok(borrowService.getAllActiveLoans());
    }
}
