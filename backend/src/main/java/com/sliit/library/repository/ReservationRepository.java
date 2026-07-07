package com.sliit.library.repository;

import com.sliit.library.entity.Reservation;
import com.sliit.library.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByBookId(Long bookId);

    List<Reservation> findByStatus(ReservationStatus status);

    List<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE r.book.id = :bookId AND r.status = 'PENDING' ORDER BY r.reservationDate ASC")
    List<Reservation> findPendingByBookOrderByDate(@Param("bookId") Long bookId);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.user.id = :userId AND r.status = 'PENDING'")
    Long countPendingByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.book.id = :bookId AND r.status IN ('PENDING', 'NOTIFIED')")
    Long countPendingByBook(@Param("bookId") Long bookId);

    @Query("SELECT r FROM Reservation r WHERE r.status = 'NOTIFIED' AND r.expiryDate < :now")
    List<Reservation> findExpiredNotified(@Param("now") LocalDateTime now);

    Long countByStatus(ReservationStatus status);

    @Query("SELECT MAX(r.queuePosition) FROM Reservation r WHERE r.book.id = :bookId AND r.status = 'PENDING'")
    Integer findMaxQueuePosition(@Param("bookId") Long bookId);

    Optional<Reservation> findFirstByBookIdAndStatusOrderByReservationDateAsc(Long bookId, ReservationStatus status);
}
