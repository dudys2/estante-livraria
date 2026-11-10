<?php
declare(strict_types=1);

$titulo = 'Autores';
$ativo = 'autores';
$script = 'autores';

require __DIR__ . '/includes/header.php';
?>
<div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
    <div>
        <h1 class="titulo-pagina">Autores</h1>
        <p class="subtitulo mb-0" id="resumo">Quem escreve os livros do acervo.</p>
    </div>
    <a class="btn btn-primary" href="autor-form.php">Novo autor</a>
</div>

<div class="row g-2 mb-3">
    <div class="col-md-6 col-lg-5">
        <input class="form-control" type="search" id="filtroBusca" placeholder="Buscar por nome" aria-label="Buscar autor">
    </div>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
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
<nav class="mt-3" id="paginacao" aria-label="Paginação"></nav>
<?php require __DIR__ . '/includes/footer.php'; ?>
