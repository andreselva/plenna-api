ALTER TABLE bank_account ADD COLUMN generateInvoice BOOL DEFAULT false;
ALTER TABLE bank_account ADD COLUMN dueDate VARCHAR(2) DEFAULT "";
ALTER TABLE bank_account ADD COLUMN closingDate VARCHAR(2) DEFAULT "";