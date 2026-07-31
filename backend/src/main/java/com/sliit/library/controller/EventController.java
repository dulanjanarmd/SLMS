package com.sliit.library.controller;

import com.sliit.library.dto.EventResponse;
import com.sliit.library.entity.Event;
import com.sliit.library.security.UserDetailsImpl;
import com.sliit.library.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class EventController {

    @Autowired
    private EventService eventService;

    private Long extractUserId(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) auth.getPrincipal()).getId();
        }
        return null;
    }

    @GetMapping("/events/public")
    public ResponseEntity<List<EventResponse>> getPublicUpcomingEvents() {
        return ResponseEntity.ok(eventService.getPublicUpcoming());
    }

    @GetMapping("/events/public/all")
    public ResponseEntity<List<EventResponse>> getAllPublicEvents() {
        return ResponseEntity.ok(eventService.getAllActive());
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<EventResponse> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getById(id));
    }

    @GetMapping("/librarian/events")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAll());
    }

    @GetMapping("/admin/events")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EventResponse>> getAllEventsAdmin() {
        return ResponseEntity.ok(eventService.getAll());
    }

    @GetMapping("/librarian/events/upcoming")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<EventResponse>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcoming());
    }

    @GetMapping("/admin/events/upcoming")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EventResponse>> getUpcomingEventsAdmin() {
        return ResponseEntity.ok(eventService.getUpcoming());
    }

    @PostMapping("/librarian/events")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<EventResponse> createEvent(@RequestBody Event event, Authentication auth) {
        Long uid = extractUserId(auth);
        return ResponseEntity.ok(eventService.create(event, uid));
    }

    @PostMapping("/admin/events")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> createEventAdmin(@RequestBody Event event, Authentication auth) {
        Long uid = extractUserId(auth);
        return ResponseEntity.ok(eventService.create(event, uid));
    }

    @PutMapping("/librarian/events/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        return ResponseEntity.ok(eventService.update(id, event));
    }

    @PutMapping("/admin/events/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> updateEventAdmin(@PathVariable Long id, @RequestBody Event event) {
        return ResponseEntity.ok(eventService.update(id, event));
    }

    @PatchMapping("/librarian/events/{id}/toggle")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<EventResponse> toggleEventActive(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.toggleActive(id));
    }

    @PatchMapping("/admin/events/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> toggleEventActiveAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.toggleActive(id));
    }

    @DeleteMapping("/librarian/events/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/admin/events/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteEventAdmin(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok().build();
    }
}
