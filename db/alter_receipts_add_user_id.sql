-- Lägg till user_id i receipts-tabellen om den saknas
ALTER TABLE receipts ADD COLUMN user_id INT NOT NULL DEFAULT 1;
ALTER TABLE receipts ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);
