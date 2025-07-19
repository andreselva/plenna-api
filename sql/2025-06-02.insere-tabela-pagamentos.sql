CREATE TABLE payment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_invoice BIGINT DEFAULT NULL,
    id_expense BIGINT DEFAULT NULL,
    value DECIMAL(10 , 2 ),
    payment_date DATE DEFAULT NULL
)