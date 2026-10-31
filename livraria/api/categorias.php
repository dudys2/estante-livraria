<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

function validarNome(array $dados, int $ignorarId = 0): string
{
    $nome = trim((string) ($dados['nome'] ?? ''));

    if ($nome === '' || mb_strlen($nome) > 60) {
        falhar('Informe o nome da categoria com até 60 caracteres.');
    }
    if (escalar('SELECT COUNT(*) FROM categorias WHERE nome = ? AND id <> ?', [$nome, $ignorarId]) > 0) {
        falhar('Já existe uma categoria com este nome.', 409);
    }

    return $nome;
}

function criar(): void
{
    $nome = validarNome(entrada());
    executar('INSERT INTO categorias (nome) VALUES (?)', [$nome]);

    responder([
        'sucesso' => true,
        'mensagem' => 'Categoria cadastrada com sucesso.',
        'id' => (int) conectar()->lastInsertId(),
    ], 201);
}

function editar(): void
{
    $id = idDaRequisicao();
    $nome = validarNome(entrada(), $id);

    if (executar('UPDATE categorias SET nome = ? WHERE id = ?', [$nome, $id]) === 0) {
        falhar('Categoria não encontrada.', 404);
    }

    responder(['sucesso' => true, 'mensagem' => 'Categoria atualizada com sucesso.']);
}

function excluir(): void
{
    $id = idDaRequisicao();
    $livros = escalar('SELECT COUNT(*) FROM produtos WHERE categoria_id = ?', [$id]);

    if ($livros > 0) {
        falhar("Não foi possível excluir: a categoria possui {$livros} livro(s) cadastrado(s). Mova ou remova os livros antes de excluí-la.", 409);
    }
    if (executar('DELETE FROM categorias WHERE id = ?', [$id]) === 0) {
        falhar('Categoria não encontrada.', 404);
    }

    responder(['sucesso' => true, 'mensagem' => 'Categoria excluída com sucesso.']);
}

match ($_SERVER['REQUEST_METHOD']) {
    'GET' => responder(['dados' => listarCategorias()]),
    'POST' => criar(),
    'PUT' => editar(),
    'DELETE' => excluir(),
    default => falhar('Método não permitido.', 405),
};
