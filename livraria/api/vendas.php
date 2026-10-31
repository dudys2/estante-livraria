<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

function validar(array $dados): array
{
    $produtoId = filter_var($dados['produto_id'] ?? null, FILTER_VALIDATE_INT);
    $quantidade = filter_var($dados['quantidade'] ?? null, FILTER_VALIDATE_INT);
    $data = (string) ($dados['data_venda'] ?? '');

    if ($produtoId === false || $produtoId < 1) {
        falhar('Selecione o livro vendido.');
    }
    if ($quantidade === false || $quantidade < 1) {
        falhar('Informe uma quantidade inteira maior que zero.');
    }
    if (!dataValida($data)) {
        falhar('Informe uma data de venda válida.');
    }

    return [$produtoId, $quantidade, $data];
}

function reservarEstoque(PDO $pdo, int $produtoId, int $quantidade): float
{
    $comando = $pdo->prepare('SELECT preco, estoque FROM produtos WHERE id = ? FOR UPDATE');
    $comando->execute([$produtoId]);
    $produto = $comando->fetch();

    if ($produto === false) {
        falhar('Livro não encontrado.', 404);
    }
    if ((int) $produto['estoque'] < $quantidade) {
        falhar("Estoque insuficiente. Disponível: {$produto['estoque']} unidade(s).");
    }

    $pdo->prepare('UPDATE produtos SET estoque = estoque - ? WHERE id = ?')->execute([$quantidade, $produtoId]);

    return (float) $produto['preco'];
}

function devolverEstoque(PDO $pdo, int $produtoId, int $quantidade): void
{
    $pdo->prepare('UPDATE produtos SET estoque = estoque + ? WHERE id = ?')->execute([$quantidade, $produtoId]);
}

function buscarVenda(PDO $pdo, int $id): array
{
    $comando = $pdo->prepare('SELECT produto_id, quantidade, valor_unitario FROM vendas WHERE id = ? FOR UPDATE');
    $comando->execute([$id]);
    $venda = $comando->fetch();

    if ($venda === false) {
        falhar('Venda não encontrada.', 404);
    }

    return $venda;
}

function emTransacao(callable $operacao): mixed
{
    $pdo = conectar();
    $pdo->beginTransaction();

    try {
        $resultado = $operacao($pdo);
        $pdo->commit();

        return $resultado;
    } catch (Throwable $erro) {
        $pdo->rollBack();
        throw $erro;
    }
}

function listar(): void
{
    [$pagina, $porPagina] = parametrosPaginacao();

    responder(listarVendas(
        textoOuNulo($_GET['busca'] ?? ''),
        (int) ($_GET['categoria_id'] ?? 0),
        dataOuNula($_GET['inicio'] ?? ''),
        dataOuNula($_GET['fim'] ?? ''),
        $pagina,
        $porPagina
    ));
}

function criar(): void
{
    [$produtoId, $quantidade, $data] = validar(entrada());

    $id = emTransacao(static function (PDO $pdo) use ($produtoId, $quantidade, $data): int {
        $preco = reservarEstoque($pdo, $produtoId, $quantidade);
        $pdo->prepare('INSERT INTO vendas (produto_id, quantidade, valor_unitario, data_venda) VALUES (?, ?, ?, ?)')
            ->execute([$produtoId, $quantidade, $preco, $data]);

        return (int) $pdo->lastInsertId();
    });

    responder(['sucesso' => true, 'mensagem' => 'Venda registrada com sucesso.', 'id' => $id], 201);
}

function editar(): void
{
    $id = idDaRequisicao();
    [$produtoId, $quantidade, $data] = validar(entrada());

    emTransacao(static function (PDO $pdo) use ($id, $produtoId, $quantidade, $data): void {
        $anterior = buscarVenda($pdo, $id);
        $produtoAnterior = (int) $anterior['produto_id'];

        devolverEstoque($pdo, $produtoAnterior, (int) $anterior['quantidade']);
        $preco = reservarEstoque($pdo, $produtoId, $quantidade);
        $valorUnitario = $produtoId === $produtoAnterior ? (float) $anterior['valor_unitario'] : $preco;

        $pdo->prepare('UPDATE vendas SET produto_id = ?, quantidade = ?, valor_unitario = ?, data_venda = ? WHERE id = ?')
            ->execute([$produtoId, $quantidade, $valorUnitario, $data, $id]);
    });

    responder(['sucesso' => true, 'mensagem' => 'Venda atualizada com sucesso.']);
}

function excluir(): void
{
    $id = idDaRequisicao();

    emTransacao(static function (PDO $pdo) use ($id): void {
        $venda = buscarVenda($pdo, $id);

        devolverEstoque($pdo, (int) $venda['produto_id'], (int) $venda['quantidade']);
        $pdo->prepare('DELETE FROM vendas WHERE id = ?')->execute([$id]);
    });

    responder(['sucesso' => true, 'mensagem' => 'Venda excluída e estoque devolvido.']);
}

match ($_SERVER['REQUEST_METHOD']) {
    'GET' => listar(),
    'POST' => criar(),
    'PUT' => editar(),
    'DELETE' => excluir(),
    default => falhar('Método não permitido.', 405),
};
