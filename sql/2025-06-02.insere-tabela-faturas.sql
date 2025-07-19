CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    idBankAccount BIGINT,
    name VARCHAR(20),
    closingDate DATE,
    dueDate DATE,
    paymentDate DATE DEFAULT NULL,
    status ENUM('paid', 'pending', 'parcial')
);