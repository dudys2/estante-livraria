<?php
declare(strict_types=1);

$titulo = 'Livros';
$ativo = 'livros';
$script = 'livros';

require __DIR__ . '/includes/header.php';
?>
<div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
    <div>
        <h1 class="titulo-pagina">Livros</h1>
        <p class="subtitulo mb-0" id="resumo">Acervo e estoque.</p>
    </div>
    <button type="button" class="btn btn-primary" id="botaoNovo">Novo livro</button>
</div>

<div class="row g-2 mb-3">
    <div class="col-md-6 col-lg-5">
        <input class="form-control" type="search" id="filtroBusca" placeholder="Buscar por título ou autor" aria-label="Buscar livro">
    </div>
    <div class="col-md-6 col-lg-3">
        <select class="form-select" id="filtroCategoria" aria-label="Filtrar por categoria">
            <option value="0">Todas as categorias</option>
        </select>
    </div>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead>
                <tr>
                    <th>Livro</th>
                    <th>Categoria</th>
                    <th class="text-end">Preço</th>
                    <th class="text-center">Estoque</th>
                    <th class="text-center">Vendidos</th>
                    <th class="text-end">Ações</th>
                </tr>
            </thead>
            <tbody id="tabela"></tbody>
        </table>
    </div>
</div>
<nav class="mt-3" id="paginacao" aria-label="Paginação"></nav>

<div class="modal fade" id="modalFormulario" tabindex="-1" aria-labelledby="tituloModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <form class="modal-content" id="formulario" novalidate>
            <div class="modal-header border-0">
                <h2 class="modal-title fs-5" id="tituloModal">Novo livro</h2>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="campoId">
                <div class="mb-3">
                    <label class="form-label" for="campoTitulo">Título</label>
                    <input class="form-control" id="campoTitulo" maxlength="120" required>
                    <div class="invalid-feedback">Informe o título.</div>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="campoAutor">Autor</label>
                    <input class="form-control" id="campoAutor" maxlength="80" required>
                    <div class="invalid-feedback">Informe o autor.</div>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="campoCategoria">Categoria</label>
                    <select class="form-select" id="campoCategoria" required></select>
                    <div class="invalid-feedback">Selecione a categoria.</div>
                </div>
                <div class="row g-3">
                    <div class="col-6">
                        <label class="form-label" for="campoPreco">Preço (R$)</label>
                        <input class="form-control" type="number" id="campoPreco" min="0.01" step="0.01" required>
                        <div class="invalid-feedback">Informe um valor maior que zero.</div>
                    </div>
                    <div class="col-6">
                        <label class="form-label" for="campoEstoque">Estoque</label>
                        <input class="form-control" type="number" id="campoEstoque" min="0" step="1" required>
                        <div class="invalid-feedback">Informe o estoque.</div>
                    </div>
                </div>
            </div>
            <div class="modal-footer border-0">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
