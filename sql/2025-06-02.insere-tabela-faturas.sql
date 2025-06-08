CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    idBankAccount BIGINT,
    name VARCHAR(20),
    closingDate DATE,
    dueDate DATE,
    status VARCHAR(20)
);