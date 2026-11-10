<?php
declare(strict_types=1);

function listarVendas(?string $busca, int $categoriaId, ?string $inicio, ?string $fim, int $pagina, int $porPagina): array
{
    $linhas = consultar(
        'CALL sp_listar_vendas(?, ?, ?, ?, ?, ?)',
        [$busca, $categoriaId, $inicio, $fim, $pagina, $porPagina],
        ['venda_id', 'produto_id', 'categoria_id', 'quantidade', 'total_registros'],
        ['valor_unitario', 'total']
    );

    return paginar($linhas, $pagina, $porPagina);
}

function listarProdutos(?string $busca, int $categoriaId, int $pagina, int $porPagina): array
{
    $linhas = consultar(
        'CALL sp_listar_produtos(?, ?, ?, ?)',
        [$busca, $categoriaId, $pagina, $porPagina],
        ['id', 'categoria_id', 'estoque', 'unidades_vendidas', 'total_registros'],
        ['preco', 'receita']
    );

    return paginar($linhas, $pagina, $porPagina);
}

function listarCategorias(): array
{
    return consultar(
        'SELECT c.id, c.nome, COUNT(p.id) AS total_livros
         FROM categorias c
         LEFT JOIN produtos p ON p.categoria_id = c.id
         GROUP BY c.id, c.nome
         ORDER BY c.nome',
        [],
        ['id', 'total_livros']
    );
}


function listarCategoriasPaginadas(int $pagina, int $porPagina): array
{
    $deslocamento = ($pagina - 1) * $porPagina;

    $linhas = consultar(
        "SELECT c.id, c.nome, COUNT(p.id) AS total_livros, COUNT(*) OVER () AS total_registros
         FROM categorias c
         LEFT JOIN produtos p ON p.categoria_id = c.id
         GROUP BY c.id, c.nome
         ORDER BY c.nome
         LIMIT {$porPagina} OFFSET {$deslocamento}",
        [],
        ['id', 'total_livros', 'total_registros']
    );

    return paginar($linhas, $pagina, $porPagina);
}
