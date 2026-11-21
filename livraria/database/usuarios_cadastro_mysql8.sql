-- Versão para MySQL 8 (Docker): o MySQL não aceita ADD COLUMN IF NOT EXISTS.
-- Roda uma única vez, na criação do banco. Para o XAMPP/MariaDB use usuarios_cadastro.sql.
USE biblioteca;

ALTER TABLE usuarios
    ADD COLUMN cpf CHAR(11) NULL,
    ADD COLUMN senha VARCHAR(255) NULL,
    ADD UNIQUE INDEX uq_usuarios_cpf (cpf);
