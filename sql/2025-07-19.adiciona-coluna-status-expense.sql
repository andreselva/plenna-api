ALTER TABLE expense ADD COLUMN `status` ENUM('paid', 'partial', 'pending', 'cancelled');
ALTER TABLE expense RENAME COLUMN typeOfInstallments TO typeOfInstallment;