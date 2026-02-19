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

CREATE TABLE user_modules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    userId BIGINT NOT NULL,
    clientId BIGINT NOT NULL,
    moduleId BIGINT NOT NULL
);

INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 4, 1);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 4, 2);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 4, 3);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 4, 4);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 4, 5);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 4, 6);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 4, 7);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 4, 8);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 4, 9);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 4, 10);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 4, 11);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 4, 12);

INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 5, 1);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 5, 2);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 5, 3);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 5, 4);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 5, 5);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 5, 6);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 5, 7);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 5, 8);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 5, 9);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 5, 10);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 5, 11);
INSERT INTO user_modules (clientId, userId, moduleId) VALUES (1, 5, 12);

ALTER TABLE client_modules DROP COLUMN userId;

DELETE FROM client_modules WHERE id = '13' AND clientId = 1;
DELETE FROM client_modules WHERE id = '14' AND clientId = 1;
DELETE FROM client_modules WHERE id = '15' AND clientId = 1;
DELETE FROM client_modules WHERE id = '16' AND clientId = 1;
DELETE FROM client_modules WHERE id = '17' AND clientId = 1;
DELETE FROM client_modules WHERE id = '18' AND clientId = 1;
DELETE FROM client_modules WHERE id = '19' AND clientId = 1;
DELETE FROM client_modules WHERE id = '20' AND clientId = 1;
DELETE FROM client_modules WHERE id = '21' AND clientId = 1;
DELETE FROM client_modules WHERE id = '22' AND clientId = 1;
DELETE FROM client_modules WHERE id = '23' AND clientId = 1;
DELETE FROM client_modules WHERE id = '24' AND clientId = 1;

UPDATE modules SET displayName = 'Agendamentos' WHERE (id = '11');
UPDATE modules SET displayName = 'Usuários' WHERE (id = '10');
UPDATE modules SET displayName = 'Relatórios' WHERE (id = '9');
UPDATE modules SET displayName = 'Faturas' WHERE (id = '8');
UPDATE modules SET displayName = 'Contas bancárias' WHERE (id = '7');
UPDATE modules SET displayName = 'Receitas' WHERE (id = '6');
UPDATE modules SET displayName = 'Despesas' WHERE (id = '5');
UPDATE modules SET displayName = 'Financeiro' WHERE (id = '4');
UPDATE modules SET displayName = 'Subcategorias' WHERE (id = '3');
UPDATE modules SET displayName = 'Categorias' WHERE (id = '2');
UPDATE modules SET displayName = 'Dashboards' WHERE (id = '1');
