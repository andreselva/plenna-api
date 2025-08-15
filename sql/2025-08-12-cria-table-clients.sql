CREATE TABLE clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clientEmail VARCHAR(50),
    clientName VARCHAR(50),
    document VARCHAR(30),
    address VARCHAR(120),
    number VARCHAR(15),
    complement VARCHAR(50),
    neighborhood VARCHAR(50),
    city VARCHAR(50),
    state VARCHAR(5)
);