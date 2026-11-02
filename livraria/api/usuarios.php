<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

const REGEX_SENHA = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/';

function cpfValido(string $cpf): bool
{
    if (strlen($cpf) !== 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
        return false;
    }

    foreach ([9, 10] as $tamanho) {
        $soma = 0;
        for ($i = 0; $i < $tamanho; $i++) {
            $soma += (int) $cpf[$i] * ($tamanho + 1 - $i);
        }
        if ((($soma * 10) % 11) % 10 !== (int) $cpf[$tamanho]) {
            return false;
        }
    }

    return true;
}

function cadastrar(): void
{
    $dados = entrada();
    $nome = trim((string) ($dados['nome'] ?? ''));
    $email = strtolower(trim((string) ($dados['email'] ?? '')));
    $cpf = (string) preg_replace('/\D/', '', (string) ($dados['cpf'] ?? ''));
    $senha = (string) ($dados['senha'] ?? '');

    if ($nome === '' || mb_strlen($nome) > 120) {
        falhar('Informe o nome com até 120 caracteres.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
        falhar('Informe um e-mail válido.');
    }
    if (!cpfValido($cpf)) {
        falhar('Informe um CPF válido.');
    }
    if (!preg_match(REGEX_SENHA, $senha)) {
        falhar('A senha deve ter ao menos 8 caracteres, com letra maiúscula, minúscula, número e símbolo.');
    }
    if (escalar('SELECT COUNT(*) FROM usuarios WHERE email = ?', [$email]) > 0) {
        falhar('Já existe um usuário com este e-mail.', 409);
    }
    if (escalar('SELECT COUNT(*) FROM usuarios WHERE cpf = ?', [$cpf]) > 0) {
        falhar('Já existe um usuário com este CPF.', 409);
    }

    executar(
        'INSERT INTO usuarios (nome, email, cpf, senha) VALUES (?, ?, ?, ?)',
        [$nome, $email, $cpf, password_hash($senha, PASSWORD_DEFAULT)]
    );

    responder([
        'sucesso' => true,
        'mensagem' => 'Usuário cadastrado com sucesso.',
        'id' => (int) conectar()->lastInsertId(),
    ], 201);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    falhar('Método não permitido.', 405);
}

cadastrar();
