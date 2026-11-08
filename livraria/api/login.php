<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    falhar('Método não permitido.', 405);
}

$dados = entrada();

$email = strtolower(trim((string) ($dados['email'] ?? '')));
$senha = (string) ($dados['senha'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $senha === '') {
    falhar('Informe um e-mail válido e sua senha.');
}

// Procura o usuário pelo e-mail.
$usuarios = consultar(
    'SELECT id, nome, email, senha FROM usuarios WHERE email = ? LIMIT 1',
    [$email]
);

// Confere se o usuário existe e se a senha está correta.
if (
    $usuarios === [] ||
    !password_verify($senha, (string) $usuarios[0]['senha'])
) {
    falhar('E-mail ou senha incorretos.', 401);
}

$usuario = [
    'id' => (int) $usuarios[0]['id'],
    'nome' => (string) $usuarios[0]['nome'],
    'email' => (string) $usuarios[0]['email'],
];

// Gera o token JWT que o front-end enviará nas próximas requisições.
$jwt = gerarJwt($usuario);

responder([
    'sucesso' => true,
    'mensagem' => 'Login realizado com sucesso.',
    'token' => $jwt['token'],
    'tipo' => 'Bearer',
    'expira_em' => $jwt['expira_em'],
    'usuario' => $usuario,
]);
