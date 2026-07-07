package com.sliit.library.repository;

import com.sliit.library.entity.BorrowRecord;
import com.sliit.library.entity.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByUserId(Long userId);

    List<BorrowRecord> findByBookId(Long bookId);

    List<BorrowRecord> findByStatus(BorrowStatus status);

    List<BorrowRecord> findByUserIdAndStatus(Long userId, BorrowStatus status);

    @Query("SELECT br FROM BorrowRecord br WHERE br.user.id = :userId AND br.status IN ('ACTIVE', 'RENEWED', 'RENEWAL_REQUESTED')")
    List<BorrowRecord> findActiveByUserId(@Param("userId") Long userId);

    @Query("SELECT br FROM BorrowRecord br WHERE br.status IN ('ACTIVE', 'RENEWED', 'RENEWAL_REQUESTED')")
    List<BorrowRecord> findAllActiveLoans();

    @Query("SELECT br FROM BorrowRecord br WHERE br.status = 'ACTIVE' AND br.dueDate < :currentDate")
    List<BorrowRecord> findOverdueLoans(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT br FROM BorrowRecord br WHERE br.user.id = :userId AND br.status = 'ACTIVE' AND br.dueDate < :currentDate")
    List<BorrowRecord> findOverdueByUser(@Param("userId") Long userId, @Param("currentDate") LocalDate currentDate);

    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.user.id = :userId AND br.status IN ('ACTIVE', 'RENEWED', 'RENEWAL_REQUESTED')")
    Long countActiveLoansByUser(@Param("userId") Long userId);

    @Query("SELECT br FROM BorrowRecord br WHERE br.status = 'RENEWAL_REQUESTED'")
    List<BorrowRecord> findRenewalRequests();

    @Query("SELECT br FROM BorrowRecord br WHERE br.issueDate = :today")
    List<BorrowRecord> findTodayLoans(@Param("today") LocalDate today);

    @Query("SELECT br FROM BorrowRecord br WHERE br.returnDate = :today AND br.status = 'RETURNED'")
    List<BorrowRecord> findTodayReturns(@Param("today") LocalDate today);

    Long countByStatus(BorrowStatus status);

    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.issueDate = :today")
    Long countTodayLoans(@Param("today") LocalDate today);

    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.returnDate = :today AND br.status = 'RETURNED'")
    Long countTodayReturns(@Param("today") LocalDate today);
}
