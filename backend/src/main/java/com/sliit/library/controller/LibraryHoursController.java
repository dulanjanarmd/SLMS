package com.sliit.library.controller;

import com.sliit.library.entity.LibraryHours;
import com.sliit.library.service.LibraryHoursService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LibraryHoursController {

    @Autowired
    private LibraryHoursService libraryHoursService;

    @GetMapping("/library-hours")
    public ResponseEntity<List<LibraryHours>> getAllLibraryHours() {
        return ResponseEntity.ok(libraryHoursService.getAll());
    }

    @GetMapping("/library-hours/{id}")
    public ResponseEntity<LibraryHours> getLibraryHoursById(@PathVariable Long id) {
        LibraryHours hours = libraryHoursService.getById(id);
        if (hours == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(hours);
    }

    @GetMapping("/library-hours/day/{day}")
    public ResponseEntity<LibraryHours> getLibraryHoursByDay(@PathVariable String day) {
        LibraryHours hours = libraryHoursService.getByDayOfWeek(day);
        if (hours == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(hours);
    }

    @PostMapping("/librarian/library-hours")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<LibraryHours> createLibraryHours(@RequestBody LibraryHours libraryHours) {
        return ResponseEntity.ok(libraryHoursService.create(libraryHours));
    }

    @PutMapping("/librarian/library-hours/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<LibraryHours> updateLibraryHours(@PathVariable Long id, @RequestBody LibraryHours libraryHours) {
        LibraryHours updated = libraryHoursService.update(id, libraryHours);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/librarian/library-hours/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<?> deleteLibraryHours(@PathVariable Long id) {
        libraryHoursService.delete(id);
        return ResponseEntity.ok().build();
    }
}
