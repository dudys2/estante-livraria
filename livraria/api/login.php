
<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    falhar('Método não permitido.', 405);
}

// Inicia a sessão do usuário.
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start([
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax',
    ]);
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

$usuario = $usuarios[0];

// Renova o identificador da sessão.
session_regenerate_id(true);

// Guarda os dados do usuário na sessão.
$_SESSION['usuario_id'] = (int) $usuario['id'];
$_SESSION['usuario_nome'] = (string) $usuario['nome'];
$_SESSION['usuario_email'] = (string) $usuario['email'];

responder([
    'sucesso' => true,
    'mensagem' => 'Login realizado com sucesso.',
    'usuario' => [
        'id' => (int) $usuario['id'],
        'nome' => (string) $usuario['nome'],
        'email' => (string) $usuario['email'],
    ],
]);
