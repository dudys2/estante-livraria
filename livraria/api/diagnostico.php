<?php
declare(strict_types=1);

// Endpoint local de diagnóstico: não retorna senha nem outros dados de conexão.
$ipCliente = $_SERVER['REMOTE_ADDR'] ?? '';
if (!in_array($ipCliente, ['127.0.0.1', '::1'], true)) {
    http_response_code(404);
    exit;
}
require __DIR__ . '/bootstrap.php';

try {
    $pdo = conectar();
    $banco = (string) $pdo->query('SELECT DATABASE()')->fetchColumn();

    $tabelasEsperadas = ['categorias', 'produtos', 'vendas'];
    $consultaTabelas = $pdo->prepare(
        'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = \'BASE TABLE\''
    );
    $consultaTabelas->execute();
    $tabelasExistentes = array_map('strval', $consultaTabelas->fetchAll(PDO::FETCH_COLUMN));

    $rotinasEsperadas = ['sp_listar_produtos', 'sp_listar_vendas'];
    $consultaRotinas = $pdo->prepare(
        'SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = DATABASE() AND ROUTINE_TYPE = \'PROCEDURE\''
    );
    $consultaRotinas->execute();
    $rotinasExistentes = array_map('strval', $consultaRotinas->fetchAll(PDO::FETCH_COLUMN));

    $faltamTabelas = array_values(array_diff($tabelasEsperadas, $tabelasExistentes));
    $faltamRotinas = array_values(array_diff($rotinasEsperadas, $rotinasExistentes));

    $testes = [];
    foreach ([
        'sp_listar_produtos' => 'CALL sp_listar_produtos(NULL, 0, 1, 1)',
        'sp_listar_vendas' => 'CALL sp_listar_vendas(NULL, 0, NULL, NULL, 1, 1)',
    ] as $nome => $sql) {
        try {
            $stmt = $pdo->query($sql);
            do {
                $stmt->fetchAll();
            } while ($stmt->nextRowset());
            $stmt->closeCursor();
            $testes[$nome] = 'OK';
        } catch (Throwable $erro) {
            $testes[$nome] = $erro->getMessage();
        }
    }

    responder([
        'sucesso' => $banco === 'biblioteca' && $faltamTabelas === [] && $faltamRotinas === [] && !in_array(false, array_map(static fn($v) => $v === 'OK', $testes), true),
        'conexao' => 'OK',
        'banco_conectado' => $banco,
        'tabelas_esperadas' => $tabelasEsperadas,
        'tabelas_ausentes' => $faltamTabelas,
        'procedures_esperadas' => $rotinasEsperadas,
        'procedures_ausentes' => $faltamRotinas,
        'teste_execucao_procedures' => $testes,
    ]);
} catch (Throwable $erro) {
    error_log('[Estante diagnóstico] ' . get_class($erro) . ': ' . $erro->getMessage());
    responder([
        'sucesso' => false,
        'conexao' => 'FALHOU',
        'tipo_erro' => get_class($erro),
        'erro' => $erro->getMessage(),
    ], 500);
}
