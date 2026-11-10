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

/**
 * Valida os campos que o cadastro e a edição têm em comum.
 *
 * @return array{0: string, 1: string, 2: string} nome, CPF (só dígitos) e senha
 */
function validarCampos(array $dados): array
{
    $nome = trim((string) ($dados['nome'] ?? ''));
    $cpf = (string) preg_replace('/\D/', '', (string) ($dados['cpf'] ?? ''));
    $senha = (string) ($dados['senha'] ?? '');

    if ($nome === '' || mb_strlen($nome) > 120) {
        falhar('Informe o nome com até 120 caracteres.');
    }
    if (!cpfValido($cpf)) {
        falhar('Informe um CPF válido.');
    }
    if (!preg_match(REGEX_SENHA, $senha)) {
        falhar('A senha deve ter ao menos 8 caracteres, com letra maiúscula, minúscula, número e símbolo.');
    }

    return [$nome, $cpf, $senha];
}

function cadastrar(): void
{
    $dados = entrada();
    $email = strtolower(trim((string) ($dados['email'] ?? '')));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
        falhar('Informe um e-mail válido.');
    }

    [$nome, $cpf, $senha] = validarCampos($dados);

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

function buscarUsuario(int $id): array
{
    $linhas = consultar('SELECT id, nome, email, cpf FROM usuarios WHERE id = ? LIMIT 1', [$id], ['id']);

    if ($linhas === []) {
        falhar('Usuário não encontrado.', 404);
    }

    return $linhas[0];
}

/** Devolve os dados do usuário logado (o front usa para preencher o perfil). */
function perfil(): void
{
    $payload = exigirAutenticacao();

    responder(['sucesso' => true, 'usuario' => buscarUsuario((int) $payload['sub'])]);
}

/** Edita o próprio usuário. Exige nome, CPF e senha; o e-mail nunca muda. */
function editar(): void
{
    $payload = exigirAutenticacao();
    $id = idDaRequisicao();

    if ($id !== (int) $payload['sub']) {
        falhar('Você só pode editar o seu próprio usuário.', 403);
    }

    $atual = buscarUsuario($id);
    $dados = entrada();

    if (array_key_exists('email', $dados) && strtolower(trim((string) $dados['email'])) !== $atual['email']) {
        falhar('O e-mail não pode ser alterado.');
    }

    [$nome, $cpf, $senha] = validarCampos($dados);

    if (escalar('SELECT COUNT(*) FROM usuarios WHERE cpf = ? AND id <> ?', [$cpf, $id]) > 0) {
        falhar('Já existe um usuário com este CPF.', 409);
    }

    executar(
        'UPDATE usuarios SET nome = ?, cpf = ?, senha = ? WHERE id = ?',
        [$nome, $cpf, password_hash($senha, PASSWORD_DEFAULT), $id]
    );

    responder([
        'sucesso' => true,
        'mensagem' => 'Dados atualizados com sucesso.',
        'usuario' => buscarUsuario($id),
    ]);
}

match ($_SERVER['REQUEST_METHOD']) {
    'POST' => cadastrar(),
    'GET' => perfil(),
    'PUT' => editar(),
    default => falhar('Método não permitido.', 405),
};
