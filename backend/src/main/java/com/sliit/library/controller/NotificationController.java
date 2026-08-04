package com.sliit.library.controller;

import com.sliit.library.dto.NotificationResponse;
import com.sliit.library.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/notifications/user/{userId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/notifications/user/{userId}/unread")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @GetMapping("/notifications/user/{userId}/unread-count")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PutMapping("/notifications/{id}/read")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/notifications/user/{userId}/read-all")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/notifications/broadcast")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<?> sendBroadcast(
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam(required = false) com.sliit.library.entity.Role targetRole) {
        int count = notificationService.sendBroadcastNotification(title, message, targetRole);
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Broadcast announcement sent successfully.",
                "recipientCount", count
        ));
    }

    @PostMapping("/admin/notifications/send-user")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<?> sendDirectToUser(
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam String message) {
        notificationService.sendDirectNotification(userId, title, message);
        return ResponseEntity.ok(java.util.Map.of("message", "Direct notification sent to user."));
    }

    @GetMapping("/notifications/announcements/public")
    public ResponseEntity<List<NotificationResponse>> getPublicAnnouncements() {
        return ResponseEntity.ok(notificationService.getRecentAnnouncements());
    }

    @DeleteMapping("/admin/notifications/clear-announcements")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<?> clearAllAnnouncements() {
        notificationService.clearAllAnnouncements();
        return ResponseEntity.ok(java.util.Map.of("message", "All announcements cleared."));
    }

    @DeleteMapping("/admin/notifications/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id) {
        notificationService.deleteAnnouncement(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Announcement deleted."));
    }

    @PutMapping("/admin/notifications/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<?> updateAnnouncement(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String message) {
        notificationService.updateAnnouncement(id, title, message);
        return ResponseEntity.ok(java.util.Map.of("message", "Announcement updated."));
    }
}
