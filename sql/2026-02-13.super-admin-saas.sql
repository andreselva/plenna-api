ALTER TABLE clients
ADD COLUMN isSystem TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN status ENUM('active','suspended') NOT NULL DEFAULT 'active',
ADD COLUMN trialEndsAt DATETIME NULL;

INSERT INTO clients (clientName, clientEmail, isSystem)
VALUES ('__PLENNA_SAAS__', 'plenna.finance@gmail.com', 1);

ALTER TABLE `user` MODIFY COLUMN `role` ENUM('admin', 'normal-user', 'super-admin', 'support') NOT NULL;

INSERT INTO user (username, email, password, role, clientId, name)
SELECT
  'superadmin',
  'plenna.finance@gmail.com',
  '$2b$10$6UW4fXx2TqH8MK6QyMVL5.etLEQ1GeTS4t.CK.H2Me58mWCgXcB6K',
  'super-admin',
   c.id,
  'PLENNA SAAS'
FROM clients c
WHERE c.clientName = '__PLENNA_SAAS__' AND c.isSystem = 1
LIMIT 1;

CREATE INDEX idx_cm_client_module ON client_modules (clientId, moduleId);