-- Ensure books table exists before referencing it
CREATE TABLE IF NOT EXISTS books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) UNIQUE NOT NULL,
    language VARCHAR(50) NOT NULL,
    edition VARCHAR(50),
    publisher VARCHAR(255),
    publication_year YEAR,
    call_number VARCHAR(50) UNIQUE NOT NULL,
    keywords TEXT,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    availability ENUM('Available', 'Borrowed', 'Reserved') DEFAULT 'Available',
    circulation_type ENUM('Loanable', 'Reference Only') DEFAULT 'Loanable',
    cover_image VARCHAR(255), -- Path to cover image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to manage multiple copies of the same book
CREATE TABLE IF NOT EXISTS book_copies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    copy_number INT NOT NULL,
    status ENUM('Available', 'Borrowed', 'Reserved') DEFAULT 'Available',
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Ensure students table exists before referencing it
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reg_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255) NOT NULL
);

-- Ensure users table exists before referencing it
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL, -- Added name column
    email VARCHAR(255) UNIQUE NULL, -- Added email for login
    password VARCHAR(255) NULL, -- Added password for authentication
    role ENUM('super_admin', 'librarian') NOT NULL
);

-- Table for Super Admins
CREATE TABLE IF NOT EXISTS super_admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Store hashed password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Borrowed books table (Circulation tracking)
CREATE TABLE IF NOT EXISTS borrowed_books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    isbn VARCHAR(50) NOT NULL,
    reg_number VARCHAR(50) NOT NULL,
    librarian_id INT NOT NULL,
    borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME NOT NULL,
    returned_at DATETIME DEFAULT NULL,
    status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
    fine_amount DECIMAL(10,2) DEFAULT 0.00,

    CONSTRAINT fk_borrowed_books_book FOREIGN KEY (isbn) 
        REFERENCES books(isbn) ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_borrowed_books_student FOREIGN KEY (reg_number) 
        REFERENCES students(reg_number) ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_borrowed_books_librarian FOREIGN KEY (librarian_id) 
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- Fines table for tracking overdue fines
CREATE TABLE IF NOT EXISTS fines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_status ENUM('pending', 'paid') DEFAULT 'pending',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);


CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES super_admins(id) ON DELETE CASCADE
);


