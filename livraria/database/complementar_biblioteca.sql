-- =====================================================================
-- ESTANTE: COMPLEMENTO SEGURO PARA O BANCO EXISTENTE `biblioteca`
-- Não contém DROP DATABASE, DROP TABLE nem DELETE.
-- Mantém os dados e os objetos de empréstimos da rubrica.
-- Execute o arquivo inteiro no DBeaver (Execute SQL Script).
-- Compatibilidade da tabela categorias baseada no SQL enviado:
-- categorias.id INT (assinado), categorias.nome VARCHAR(80).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS biblioteca
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biblioteca;

-- PARTE 1: tabelas-base da biblioteca (criadas somente se estiverem ausentes).
CREATE TABLE IF NOT EXISTS autores (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categorias (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS livros (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    autor_id INT NULL,
    categoria_id INT NULL,
    quantidade_total INT DEFAULT 1,
    quantidade_disponivel INT DEFAULT 1,
    CONSTRAINT fk_biblioteca_livros_autor FOREIGN KEY (autor_id) REFERENCES autores(id),
    CONSTRAINT fk_biblioteca_livros_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS emprestimos (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    livro_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_prevista_devolucao DATE NOT NULL,
    data_devolucao DATE NULL,
    valor_multa DECIMAL(6,2) DEFAULT 0.00,
    status ENUM('ativo','devolvido','atrasado') DEFAULT 'ativo',
    CONSTRAINT fk_biblioteca_emprestimos_livro FOREIGN KEY (livro_id) REFERENCES livros(id),
    CONSTRAINT fk_biblioteca_emprestimos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PARTE 2: tabelas adicionais exigidas pelas telas Livros, Categorias e Vendas.
-- categoria_id é INT assinado para corresponder a categorias.id do SQL da biblioteca.
CREATE TABLE IF NOT EXISTS produtos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL,
    autor VARCHAR(80) NOT NULL,
    categoria_id INT NOT NULL,
    preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estoque INT NOT NULL DEFAULT 0,
    INDEX idx_estante_produtos_categoria (categoria_id),
    CONSTRAINT fk_estante_produtos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendas (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    produto_id INT UNSIGNED NOT NULL,
    quantidade INT NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    data_venda DATE NOT NULL,
    INDEX idx_estante_vendas_produto (produto_id),
    INDEX idx_estante_vendas_data (data_venda),
    CONSTRAINT fk_estante_vendas_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PARTE 3: recria apenas os objetos deste projeto; tabelas e registros são preservados.
-- Remove primeiro as views/procedures que dependem das funções.
DROP PROCEDURE IF EXISTS sp_listar_emprestimos;
DROP PROCEDURE IF EXISTS sp_listar_vendas;
DROP PROCEDURE IF EXISTS sp_listar_produtos;
DROP VIEW IF EXISTS vw_indicadores_vendas_categoria;
DROP VIEW IF EXISTS vw_indicadores_por_categoria;
DROP VIEW IF EXISTS vw_emprestimos_detalhados;
DROP VIEW IF EXISTS vw_produtos_detalhe;
DROP VIEW IF EXISTS vw_vendas_consolidadas;
DROP TRIGGER IF EXISTS trg_multa_positiva;
DROP TRIGGER IF EXISTS trg_estante_produtos_before_update;
DROP TRIGGER IF EXISTS trg_estante_vendas_before_update;
DROP FUNCTION IF EXISTS fn_dias_atraso;
DROP FUNCTION IF EXISTS fn_total_venda;
DROP FUNCTION IF EXISTS fn_status_estoque;

DELIMITER $$

-- Função da rubrica de biblioteca: calcula dias de atraso.
CREATE FUNCTION fn_dias_atraso(p_prevista DATE, p_devolucao DATE)
RETURNS INT
DETERMINISTIC
BEGIN
    IF p_devolucao IS NULL THEN
        RETURN GREATEST(DATEDIFF(CURDATE(), p_prevista), 0);
    END IF;
    RETURN GREATEST(DATEDIFF(p_devolucao, p_prevista), 0);
END$$

-- Funções do módulo Estante.
CREATE FUNCTION fn_total_venda(p_quantidade INT, p_valor_unitario DECIMAL(10,2))
RETURNS DECIMAL(12,2)
DETERMINISTIC
BEGIN
    RETURN GREATEST(COALESCE(p_quantidade, 0), 0)
         * GREATEST(COALESCE(p_valor_unitario, 0), 0);
END$$

CREATE FUNCTION fn_status_estoque(p_estoque INT)
RETURNS VARCHAR(10)
DETERMINISTIC
BEGIN
    RETURN CASE
        WHEN COALESCE(p_estoque, 0) <= 5 THEN 'critico'
        WHEN p_estoque <= 15 THEN 'baixo'
        ELSE 'normal'
    END;
END$$

-- Trigger da rubrica: multa não permanece negativa após atualização.
CREATE TRIGGER trg_multa_positiva
BEFORE UPDATE ON emprestimos
FOR EACH ROW
BEGIN
    IF NEW.valor_multa < 0 THEN
        SET NEW.valor_multa = ABS(NEW.valor_multa);
    END IF;
END$$

-- Triggers do módulo Estante: preço, estoque e venda não ficam negativos.
CREATE TRIGGER trg_estante_produtos_before_update
BEFORE UPDATE ON produtos
FOR EACH ROW
BEGIN
    SET NEW.preco = ABS(NEW.preco);
    SET NEW.estoque = ABS(NEW.estoque);
END$$

CREATE TRIGGER trg_estante_vendas_before_update
BEFORE UPDATE ON vendas
FOR EACH ROW
BEGIN
    SET NEW.quantidade = ABS(NEW.quantidade);
    SET NEW.valor_unitario = ABS(NEW.valor_unitario);
END$$

DELIMITER ;

-- PARTE 4: views analíticas com CTEs.
CREATE VIEW vw_emprestimos_detalhados AS
WITH base AS (
    SELECT e.id, e.livro_id, e.usuario_id, e.data_prevista_devolucao,
           e.data_devolucao, e.valor_multa, e.status
    FROM emprestimos e
)
SELECT
    b.id,
    l.titulo,
    a.nome AS autor,
    u.nome AS usuario,
    c.nome AS categoria,
    b.data_prevista_devolucao,
    b.valor_multa,
    b.status,
    fn_dias_atraso(b.data_prevista_devolucao, b.data_devolucao) AS dias_atraso
FROM base b
JOIN livros l ON l.id = b.livro_id
JOIN usuarios u ON u.id = b.usuario_id
LEFT JOIN autores a ON a.id = l.autor_id
LEFT JOIN categorias c ON c.id = l.categoria_id;

CREATE VIEW vw_indicadores_por_categoria AS
WITH base AS (
    SELECT e.status, e.valor_multa, l.categoria_id
    FROM emprestimos e
    JOIN livros l ON l.id = e.livro_id
)
SELECT
    c.nome AS categoria,
    COUNT(base.categoria_id) AS total_emprestimos,
    COALESCE(SUM(base.status = 'atrasado'), 0) AS atrasados,
    COALESCE(SUM(base.valor_multa), 0.00) AS total_multas
FROM categorias c
LEFT JOIN base ON base.categoria_id = c.id
GROUP BY c.id, c.nome;

CREATE VIEW vw_vendas_consolidadas AS
WITH vendas_limpas AS (
    SELECT id, produto_id, ABS(quantidade) AS quantidade,
           ABS(valor_unitario) AS valor_unitario, data_venda
    FROM vendas
    WHERE quantidade <> 0
)
SELECT
    vl.id AS venda_id,
    vl.data_venda,
    p.id AS produto_id,
    TRIM(p.titulo) AS produto,
    c.id AS categoria_id,
    TRIM(c.nome) AS categoria,
    vl.quantidade,
    vl.valor_unitario,
    fn_total_venda(vl.quantidade, vl.valor_unitario) AS total
FROM vendas_limpas vl
JOIN produtos p ON p.id = vl.produto_id
JOIN categorias c ON c.id = p.categoria_id;

CREATE VIEW vw_produtos_detalhe AS
WITH desempenho AS (
    SELECT produto_id,
           SUM(ABS(quantidade)) AS unidades_vendidas,
           SUM(fn_total_venda(ABS(quantidade), ABS(valor_unitario))) AS receita
    FROM vendas
    GROUP BY produto_id
)
SELECT
    p.id,
    p.titulo,
    p.autor,
    p.categoria_id,
    c.nome AS categoria,
    p.preco,
    p.estoque,
    fn_status_estoque(p.estoque) AS status_estoque,
    COALESCE(d.unidades_vendidas, 0) AS unidades_vendidas,
    COALESCE(d.receita, 0.00) AS receita
FROM produtos p
JOIN categorias c ON c.id = p.categoria_id
LEFT JOIN desempenho d ON d.produto_id = p.id;

CREATE VIEW vw_indicadores_vendas_categoria AS
WITH base AS (
    SELECT categoria_id, quantidade, total
    FROM vw_vendas_consolidadas
)
SELECT
    c.id AS categoria_id,
    c.nome AS categoria,
    COUNT(base.categoria_id) AS total_vendas,
    COALESCE(SUM(base.quantidade), 0) AS unidades_vendidas,
    COALESCE(SUM(base.total), 0.00) AS faturamento
FROM categorias c
LEFT JOIN base ON base.categoria_id = c.id
GROUP BY c.id, c.nome;

-- PARTE 5: procedures com os parâmetros exatos usados por api/consultas.php.
DELIMITER $$

CREATE PROCEDURE sp_listar_emprestimos(
    IN p_status VARCHAR(20),
    IN p_busca VARCHAR(150),
    IN p_pagina INT,
    IN p_itens INT
)
BEGIN
    DECLARE v_offset INT DEFAULT 0;
    DECLARE v_pagina INT DEFAULT 1;
    DECLARE v_itens INT DEFAULT 10;
    SET v_pagina = GREATEST(COALESCE(p_pagina, 1), 1);
    SET v_itens = LEAST(GREATEST(COALESCE(p_itens, 10), 1), 10000);
    SET v_offset = (v_pagina - 1) * v_itens;

    SELECT *, COUNT(*) OVER () AS total_registros
    FROM vw_emprestimos_detalhados
    WHERE (p_status IS NULL OR status = p_status)
      AND (p_busca IS NULL OR p_busca = '' OR titulo LIKE CONCAT('%', p_busca, '%'))
    ORDER BY dias_atraso DESC
    LIMIT v_itens OFFSET v_offset;
END$$

CREATE PROCEDURE sp_listar_produtos(
    IN p_busca VARCHAR(120),
    IN p_categoria_id INT,
    IN p_pagina INT,
    IN p_por_pagina INT
)
BEGIN
    DECLARE v_pagina INT DEFAULT 1;
    DECLARE v_limite INT DEFAULT 10;
    DECLARE v_deslocamento INT DEFAULT 0;
    SET v_pagina = GREATEST(COALESCE(p_pagina, 1), 1);
    SET v_limite = LEAST(GREATEST(COALESCE(p_por_pagina, 10), 1), 10000);
    SET v_deslocamento = (v_pagina - 1) * v_limite;

    SELECT
        id, titulo, autor, categoria_id, categoria, preco, estoque,
        status_estoque, unidades_vendidas, receita,
        COUNT(*) OVER () AS total_registros
    FROM vw_produtos_detalhe
    WHERE (p_busca IS NULL OR p_busca = ''
           OR titulo LIKE CONCAT('%', p_busca, '%')
           OR autor LIKE CONCAT('%', p_busca, '%'))
      AND (p_categoria_id IS NULL OR p_categoria_id = 0 OR categoria_id = p_categoria_id)
    ORDER BY titulo
    LIMIT v_limite OFFSET v_deslocamento;
END$$

CREATE PROCEDURE sp_listar_vendas(
    IN p_busca VARCHAR(120),
    IN p_categoria_id INT,
    IN p_data_inicio DATE,
    IN p_data_fim DATE,
    IN p_pagina INT,
    IN p_por_pagina INT
)
BEGIN
    DECLARE v_pagina INT DEFAULT 1;
    DECLARE v_limite INT DEFAULT 10;
    DECLARE v_deslocamento INT DEFAULT 0;
    SET v_pagina = GREATEST(COALESCE(p_pagina, 1), 1);
    SET v_limite = LEAST(GREATEST(COALESCE(p_por_pagina, 10), 1), 10000);
    SET v_deslocamento = (v_pagina - 1) * v_limite;

    SELECT
        venda_id, data_venda, produto_id, produto, categoria_id, categoria,
        quantidade, valor_unitario, total,
        COUNT(*) OVER () AS total_registros
    FROM vw_vendas_consolidadas
    WHERE (p_busca IS NULL OR p_busca = '' OR produto LIKE CONCAT('%', p_busca, '%'))
      AND (p_categoria_id IS NULL OR p_categoria_id = 0 OR categoria_id = p_categoria_id)
      AND (p_data_inicio IS NULL OR data_venda >= p_data_inicio)
      AND (p_data_fim IS NULL OR data_venda <= p_data_fim)
    ORDER BY data_venda DESC, venda_id DESC
    LIMIT v_limite OFFSET v_deslocamento;
END$$

DELIMITER ;

-- VERIFICAÇÃO FINAL
SELECT DATABASE() AS banco_atual;
SHOW TABLES;
SHOW PROCEDURE STATUS WHERE Db = 'biblioteca';
