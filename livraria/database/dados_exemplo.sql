-- Dados de exemplo para o painel não abrir vazio (carregado só no Docker, na primeira subida).
USE biblioteca;

INSERT INTO categorias (nome) VALUES ('Romance'), ('Ficção científica'), ('Fantasia'), ('Técnicos'), ('Biografias');

INSERT INTO autores (nome) VALUES ('Machado de Assis'), ('Clarice Lispector'), ('Isaac Asimov'), ('J. R. R. Tolkien'), ('Robert C. Martin');

INSERT INTO produtos (titulo, autor, categoria_id, preco, estoque) VALUES
  ('Dom Casmurro', 'Machado de Assis', 1, 39.90, 12),
  ('A Hora da Estrela', 'Clarice Lispector', 1, 34.50, 3),
  ('Fundação', 'Isaac Asimov', 2, 59.90, 8),
  ('Eu, Robô', 'Isaac Asimov', 2, 49.90, 2),
  ('O Senhor dos Anéis', 'J. R. R. Tolkien', 3, 89.90, 15),
  ('Código Limpo', 'Robert C. Martin', 4, 99.00, 5);

INSERT INTO vendas (produto_id, quantidade, valor_unitario, data_venda) VALUES
  (1, 2, 39.90, CURDATE() - INTERVAL 20 DAY),
  (3, 1, 59.90, CURDATE() - INTERVAL 15 DAY),
  (5, 3, 89.90, CURDATE() - INTERVAL 12 DAY),
  (6, 1, 99.00, CURDATE() - INTERVAL 8 DAY),
  (2, 2, 34.50, CURDATE() - INTERVAL 5 DAY),
  (4, 1, 49.90, CURDATE() - INTERVAL 3 DAY),
  (5, 2, 89.90, CURDATE() - INTERVAL 1 DAY);
