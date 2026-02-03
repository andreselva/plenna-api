CREATE TABLE modules (
	id BIGINT auto_increment PRIMARY KEY,
    parentId BIGINT DEFAULT 0,
    name VARCHAR(50) NOT NULL,
    location VARCHAR(50),
    description VARCHAR(120),
    showInSidebar BOOLEAN DEFAULT true
);

UPDATE modules SET showInSidebar = 0 WHERE id IN (3, 10, 11, 12);

CREATE TABLE client_modules (
	id BIGINT auto_increment PRIMARY KEY,
    clientId BIGINT NOT NULL,
    userId BIGINT DEFAULT 0,
    moduleId BIGINT NOT NULL
);

INSERT INTO modules (name, location, description) VALUES ('dashboards', '/dashboard', 'Dashboard geral');
INSERT INTO modules (name, location, description) VALUES ('categories', '/categories', 'Categorias de receitas e despesas');
INSERT INTO modules (parentId, name, description) VALUES (2, 'subcategories', 'Subcategorias de receitas e despesas');
INSERT INTO modules (name, description) VALUES ('financial', 'Gerenciamento de receitas e despesas');
INSERT INTO modules (parentId, name, location, description) VALUES (4, 'expenses', '/expenses', 'Gerenciamento de despesas');
INSERT INTO modules (parentId, name, location, description) VALUES (4, 'revenues', '/revenues', 'Gerenciamento de receitas');
INSERT INTO modules (parentId, name, location, description) VALUES (4, 'bankAccounts', '/bank-accounts', 'Gerenciamento das contas bancárias e faturas');
INSERT INTO modules (parentId, name, location, description) VALUES (4, 'invoices', '/invoices', 'Listagem e gerenciamento de faturas');
INSERT INTO modules (name, location, description) VALUES ('reports', '/reports', 'Visualização de relatórios');
INSERT INTO modules (name, location, description) VALUES ('users', '/users', 'Listagem e gerenciamento de usuários');
INSERT INTO modules (name, location, description) VALUES ('appointments', '/appointments', 'Listagem e gerenciamento de agendamentos');
INSERT INTO modules (parentId, name, location, description) VALUES (9, 'financial-summary', '/reports/financial-summary', 'Relatório de resumo financeiro');

CREATE TABLE report_classifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(200)
);

INSERT INTO report_classifications (name, description) VALUES ('Inteligência Artificial', 'Relatórios que utilizam IA na geração.'); 

CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    moduleId BIGINT NOT NULL,
    classificationId BIGINT NULL,
    name VARCHAR(60) NOT NULL,
    description VARCHAR(200),
    route VARCHAR(100) NOT NULL,
    active TINYINT(1) DEFAULT 1
);

INSERT INTO reports (moduleId, classificationId, name, description, route) VALUES (12, 1, 'Resumo financeiro', 'Gera um resumo financeiro do presente, passado e futuro', 'IA');

INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 4, 1);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 4, 2);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 4, 3);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 4, 4);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 4, 5);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 4, 6);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 4, 7);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 4, 8);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 4, 9);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 4, 10);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 4, 11);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 4, 12);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 5, 1);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 5, 2);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 5, 3);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 5, 4);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 5, 5);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 5, 6);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 5, 7);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 5, 8);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 5, 9);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 5, 10);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 5, 11);
INSERT INTO client_modules (clientId, userId, moduleId) VALUES (1, 5, 12);