<?php
declare(strict_types=1);

ini_set('display_errors', '0');

const DB_HOST = '127.0.0.1';
const DB_PORTA = 3306;
const DB_NOME = 'biblioteca';
const DB_USUARIO = 'root';
const DB_SENHA = '';

final class ErroDeRegra extends RuntimeException
{
    public int $status;

    public function __construct(string $mensagem, int $status)
    {
        parent::__construct($mensagem);
        $this->status = $status;
    }
}

function responder(array $corpo, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($corpo, JSON_UNESCAPED_UNICODE);
    exit;
}

function falhar(string $mensagem, int $status = 422): void
{
    throw new ErroDeRegra($mensagem, $status);
}

set_exception_handler(static function (Throwable $erro): void {
    if ($erro instanceof ErroDeRegra) {
        responder(['sucesso' => false, 'mensagem' => $erro->getMessage()], $erro->status);
    }
    error_log('[Estante API] ' . get_class($erro) . ': ' . $erro->getMessage());
    responder(['sucesso' => false, 'mensagem' => 'Não foi possível consultar os dados. Verifique a configuração do banco e se as tabelas e procedures foram criadas.'], 500);
});

function conectar(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';port=' . DB_PORTA . ';dbname=' . DB_NOME . ';charset=utf8mb4',
            DB_USUARIO,
            DB_SENHA,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_FOUND_ROWS => true,
            ]
        );
    }

    return $pdo;
}

function tipar(array $linhas, array $inteiros, array $decimais): array
{
    return array_map(static function (array $linha) use ($inteiros, $decimais): array {
        foreach ($inteiros as $coluna) {
            $linha[$coluna] = (int) $linha[$coluna];
        }
        foreach ($decimais as $coluna) {
            $linha[$coluna] = (float) $linha[$coluna];
        }
        return $linha;
    }, $linhas);
}

function consultar(string $sql, array $parametros = [], array $inteiros = [], array $decimais = []): array
{
    $comando = conectar()->prepare($sql);
    $comando->execute($parametros);
    $linhas = $comando->fetchAll();
    $comando->closeCursor();

    return tipar($linhas, $inteiros, $decimais);
}

function escalar(string $sql, array $parametros = []): int
{
    $comando = conectar()->prepare($sql);
    $comando->execute($parametros);

    return (int) $comando->fetchColumn();
}

function executar(string $sql, array $parametros = []): int
{
    $comando = conectar()->prepare($sql);
    $comando->execute($parametros);

    return $comando->rowCount();
}

function entrada(): array
{
    $dados = json_decode(file_get_contents('php://input') ?: '', true);

    return is_array($dados) ? $dados : [];
}

function idDaRequisicao(): int
{
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if ($id === false || $id < 1) {
        falhar('Identificador inválido.');
    }

    return $id;
}

function parametrosPaginacao(int $padrao = 10): array
{
    $pagina = max(1, (int) ($_GET['pagina'] ?? 1));
    $porPagina = min(10000, max(1, (int) ($_GET['por_pagina'] ?? $padrao)));

    return [$pagina, $porPagina];
}

function textoOuNulo(mixed $valor): ?string
{
    $texto = trim((string) $valor);

    return $texto === '' ? null : $texto;
}

function dataValida(string $data): bool
{
    $objeto = DateTime::createFromFormat('Y-m-d', $data);

    return $objeto !== false && $objeto->format('Y-m-d') === $data;
}

function dataOuNula(mixed $valor): ?string
{
    $texto = textoOuNulo($valor);

    return $texto !== null && dataValida($texto) ? $texto : null;
}

function paginar(array $linhas, int $pagina, int $porPagina): array
{
    $total = $linhas === [] ? 0 : (int) $linhas[0]['total_registros'];

    $dados = array_map(static function (array $linha): array {
        unset($linha['total_registros']);
        return $linha;
    }, $linhas);

    return ['dados' => $dados, 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina];
}

require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/consultas.php';
