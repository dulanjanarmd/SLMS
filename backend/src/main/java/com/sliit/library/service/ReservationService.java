package com.sliit.library.service;

import com.sliit.library.dto.*;
import com.sliit.library.entity.*;
import com.sliit.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        long pendingReservations = reservationRepository.countPendingByUser(user.getId());
        if (pendingReservations >= 3) {
            throw new RuntimeException("Maximum 3 simultaneous reservations allowed");
        }

        boolean alreadyBorrowed = book.getBorrowRecords().stream()
                .anyMatch(br -> br.getUser().getId().equals(user.getId()) &&
                        (br.getStatus() == BorrowStatus.ACTIVE || br.getStatus() == BorrowStatus.RENEWED));
        if (alreadyBorrowed) {
            throw new RuntimeException("You already have this book borrowed");
        }

        boolean alreadyReserved = reservationRepository.findByUserIdAndStatus(user.getId(), ReservationStatus.PENDING)
                .stream().anyMatch(r -> r.getBook().getId().equals(book.getId()));
        if (alreadyReserved) {
            throw new RuntimeException("You already have a pending reservation for this book");
        }

        Integer maxPosition = reservationRepository.findMaxQueuePosition(book.getId());
        int newPosition = (maxPosition != null ? maxPosition : 0) + 1;

        Reservation reservation = Reservation.builder()
                .user(user)
                .book(book)
                .status(ReservationStatus.PENDING)
                .queuePosition(newPosition)
                .build();

        reservationRepository.save(reservation);

        // Only count as reserved copy when book is unavailable
        if (book.getAvailableCopies() <= 0) {
            book.setReservedCopies(book.getReservedCopies() + 1);
            bookRepository.save(book);
        }

        // Notify all librarians about the new reservation
        String notifTitle = "New Reservation: " + book.getTitle();
        String notifMsg = user.getFullName() + " (" + user.getStudentStaffId() + ") has reserved \"" +
                book.getTitle() + "\". Reservation #" + reservation.getId() + ".";
        userRepository.findByRole(Role.LIBRARIAN).forEach(librarian -> notificationService.sendNotification(librarian,
                NotificationType.NEW_RESERVATION, notifTitle, notifMsg));

        return mapToReservationResponse(reservation);
    }

    @Transactional
    public ReservationResponse cancelReservation(Long reservationId, Long userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!reservation.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own reservations");
        }

        if (reservation.getStatus() == ReservationStatus.FULFILLED ||
                reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Reservation is already " + reservation.getStatus().name().toLowerCase());
        }

        boolean wasNotified = reservation.getStatus() == ReservationStatus.NOTIFIED;
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        Book book = reservation.getBook();
        if (book.getReservedCopies() > 0) {
            book.setReservedCopies(book.getReservedCopies() - 1);
        }
        // NOTIFIED means a copy was held for this user — restore it
        if (wasNotified) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
        }
        // countPendingByBook already excludes the now-CANCELLED reservation
        long remainingPending = reservationRepository.countPendingByBook(book.getId());
        if (remainingPending <= 0 && book.getAvailableCopies() > 0) {
            book.setStatus(BookStatus.AVAILABLE);
        }
        bookRepository.save(book);

        List<Reservation> pendingList = reservationRepository.findPendingByBookOrderByDate(book.getId());
        for (int i = 0; i < pendingList.size(); i++) {
            pendingList.get(i).setQueuePosition(i + 1);
            reservationRepository.save(pendingList.get(i));
        }

        return mapToReservationResponse(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId).stream()
                .map(this::mapToReservationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getBookReservations(Long bookId) {
        return reservationRepository.findByBookId(bookId).stream()
                .map(this::mapToReservationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getPendingReservations() {
        return reservationRepository.findByStatus(ReservationStatus.PENDING).stream()
                .map(this::mapToReservationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::mapToReservationResponse)
                .toList();
    }

    @Transactional
    public void processReturnedBookNotifications(Long bookId) {
        List<Reservation> pendingList = reservationRepository.findPendingByBookOrderByDate(bookId);
        if (!pendingList.isEmpty()) {
            Reservation firstInQueue = pendingList.get(0);
            firstInQueue.setStatus(ReservationStatus.NOTIFIED);
            firstInQueue.setNotificationDate(LocalDateTime.now());
            firstInQueue.setExpiryDate(LocalDateTime.now().plusHours(48));
            reservationRepository.save(firstInQueue);

            Book book = firstInQueue.getBook();
            book.setStatus(BookStatus.RESERVED);
            bookRepository.save(book);

            notificationService.sendNotification(
                    firstInQueue.getUser(),
                    NotificationType.RESERVATION_READY,
                    "Book Available: " + book.getTitle(),
                    "The book \"" + book.getTitle() + "\" you reserved is now available. " +
                            "Please collect it within 48 hours. Your queue position is #1.");
        }
    }

    @Transactional
    public ReservationResponse fulfillReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getStatus() == ReservationStatus.FULFILLED) {
            throw new RuntimeException("Reservation is already fulfilled");
        }
        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Cannot fulfill a cancelled reservation");
        }

        reservation.setStatus(ReservationStatus.FULFILLED);
        reservation.setFulfilledDate(LocalDateTime.now());
        reservationRepository.save(reservation);

        Book book = reservation.getBook();
        book.setReservedCopies(Math.max(0, book.getReservedCopies() - 1));
        bookRepository.save(book);

        return mapToReservationResponse(reservation);
    }

    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .map(this::mapToReservationResponse)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getPendingAndNotifiedReservations() {
        List<Reservation> pending = reservationRepository.findByStatus(ReservationStatus.PENDING);
        List<Reservation> notified = reservationRepository.findByStatus(ReservationStatus.NOTIFIED);
        return java.util.stream.Stream.concat(pending.stream(), notified.stream())
                .map(this::mapToReservationResponse)
                .toList();
    }

    private ReservationResponse mapToReservationResponse(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .userId(reservation.getUser().getId())
                .userName(reservation.getUser().getFullName())
                .studentStaffId(reservation.getUser().getStudentStaffId())
                .bookId(reservation.getBook().getId())
                .bookTitle(reservation.getBook().getTitle())
                .bookAuthor(reservation.getBook().getAuthor())
                .isbn(reservation.getBook().getIsbn())
                .status(reservation.getStatus())
                .queuePosition(reservation.getQueuePosition())
                .reservationDate(reservation.getReservationDate())
                .notificationDate(reservation.getNotificationDate())
                .expiryDate(reservation.getExpiryDate())
                .fulfilledDate(reservation.getFulfilledDate())
                .build();
    }
}
