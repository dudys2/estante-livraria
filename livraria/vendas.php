<?php
declare(strict_types=1);

$titulo = 'Vendas';
$ativo = 'vendas';
$script = 'vendas';

require __DIR__ . '/includes/header.php';
?>
<div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
    <div>
        <h1 class="titulo-pagina">Vendas</h1>
        <p class="subtitulo mb-0" id="resumo">Histórico de vendas.</p>
    </div>
    <button type="button" class="btn btn-primary" id="botaoNovo">Nova venda</button>
</div>

<div class="row g-2 mb-3">
    <div class="col-md-6 col-lg-4">
        <input class="form-control" type="search" id="filtroBusca" placeholder="Buscar por livro" aria-label="Buscar venda por livro">
    </div>
    <div class="col-md-6 col-lg-3">
        <select class="form-select" id="filtroCategoria" aria-label="Filtrar por categoria">
            <option value="0">Todas as categorias</option>
        </select>
    </div>
    <div class="col-6 col-lg-2">
        <input class="form-control" type="date" id="filtroInicio" aria-label="Data inicial">
    </div>
    <div class="col-6 col-lg-2">
        <input class="form-control" type="date" id="filtroFim" aria-label="Data final">
    </div>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Livro</th>
                    <th>Categoria</th>
                    <th class="text-center">Qtd.</th>
                    <th class="text-end">Unitário</th>
                    <th class="text-end">Total</th>
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
                <h2 class="modal-title fs-5" id="tituloModal">Nova venda</h2>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="campoId">
                <div class="mb-3">
                    <label class="form-label" for="campoProduto">Livro</label>
                    <select class="form-select" id="campoProduto" required></select>
                    <div class="invalid-feedback">Selecione o livro.</div>
                    <div class="form-text" id="infoProduto"></div>
                </div>
                <div class="row g-3">
                    <div class="col-6">
                        <label class="form-label" for="campoQuantidade">Quantidade</label>
                        <input class="form-control" type="number" id="campoQuantidade" min="1" step="1" required>
                        <div class="invalid-feedback">Informe ao menos 1 unidade.</div>
                    </div>
                    <div class="col-6">
                        <label class="form-label" for="campoData">Data da venda</label>
                        <input class="form-control" type="date" id="campoData" required>
                        <div class="invalid-feedback">Informe a data.</div>
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
