<?php
declare(strict_types=1);

$titulo = 'Autor';
$ativo = 'autores';
$script = 'autor-form';

require __DIR__ . '/includes/header.php';
?>
<div class="row justify-content-center">
    <div class="col-md-8 col-lg-6 col-xl-5">
        <h1 class="titulo-pagina" id="tituloPagina">Novo autor</h1>
        <p class="subtitulo mb-4">Informe o nome do autor.</p>

        <form class="card card-body" id="formulario" novalidate>
            <div class="mb-4">
                <label class="form-label" for="campoNome">Nome</label>
                <input class="form-control" id="campoNome" maxlength="120" required>
                <div class="invalid-feedback">Informe o nome do autor.</div>
            </div>

            <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">Salvar</button>
                <a class="btn btn-light" href="autores.php">Cancelar</a>
            </div>
        </form>
    </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
