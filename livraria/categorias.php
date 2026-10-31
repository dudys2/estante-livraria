<?php
declare(strict_types=1);

$titulo = 'Categorias';
$ativo = 'categorias';
$script = 'categorias';

require __DIR__ . '/includes/header.php';
?>
<div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
    <div>
        <h1 class="titulo-pagina">Categorias</h1>
        <p class="subtitulo mb-0">Organize os livros por assunto.</p>
    </div>
    <button type="button" class="btn btn-primary" id="botaoNovo">Nova categoria</button>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="table align-middle mb-0">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th class="text-center">Livros</th>
                    <th class="text-end">Ações</th>
                </tr>
            </thead>
            <tbody id="tabela"></tbody>
        </table>
    </div>
</div>

<div class="modal fade" id="modalFormulario" tabindex="-1" aria-labelledby="tituloModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <form class="modal-content" id="formulario" novalidate>
            <div class="modal-header border-0">
                <h2 class="modal-title fs-5" id="tituloModal">Nova categoria</h2>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="campoId">
                <label class="form-label" for="campoNome">Nome</label>
                <input class="form-control" id="campoNome" maxlength="60" required>
                <div class="invalid-feedback">Informe o nome da categoria.</div>
            </div>
            <div class="modal-footer border-0">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
