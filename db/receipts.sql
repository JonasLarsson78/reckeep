-- Skapa tabell för kvitton
CREATE TABLE receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_blob LONGBLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
