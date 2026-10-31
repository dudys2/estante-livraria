import { requisitar } from '../nucleo/api.js';
import { calcularIndicadores, filtrarCriticos, filtrarVendas, maioresItens, maiorItem, paraBarras, somarPor, } from '../nucleo/calculos.js';
import { definirHtml, definirTexto, obter } from '../nucleo/dom.js';
import { escapar, formatarData, formatarMoeda } from '../nucleo/formatadores.js';
import { preencherSelect, tratarErro } from '../nucleo/ui.js';
const filtroCategoria = obter('filtroCategoria', HTMLSelectElement);
const filtroInicio = obter('filtroInicio', HTMLInputElement);
const filtroFim = obter('filtroFim', HTMLInputElement);
const botaoLimpar = obter('limparFiltros', HTMLButtonElement);
let dados = null;
function lerFiltros() {
    return {
        categoriaId: Number(filtroCategoria?.value ?? 0),
        inicio: filtroInicio?.value ?? '',
        fim: filtroFim?.value ?? '',
    };
}
function renderizarBarras(id, linhas) {
    if (linhas.length === 0) {
        definirHtml(id, '<p class="vazio">Nenhum dado registrado.</p>');
        return;
    }
    definirHtml(id, linhas
        .map((linha) => `<div class="barra-item">
                    <div class="barra-topo"><span>${escapar(linha.rotulo)}</span><span class="texto-suave">${escapar(linha.texto)}</span></div>
                    <div class="barra-trilho"><div class="barra-preenchimento" style="width: ${linha.percentual.toFixed(1)}%"></div></div>
                </div>`)
        .join(''));
}
function renderizarCriticos(produtos) {
    if (produtos.length === 0) {
        definirHtml('listaCriticos', '<li class="vazio w-100">Nenhum livro com estoque crítico.</li>');
        return;
    }
    definirHtml('listaCriticos', produtos
        .map((produto) => `<li>
                    <div><div class="fw-medium">${escapar(produto.titulo)}</div><div class="texto-suave">${escapar(produto.autor)}</div></div>
                    <span class="selo selo-critico">${produto.estoque} un.</span>
                </li>`)
        .join(''));
}
function renderizarRecentes(vendas) {
    if (vendas.length === 0) {
        definirHtml('tabelaRecentes', '<tr><td colspan="4" class="vazio">Nenhum dado registrado.</td></tr>');
        return;
    }
    definirHtml('tabelaRecentes', vendas
        .map((venda) => `<tr>
                    <td>${formatarData(venda.data_venda)}</td>
                    <td>${escapar(venda.produto)}</td>
                    <td class="text-center">${venda.quantidade}</td>
                    <td class="text-end fw-medium">${formatarMoeda(venda.quantidade * venda.valor_unitario)}</td>
                </tr>`)
        .join(''));
}
function renderizar() {
    if (dados === null) {
        return;
    }
    const filtros = lerFiltros();
    const vendas = filtrarVendas(dados.vendas, filtros);
    const indicadores = calcularIndicadores(vendas);
    const porLivro = somarPor(vendas, (venda) => venda.produto, (venda) => venda.quantidade);
    const porCategoria = somarPor(vendas, (venda) => venda.categoria, (venda) => venda.quantidade * venda.valor_unitario);
    const destaque = maiorItem(porLivro);
    definirTexto('kpiFaturamento', formatarMoeda(indicadores.faturamento));
    definirTexto('kpiVendas', `${indicadores.totalVendas} ${indicadores.totalVendas === 1 ? 'venda' : 'vendas'}`);
    definirTexto('kpiUnidades', String(indicadores.unidades));
    definirTexto('kpiTicket', formatarMoeda(indicadores.ticketMedio));
    definirTexto('kpiDestaque', destaque ? destaque.nome : 'Nenhum dado registrado');
    definirTexto('kpiDestaqueDetalhe', destaque ? `${destaque.valor} unidade(s) vendida(s)` : 'Sem vendas no período');
    renderizarBarras('listaCategorias', paraBarras(maioresItens(porCategoria, 6), formatarMoeda));
    renderizarBarras('listaRanking', paraBarras(maioresItens(porLivro, 5), (valor) => `${valor} un.`));
    renderizarCriticos(filtrarCriticos(dados.produtos, filtros.categoriaId));
    renderizarRecentes(vendas.slice(0, 6));
}
function limparFiltros() {
    if (filtroCategoria) {
        filtroCategoria.value = '0';
    }
    if (filtroInicio) {
        filtroInicio.value = '';
    }
    if (filtroFim) {
        filtroFim.value = '';
    }
    renderizar();
}
async function iniciar() {
    try {
        dados = await requisitar('api/dashboard.php');
        if (filtroCategoria) {
            preencherSelect(filtroCategoria, [
                { valor: '0', texto: 'Todas as categorias' },
                ...dados.categorias.map((categoria) => ({ valor: String(categoria.id), texto: categoria.nome })),
            ]);
        }
        renderizar();
    }
    catch (erro) {
        tratarErro(erro);
    }
}
[filtroCategoria, filtroInicio, filtroFim].forEach((campo) => campo?.addEventListener('change', renderizar));
botaoLimpar?.addEventListener('click', limparFiltros);
void iniciar();
