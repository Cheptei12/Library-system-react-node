-- Add missing columns to the books table if not already added
ALTER TABLE books 
ADD COLUMN author VARCHAR(255) NULL,
ADD COLUMN genre VARCHAR(100) NULL,
ADD COLUMN isbn VARCHAR(50) NULL,
ADD COLUMN language VARCHAR(50) NULL,
ADD COLUMN edition VARCHAR(50) NULL,
ADD COLUMN publisher VARCHAR(255) NULL,
ADD COLUMN publication_year INT NULL,
ADD COLUMN call_number VARCHAR(50) NULL,
ADD COLUMN keywords TEXT NULL,
ADD COLUMN description TEXT NULL,
ADD COLUMN location VARCHAR(255) NULL,
ADD COLUMN availability ENUM('Available', 'Checked Out') DEFAULT 'Available',
ADD COLUMN circulation_type ENUM('Loanable', 'Reference Only') DEFAULT 'Loanable',
ADD COLUMN cover_image VARCHAR(255) NULL;

-- Create the book_copies table if it does not exist
CREATE TABLE IF NOT EXISTS book_copies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    copy_number INT NOT NULL,
    status ENUM('Available', 'Checked Out', 'Lost', 'Damaged') DEFAULT 'Available',
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
