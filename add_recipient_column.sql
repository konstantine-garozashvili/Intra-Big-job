-- Add recipient_id column to message table
ALTER TABLE message ADD COLUMN recipient_id INT DEFAULT NULL;
ALTER TABLE message ADD CONSTRAINT FK_B6BD307FE92F8F78 FOREIGN KEY (recipient_id) REFERENCES user (id);
CREATE INDEX IDX_B6BD307FE92F8F78 ON message (recipient_id);
