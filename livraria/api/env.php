<?php
declare(strict_types=1);

/**
 * Lê o arquivo .env (na pasta livraria/) e devolve o valor de uma variável.
 * O .env nunca deve ser enviado ao GitHub: use o .env.example como modelo.
 */
function valorEnv(string $chave): ?string
{
    static $variaveis = null;

    if ($variaveis === null) {
        $variaveis = [];
        $arquivo = dirname(__DIR__) . '/.env';

        if (is_readable($arquivo)) {
            foreach (file($arquivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $linha) {
                $linha = trim($linha);

                if ($linha === '' || $linha[0] === '#' || !str_contains($linha, '=')) {
                    continue;
                }

                [$nome, $valor] = explode('=', $linha, 2);
                $variaveis[trim($nome)] = trim($valor, " \t\"'");
            }
        }
    }

    $valor = $variaveis[$chave] ?? getenv($chave);

    return $valor === false || $valor === '' ? null : $valor;
}
