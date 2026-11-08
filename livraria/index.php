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
                <div class="d-flex align-items-center gap-2 mb-2"><span class="icone-indicador"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg></span><span class="rotulo mb-0">Faturamento</span></div>
                <div class="indicador-valor" id="kpiFaturamento">R$ 0,00</div>
                <div class="texto-suave" id="kpiVendas">0 vendas</div>
            </div>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card indicador">
            <div class="card-body">
                <div class="d-flex align-items-center gap-2 mb-2"><span class="icone-indicador"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h5v16H5zM12 4h3.5v16H12z"/><path d="M17.2 5.2l3.3.9-3.6 14-3.3-.9z"/></svg></span><span class="rotulo mb-0">Unidades vendidas</span></div>
                <div class="indicador-valor" id="kpiUnidades">0</div>
                <div class="texto-suave">Soma das quantidades</div>
            </div>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card indicador">
            <div class="card-body">
                <div class="d-flex align-items-center gap-2 mb-2"><span class="icone-indicador"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14v16l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 9h6M9 13h4"/></svg></span><span class="rotulo mb-0">Ticket médio</span></div>
                <div class="indicador-valor" id="kpiTicket">R$ 0,00</div>
                <div class="texto-suave">Valor médio por venda</div>
            </div>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card indicador">
            <div class="card-body">
                <div class="d-flex align-items-center gap-2 mb-2"><span class="icone-indicador"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg></span><span class="rotulo mb-0">Livro mais vendido</span></div>
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
                    <table class="table table-hover align-middle mb-0">
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
