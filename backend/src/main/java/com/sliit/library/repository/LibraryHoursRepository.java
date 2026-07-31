package com.sliit.library.repository;

import com.sliit.library.entity.LibraryHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LibraryHoursRepository extends JpaRepository<LibraryHours, Long> {
    Optional<LibraryHours> findByDayOfWeek(String dayOfWeek);
}
