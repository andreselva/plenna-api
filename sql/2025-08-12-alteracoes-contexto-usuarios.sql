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
    state VARCHAR(5),
    zipCode VARCHAR(15)
);

ALTER TABLE user ADD COLUMN clientId BIGINT NOT NULL;
ALTER TABLE user ADD COLUMN `role` ENUM('admin', 'normal-user');

INSERT INTO clients (clientEmail, clientName, document, address, number, complement, neighborhood, city, state, zipCode) VALUES
('selvaandre99@gmail.com', 'André Saraiva Selva', '04409657054', 'Rua Ernesto Diehl', '63', 'Apto 503', 'Universitário', 'Bento Gonçalves', 'RS', '95705208');

UPDATE user SET clientId = 1, `role` = 'admin' WHERE id in (4, 5);