ALTER TABLE category ADD COLUMN parentId BIGINT DEFAULT 0;
ALTER TABLE category ADD COLUMN kind ENUM('C', 'S') DEFAULT 'C';

CREATE INDEX idx_clientId_kind_parentId
ON category (clientId, kind, parentId);