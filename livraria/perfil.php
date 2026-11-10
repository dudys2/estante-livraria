<?php
declare(strict_types=1);

$titulo = 'Meu perfil';
$ativo = 'perfil';
$script = 'perfil';

require __DIR__ . '/includes/header.php';
?>
<div class="row justify-content-center">
    <div class="col-md-8 col-lg-6 col-xl-5">
        <h1 class="titulo-pagina">Meu perfil</h1>
        <p class="subtitulo mb-4">Atualize seus dados. Por segurança, informe a senha ao salvar.</p>

        <form class="card card-body" id="formulario" novalidate>
            <div class="mb-3">
                <label class="form-label" for="campoNome">Nome</label>
                <input class="form-control" id="campoNome" name="nome"
                    maxlength="120" autocomplete="name" required>
                <div class="invalid-feedback">Informe o nome.</div>
            </div>

            <div class="mb-3">
                <label class="form-label" for="campoEmail">E-mail</label>
                <input class="form-control" type="email" id="campoEmail"
                    name="email" readonly autocomplete="email">
                <div class="form-text">O e-mail não pode ser alterado.</div>
            </div>

            <div class="mb-3">
                <label class="form-label" for="campoCpf">CPF</label>
                <input class="form-control" id="campoCpf" name="cpf"
                    inputmode="numeric" placeholder="000.000.000-00"
                    maxlength="14" autocomplete="off" required>
                <div class="invalid-feedback">Informe um CPF válido.</div>
            </div>

            <div class="mb-3">
                <label class="form-label" for="campoSenha">Senha</label>
                <input class="form-control" type="password" id="campoSenha"
                    name="senha" autocomplete="new-password" required>
                <div class="invalid-feedback">
                    Use 8 ou mais caracteres, com maiúscula, minúscula, número e símbolo.
                </div>
                <div class="form-text">
                    Nível da senha:
                    <span class="selo selo-baixo" id="nivelSenha">fraca</span>
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label" for="campoConfirmacao">Confirmar senha</label>
                <input class="form-control" type="password" id="campoConfirmacao"
                    name="confirmacao" autocomplete="new-password" required>
                <div class="invalid-feedback">As senhas não conferem.</div>
            </div>

            <button type="submit" class="btn btn-primary">Salvar alterações</button>
        </form>
    </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
