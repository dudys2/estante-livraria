<?php
declare(strict_types=1);

require_once __DIR__ . '/env.php';

const JWT_VALIDADE_SEGUNDOS = 7200; // 2 horas

function base64UrlCodificar(string $dados): string
{
    return rtrim(strtr(base64_encode($dados), '+/', '-_'), '=');
}

function base64UrlDecodificar(string $dados): string|false
{
    return base64_decode(strtr($dados, '-_', '+/'), true);
}

function segredoJwt(): string
{
    $segredo = valorEnv('JWT_SECRET');

    if ($segredo === null || strlen($segredo) < 32) {
        error_log('[Estante API] JWT_SECRET ausente ou com menos de 32 caracteres no .env.');
        falhar('Autenticação indisponível: configuração do servidor incompleta.', 500);
    }

    return $segredo;
}

function assinarJwt(string $cabecalhoEPayload): string
{
    return base64UrlCodificar(hash_hmac('sha256', $cabecalhoEPayload, segredoJwt(), true));
}

/**
 * Gera um JWT (HS256) para o usuário informado.
 *
 * @param array{id: int, nome: string, email: string} $usuario
 */
function gerarJwt(array $usuario): array
{
    $emitidoEm = time();
    $expiraEm = $emitidoEm + JWT_VALIDADE_SEGUNDOS;

    $cabecalho = base64UrlCodificar(json_encode(['alg' => 'HS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
    $payload = base64UrlCodificar(json_encode([
        'sub' => $usuario['id'],
        'nome' => $usuario['nome'],
        'email' => $usuario['email'],
        'iat' => $emitidoEm,
        'exp' => $expiraEm,
    ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));

    $base = $cabecalho . '.' . $payload;

    return ['token' => $base . '.' . assinarJwt($base), 'expira_em' => $expiraEm];
}

/**
 * Valida assinatura, algoritmo e validade. Devolve o payload ou null se o token for inválido.
 */
function validarJwt(string $token): ?array
{
    $partes = explode('.', $token);

    if (count($partes) !== 3) {
        return null;
    }

    [$cabecalho, $payload, $assinatura] = $partes;

    if (!hash_equals(assinarJwt($cabecalho . '.' . $payload), $assinatura)) {
        return null;
    }

    $dadosCabecalho = json_decode((string) base64UrlDecodificar($cabecalho), true);
    $dadosPayload = json_decode((string) base64UrlDecodificar($payload), true);

    if (!is_array($dadosCabecalho) || ($dadosCabecalho['alg'] ?? null) !== 'HS256') {
        return null;
    }

    if (!is_array($dadosPayload) || !isset($dadosPayload['sub'], $dadosPayload['exp']) || (int) $dadosPayload['exp'] < time()) {
        return null;
    }

    return $dadosPayload;
}

function tokenDaRequisicao(): ?string
{
    $cabecalho = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? (function_exists('getallheaders') ? (getallheaders()['Authorization'] ?? null) : null);

    if (!is_string($cabecalho) || !preg_match('/^Bearer\s+(\S+)$/i', trim($cabecalho), $encontrado)) {
        return null;
    }

    return $encontrado[1];
}

/**
 * Será usada nas rotas protegidas (próximo passo): interrompe com 401 se não houver JWT válido.
 */
function exigirAutenticacao(): array
{
    $token = tokenDaRequisicao();
    $payload = $token === null ? null : validarJwt($token);

    if ($payload === null) {
        falhar('Sessão inválida ou expirada. Faça login novamente.', 401);
    }

    return $payload;
}
