<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

function validar(array $dados): array
{
    $titulo = trim((string) ($dados['titulo'] ?? ''));
    $autor = trim((string) ($dados['autor'] ?? ''));
    $categoriaId = filter_var($dados['categoria_id'] ?? null, FILTER_VALIDATE_INT);
    $preco = filter_var($dados['preco'] ?? null, FILTER_VALIDATE_FLOAT);
    $estoque = filter_var($dados['estoque'] ?? null, FILTER_VALIDATE_INT);

    if ($titulo === '' || mb_strlen($titulo) > 120) {
        falhar('Informe o título do livro com até 120 caracteres.');
    }
    if ($autor === '' || mb_strlen($autor) > 80) {
        falhar('Informe o autor com até 80 caracteres.');
    }
    if ($categoriaId === false || escalar('SELECT COUNT(*) FROM categorias WHERE id = ?', [$categoriaId]) === 0) {
        falhar('Selecione uma categoria válida.');
    }
    if ($preco === false || $preco <= 0) {
        falhar('Informe um preço maior que zero.');
    }
    if ($estoque === false || $estoque < 0) {
        falhar('Informe um estoque inteiro, igual ou maior que zero.');
    }

    return [$titulo, $autor, $categoriaId, round($preco, 2), $estoque];
}

function listar(): void
{
    [$pagina, $porPagina] = parametrosPaginacao();

    responder(listarProdutos(
        textoOuNulo($_GET['busca'] ?? ''),
        (int) ($_GET['categoria_id'] ?? 0),
        $pagina,
        $porPagina
    ));
}

function criar(): void
{
    $campos = validar(entrada());
    executar('INSERT INTO produtos (titulo, autor, categoria_id, preco, estoque) VALUES (?, ?, ?, ?, ?)', $campos);

    responder([
        'sucesso' => true,
        'mensagem' => 'Livro cadastrado com sucesso.',
        'id' => (int) conectar()->lastInsertId(),
    ], 201);
}

function editar(): void
{
    $id = idDaRequisicao();
    $campos = validar(entrada());
    $campos[] = $id;

    $alterados = executar(
        'UPDATE produtos SET titulo = ?, autor = ?, categoria_id = ?, preco = ?, estoque = ? WHERE id = ?',
        $campos
    );
    if ($alterados === 0) {
        falhar('Livro não encontrado.', 404);
    }

    responder(['sucesso' => true, 'mensagem' => 'Livro atualizado com sucesso.']);
}

function excluir(): void
{
    $id = idDaRequisicao();
    $vendas = escalar('SELECT COUNT(*) FROM vendas WHERE produto_id = ?', [$id]);

    if ($vendas > 0) {
        falhar("Não foi possível excluir: o livro possui {$vendas} venda(s) registrada(s). Exclua as vendas antes de remover o livro.", 409);
    }
    if (executar('DELETE FROM produtos WHERE id = ?', [$id]) === 0) {
        falhar('Livro não encontrado.', 404);
    }

    responder(['sucesso' => true, 'mensagem' => 'Livro excluído com sucesso.']);
}

match ($_SERVER['REQUEST_METHOD']) {
    'GET' => listar(),
    'POST' => criar(),
    'PUT' => editar(),
    'DELETE' => excluir(),
    default => falhar('Método não permitido.', 405),
};
