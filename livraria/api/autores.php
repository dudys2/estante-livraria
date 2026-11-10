<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

exigirAutenticacao();

function validarNome(array $dados, int $ignorarId = 0): string
{
    $nome = trim((string) ($dados['nome'] ?? ''));

    if ($nome === '' || mb_strlen($nome) > 120) {
        falhar('Informe o nome do autor com até 120 caracteres.');
    }
    if (escalar('SELECT COUNT(*) FROM autores WHERE nome = ? AND id <> ?', [$nome, $ignorarId]) > 0) {
        falhar('Já existe um autor com este nome.', 409);
    }

    return $nome;
}

function listar(): void
{
    [$pagina, $porPagina] = parametrosPaginacao();
    $busca = textoOuNulo($_GET['busca'] ?? '');
    $deslocamento = ($pagina - 1) * $porPagina;

    $filtro = $busca === null ? '' : "WHERE a.nome LIKE CONCAT('%', ?, '%')";

    // total_livros vem do relacionamento autores -> livros.
    $linhas = consultar(
        "SELECT a.id, a.nome, COUNT(l.id) AS total_livros, COUNT(*) OVER () AS total_registros
         FROM autores a
         LEFT JOIN livros l ON l.autor_id = a.id
         {$filtro}
         GROUP BY a.id, a.nome
         ORDER BY a.nome
         LIMIT {$porPagina} OFFSET {$deslocamento}",
        $busca === null ? [] : [$busca],
        ['id', 'total_livros', 'total_registros']
    );

    responder(paginar($linhas, $pagina, $porPagina));
}

function buscar(): void
{
    $id = idDaRequisicao();
    $linhas = consultar(
        'SELECT a.id, a.nome, COUNT(l.id) AS total_livros
         FROM autores a
         LEFT JOIN livros l ON l.autor_id = a.id
         WHERE a.id = ?
         GROUP BY a.id, a.nome',
        [$id],
        ['id', 'total_livros']
    );

    if ($linhas === []) {
        falhar('Autor não encontrado.', 404);
    }

    responder(['dados' => $linhas[0]]);
}

function criar(): void
{
    $nome = validarNome(entrada());
    executar('INSERT INTO autores (nome) VALUES (?)', [$nome]);

    responder([
        'sucesso' => true,
        'mensagem' => 'Autor cadastrado com sucesso.',
        'id' => (int) conectar()->lastInsertId(),
    ], 201);
}

function editar(): void
{
    $id = idDaRequisicao();
    $nome = validarNome(entrada(), $id);

    if (executar('UPDATE autores SET nome = ? WHERE id = ?', [$nome, $id]) === 0) {
        falhar('Autor não encontrado.', 404);
    }

    responder(['sucesso' => true, 'mensagem' => 'Autor atualizado com sucesso.']);
}

function excluir(): void
{
    $id = idDaRequisicao();
    $livros = escalar('SELECT COUNT(*) FROM livros WHERE autor_id = ?', [$id]);

    if ($livros > 0) {
        falhar("Não foi possível excluir: o autor possui {$livros} livro(s) vinculado(s). Remova os livros antes de excluí-lo.", 409);
    }
    if (executar('DELETE FROM autores WHERE id = ?', [$id]) === 0) {
        falhar('Autor não encontrado.', 404);
    }

    responder(['sucesso' => true, 'mensagem' => 'Autor excluído com sucesso.']);
}

match ($_SERVER['REQUEST_METHOD']) {
    'GET' => isset($_GET['id']) ? buscar() : listar(),
    'POST' => criar(),
    'PUT' => editar(),
    'DELETE' => excluir(),
    default => falhar('Método não permitido.', 405),
};
