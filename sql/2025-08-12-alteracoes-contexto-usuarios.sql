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
ALTER TABLE bank_account ADD COLUMN clientId BIGINT NOT NULL;
ALTER TABLE category ADD COLUMN clientId BIGINT NOT NULL;
ALTER TABLE expense ADD COLUMN clientId BIGINT NOT NULL;
ALTER TABLE invoices ADD COLUMN clientId BIGINT NOT NULL;
ALTER TABLE payment ADD COLUMN clientId BIGINT NOT NULL;
ALTER TABLE revenue ADD COLUMN clientId BIGINT NOT NULL;

INSERT INTO clients (clientEmail, clientName, document, address, number, complement, neighborhood, city, state, zipCode) VALUES
('selvaandre99@gmail.com', 'André Saraiva Selva', '04409657054', 'Rua Ernesto Diehl', '63', 'Apto 503', 'Universitário', 'Bento Gonçalves', 'RS', '95705208');

UPDATE user SET clientId = 1, `role` = 'admin' WHERE id in (4, 5);
UPDATE bank_account SET clientId = 1;
UPDATE category SET clientId = 1;
UPDATE expense SET clientId = 1;
UPDATE invoices SET clientId = 1;
UPDATE payment SET clientId = 1;
UPDATE revenue SET clientId = 1;

CREATE INDEX idx_clientId_id ON bank_account (clientId, id);
CREATE INDEX idx_clientId_id ON category (clientId, id);
CREATE INDEX idx_expense_client_date ON expense (clientId, invoiceDueDate);
CREATE INDEX idx_expense_client_invoice ON expense (clientId, idInvoice);
CREATE INDEX idx_payment_client_id ON payment (clientId, id);
CREATE INDEX idx_revenue_client_date ON revenue (clientId, invoiceDueDate);

