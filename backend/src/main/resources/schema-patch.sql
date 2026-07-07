-- Fix notifications.type column to accept all NotificationType enum values
ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50);

-- Add non_renewable column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS non_renewable TINYINT(1) DEFAULT 0;

-- Extend borrow_records status to include RENEWAL_REQUESTED
ALTER TABLE borrow_records MODIFY COLUMN status VARCHAR(30);
