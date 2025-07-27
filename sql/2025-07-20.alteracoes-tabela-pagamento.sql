ALTER TABLE payment DROP COLUMN id_invoice;
ALTER TABLE payment DROP COLUMN id_expense;
ALTER TABLE payment ADD COLUMN payable_id BIGINT NOT NULL;
ALTER TABLE payment ADD COLUMN payable_type VARCHAR(20);
