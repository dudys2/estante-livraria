<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    falhar('Método não permitido.', 405);
}

responder([
    'vendas' => listarVendas(null, 0, null, null, 1, 10000)['dados'],
    'produtos' => listarProdutos(null, 0, 1, 10000)['dados'],
    'categorias' => listarCategorias(),
]);
