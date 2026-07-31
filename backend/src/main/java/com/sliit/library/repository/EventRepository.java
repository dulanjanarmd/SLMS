package com.sliit.library.repository;

import com.sliit.library.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByOrderByEventDateAscStartTimeAsc();

    List<Event> findByIsActiveTrueOrderByEventDateAscStartTimeAsc();

    List<Event> findByIsActiveTrueAndIsPublicTrueOrderByEventDateAscStartTimeAsc();

    @Query("SELECT e FROM Event e WHERE e.isActive = true AND e.eventDate >= :today ORDER BY e.eventDate ASC, e.startTime ASC")
    List<Event> findUpcoming(LocalDate today);

    @Query("SELECT e FROM Event e WHERE e.isActive = true AND e.isPublic = true AND e.eventDate >= :today ORDER BY e.eventDate ASC, e.startTime ASC")
    List<Event> findPublicUpcoming(LocalDate today);

    List<Event> findByCategoryAndIsActiveTrue(String category);

    List<Event> findByEventDateBetweenAndIsActiveTrueOrderByEventDateAsc(LocalDate start, LocalDate end);
}
