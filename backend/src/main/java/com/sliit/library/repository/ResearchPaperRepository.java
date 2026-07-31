package com.sliit.library.repository;

import com.sliit.library.entity.ResearchPaper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResearchPaperRepository extends JpaRepository<ResearchPaper, Long> {

    List<ResearchPaper> findByIsPublicTrueOrderByUploadedAtDesc();

    @Query("SELECT r FROM ResearchPaper r WHERE r.isPublic = true AND (" +
           "LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.keywords) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.researchField) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ResearchPaper> searchPapers(@Param("keyword") String keyword, Pageable pageable);
}
