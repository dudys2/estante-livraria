<?php
declare(strict_types=1);

$titulo = 'Painel';
$ativo = 'painel';
$script = 'painel';

require __DIR__ . '/includes/header.php';
?>
<div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
    <div>
        <h1 class="titulo-pagina">Painel</h1>
        <p class="subtitulo mb-0">Vendas e estoque da livraria.</p>
    </div>
    <form class="row g-2 align-items-end" id="filtros" onsubmit="return false">
        <div class="col-12 col-sm-auto">
            <label class="form-label rotulo" for="filtroCategoria">Categoria</label>
            <select class="form-select form-select-sm" id="filtroCategoria">
                <option value="0">Todas as categorias</option>
            </select>
        </div>
        <div class="col-6 col-sm-auto">
            <label class="form-label rotulo" for="filtroInicio">De</label>
            <input class="form-control form-control-sm" type="date" id="filtroInicio">
        </div>
        <div class="col-6 col-sm-auto">
            <label class="form-label rotulo" for="filtroFim">Até</label>
            <input class="form-control form-control-sm" type="date" id="filtroFim">
        </div>
        <div class="col-12 col-sm-auto">
            <button class="btn btn-sm btn-outline-secondary w-100" type="button" id="limparFiltros">Limpar filtros</button>
        </div>
    </form>
</div>

<div class="row g-3 mb-3">
    <div class="col-6 col-lg-3">
        <div class="card indicador">
            <div class="card-body">
                <div class="rotulo">Faturamento</div>
                <div class="indicador-valor" id="kpiFaturamento">R$ 0,00</div>
                <div class="texto-suave" id="kpiVendas">0 vendas</div>
            </div>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card indicador">
            <div class="card-body">
                <div class="rotulo">Unidades vendidas</div>
                <div class="indicador-valor" id="kpiUnidades">0</div>
                <div class="texto-suave">Soma das quantidades</div>
            </div>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card indicador">
            <div class="card-body">
                <div class="rotulo">Ticket médio</div>
                <div class="indicador-valor" id="kpiTicket">R$ 0,00</div>
                <div class="texto-suave">Valor médio por venda</div>
            </div>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card indicador">
            <div class="card-body">
                <div class="rotulo">Livro mais vendido</div>
                <div class="indicador-valor indicador-texto" id="kpiDestaque">Nenhum dado registrado</div>
                <div class="texto-suave" id="kpiDestaqueDetalhe">Sem vendas no período</div>
            </div>
        </div>
    </div>
</div>

<div class="row g-3 mb-3">
    <div class="col-lg-7">
        <div class="card h-100">
            <div class="card-body">
                <h2 class="titulo-secao">Faturamento por categoria</h2>
                <div id="listaCategorias"></div>
            </div>
        </div>
    </div>
    <div class="col-lg-5">
        <div class="card h-100">
            <div class="card-body">
                <h2 class="titulo-secao">Livros mais vendidos</h2>
                <div id="listaRanking"></div>
            </div>
        </div>
    </div>
</div>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card h-100">
            <div class="card-body">
                <h2 class="titulo-secao">Estoque crítico</h2>
                <ul class="lista-simples mb-0" id="listaCriticos"></ul>
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        <div class="card h-100">
            <div class="card-body">
                <h2 class="titulo-secao">Vendas recentes</h2>
                <div class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Livro</th>
                                <th class="text-center">Qtd.</th>
                                <th class="text-end">Total</th>
                            </tr>
                        </thead>
                        <tbody id="tabelaRecentes"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
