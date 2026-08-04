package com.sliit.library.service;

import com.sliit.library.dto.NotificationResponse;
import com.sliit.library.entity.*;
import com.sliit.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void sendNotification(User user, NotificationType type, String title, String message) {
        sendNotification(user, type, title, message, null, null);
    }

    @Transactional
    public void sendNotification(User user, NotificationType type, String title, String message,
                                  String relatedEntityType, Long relatedEntityId) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToNotificationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId).stream()
                .map(this::mapToNotificationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public int sendBroadcastNotification(String title, String message, Role targetRole) {
        List<User> targetUsers;
        if (targetRole != null) {
            targetUsers = userRepository.findByRole(targetRole);
        } else {
            targetUsers = userRepository.findAll();
        }

        for (User u : targetUsers) {
            sendNotification(u, NotificationType.ANNOUNCEMENT, title, message);
        }

        return targetUsers.size();
    }

    @Transactional
    public void sendDirectNotification(Long userId, String title, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        sendNotification(user, NotificationType.PERSONAL_MESSAGE, title, message);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getRecentAnnouncements() {
        List<Notification> all = notificationRepository.findByTypeOrderByCreatedAtDesc(NotificationType.ANNOUNCEMENT);
        java.util.Map<String, Notification> unique = new java.util.LinkedHashMap<>();
        for (Notification n : all) {
            String key = (n.getTitle() != null ? n.getTitle() : "") + "::" + (n.getMessage() != null ? n.getMessage() : "");
            if (!unique.containsKey(key)) {
                unique.put(key, n);
            }
        }
        return unique.values().stream()
                .limit(10)
                .map(this::mapToNotificationResponse)
                .toList();
    }

    @Transactional
    public void clearAllAnnouncements() {
        notificationRepository.deleteByType(NotificationType.ANNOUNCEMENT);
    }

    private NotificationResponse mapToNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .relatedEntityType(notification.getRelatedEntityType())
                .relatedEntityId(notification.getRelatedEntityId())
                .sentAt(notification.getSentAt())
                .build();
    }
}
