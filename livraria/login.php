<?php
declare(strict_types=1);

$titulo = 'Login';
$ativo = 'login';
$script = 'login';

require __DIR__ . '/includes/header.php';
?>
<div class="row justify-content-center">
    <div class="col-md-8 col-lg-5 col-xl-4">
        <h1 class="titulo-pagina">Entrar na Estante</h1>
        <p class="subtitulo mb-4">Informe seu e-mail e sua senha para acessar.</p>

        <form class="card card-body" id="formularioLogin" novalidate>
            <div class="mb-3">
                <label class="form-label" for="campoEmailLogin">E-mail</label>
                <input
                    class="form-control"
                    type="email"
                    id="campoEmailLogin"
                    name="email"
                    maxlength="150"
                    autocomplete="email"
                    required
                >
                <div class="invalid-feedback">Informe um e-mail válido.</div>
            </div>

            <div class="mb-4">
                <label class="form-label" for="campoSenhaLogin">Senha</label>
                <input
                    class="form-control"
                    type="password"
                    id="campoSenhaLogin"
                    name="senha"
                    autocomplete="current-password"
                    required
                >
                <div class="invalid-feedback">Informe sua senha.</div>
            </div>

            <button type="submit" class="btn btn-primary" id="botaoEntrar">
                Entrar
            </button>

            <p class="texto-suave text-center mt-3 mb-0">
                Ainda não tem uma conta?
                <a href="cadastro.php">Cadastre-se</a>.
            </p>
        </form>
    </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
