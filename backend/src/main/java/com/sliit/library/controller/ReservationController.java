package com.sliit.library.controller;

import com.sliit.library.dto.*;
import com.sliit.library.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @PostMapping("/reservations")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<ReservationResponse> createReservation(@RequestBody ReservationRequest request) {
        return ResponseEntity.ok(reservationService.createReservation(request));
    }

    @PostMapping("/reservations/{reservationId}/cancel")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<ReservationResponse> cancelReservation(
            @PathVariable Long reservationId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(reservationService.cancelReservation(reservationId, userId));
    }

    @GetMapping("/reservations/user/{userId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<ReservationResponse>> getUserReservations(@PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getUserReservations(userId));
    }

    @GetMapping("/reservations/book/{bookId}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<ReservationResponse>> getBookReservations(@PathVariable Long bookId) {
        return ResponseEntity.ok(reservationService.getBookReservations(bookId));
    }

    @GetMapping("/librarian/reservations/pending")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<ReservationResponse>> getPendingReservations() {
        return ResponseEntity.ok(reservationService.getPendingReservations());
    }

    @GetMapping("/librarian/reservations/active")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<ReservationResponse>> getPendingAndNotifiedReservations() {
        return ResponseEntity.ok(reservationService.getPendingAndNotifiedReservations());
    }

    @GetMapping("/librarian/reservations/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<ReservationResponse> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    @GetMapping("/librarian/reservations/all")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @PutMapping("/librarian/reservations/{id}/fulfill")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<ReservationResponse> fulfillReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.fulfillReservation(id));
    }
}
