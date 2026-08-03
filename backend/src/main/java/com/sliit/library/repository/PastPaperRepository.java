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
           "AND (:semester IS NULL OR p.semester = :semester) " +
           "AND (:degreeLevel IS NULL OR p.degreeLevel = :degreeLevel) " +
           "AND (:faculty IS NULL OR p.faculty = :faculty) " +
           "AND (:intakeBatch IS NULL OR p.intakeBatch = :intakeBatch)")
    List<PastPaper> filter(@Param("year") String year, @Param("semester") String semester, 
                          @Param("degreeLevel") String degreeLevel, @Param("faculty") String faculty, 
                          @Param("intakeBatch") String intakeBatch);

    @Query("SELECT DISTINCT p.academicYear FROM PastPaper p WHERE p.isPublic = true ORDER BY p.academicYear DESC")
    List<String> findDistinctYears();

    @Query("SELECT DISTINCT p.semester FROM PastPaper p WHERE p.isPublic = true ORDER BY p.semester ASC")
    List<String> findDistinctSemesters();

    @Query("SELECT DISTINCT p.degreeLevel FROM PastPaper p WHERE p.isPublic = true ORDER BY p.degreeLevel ASC")
    List<String> findDistinctDegreeLevels();

    @Query("SELECT DISTINCT p.faculty FROM PastPaper p WHERE p.isPublic = true ORDER BY p.faculty ASC")
    List<String> findDistinctFaculties();

    @Query("SELECT DISTINCT p.intakeBatch FROM PastPaper p WHERE p.isPublic = true ORDER BY p.intakeBatch DESC")
    List<String> findDistinctIntakeBatches();
}
