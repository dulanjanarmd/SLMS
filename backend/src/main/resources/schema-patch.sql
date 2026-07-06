-- Fix notifications.type column to accept all NotificationType enum values
ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50);
