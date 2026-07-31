package com.sliit.library.repository;

import com.sliit.library.entity.PastPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PastPaperRepository extends JpaRepository<PastPaper, Long> {

    List<PastPaper> findByIsPublicTrueOrderByAcademicYearDescSemesterAscUploadedAtDesc();

    @Query("SELECT p FROM PastPaper p WHERE p.isPublic = true")
    List<PastPaper> findAllPublic();

    @Query("SELECT p FROM PastPaper p WHERE p.isPublic = true " +
           "AND (:year IS NULL OR p.academicYear = :year) " +
           "AND (:semester IS NULL OR p.semester = :semester)")
    List<PastPaper> filter(@Param("year") String year, @Param("semester") String semester);

    @Query("SELECT DISTINCT p.academicYear FROM PastPaper p WHERE p.isPublic = true ORDER BY p.academicYear DESC")
    List<String> findDistinctYears();

    @Query("SELECT DISTINCT p.semester FROM PastPaper p WHERE p.isPublic = true ORDER BY p.semester ASC")
    List<String> findDistinctSemesters();
}
