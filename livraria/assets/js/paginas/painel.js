import { definirHtml, definirTexto, obter } from '../nucleo/dom.js';
import { escapar, formatarData, formatarMoeda } from '../nucleo/formatadores.js';
import { preencherSelect, tratarErro } from '../nucleo/ui.js';
import { RepositorioDashboard } from '../repositorios/RepositorioDashboard.js';
import { ServicoPainel } from '../servicos/ServicoPainel.js';
const repositorio = new RepositorioDashboard();
const filtroCategoria = obter('filtroCategoria', HTMLSelectElement);
const filtroInicio = obter('filtroInicio', HTMLInputElement);
const filtroFim = obter('filtroFim', HTMLInputElement);
const botaoLimpar = obter('limparFiltros', HTMLButtonElement);
let servico = null;
function lerFiltros() {
    return {
        categoriaId: Number(filtroCategoria?.value ?? 0),
        inicio: filtroInicio?.value ?? '',
        fim: filtroFim?.value ?? '',
    };
}
function paraBarras(itens, formatar) {
    const maximo = itens.reduce((maior, item) => Math.max(maior, item.valor), 0);
    return itens.map((item) => ({
        rotulo: item.nome,
        texto: formatar(item.valor),
        percentual: maximo > 0 ? (item.valor / maximo) * 100 : 0,
    }));
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
function renderizarCriticos(livros) {
    if (livros.length === 0) {
        definirHtml('listaCriticos', '<li class="vazio w-100">Nenhum livro com estoque crítico.</li>');
        return;
    }
    definirHtml('listaCriticos', livros
        .map((livro) => `<li>
                    <div><div class="fw-medium">${escapar(livro.titulo)}</div><div class="texto-suave">${escapar(livro.autor)}</div></div>
                    <span class="selo selo-critico">${livro.estoque} un.</span>
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
                    <td>${formatarData(venda.dataVenda)}</td>
                    <td>${escapar(venda.produto)}</td>
                    <td class="text-center">${venda.quantidade}</td>
                    <td class="text-end fw-medium">${formatarMoeda(venda.total)}</td>
                </tr>`)
        .join(''));
}
function renderizar() {
    if (servico === null) {
        return;
    }
    const { indicadores, destaque, porCategoria, porLivro, criticos, recentes } = servico.resumir(lerFiltros());
    definirTexto('kpiFaturamento', formatarMoeda(indicadores.faturamento));
    definirTexto('kpiVendas', `${indicadores.totalVendas} ${indicadores.totalVendas === 1 ? 'venda' : 'vendas'}`);
    definirTexto('kpiUnidades', String(indicadores.unidades));
    definirTexto('kpiTicket', formatarMoeda(indicadores.ticketMedio));
    definirTexto('kpiDestaque', destaque ? destaque.nome : 'Nenhum dado registrado');
    definirTexto('kpiDestaqueDetalhe', destaque ? `${destaque.valor} unidade(s) vendida(s)` : 'Sem vendas no período');
    renderizarBarras('listaCategorias', paraBarras(porCategoria, formatarMoeda));
    renderizarBarras('listaRanking', paraBarras(porLivro, (valor) => `${valor} un.`));
    renderizarCriticos(criticos);
    renderizarRecentes(recentes);
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
        const dados = await repositorio.carregar();
        servico = new ServicoPainel(dados.vendas, dados.livros);
        if (filtroCategoria) {
            preencherSelect(filtroCategoria, [
                { valor: '0', texto: 'Todas as categorias' },
                ...dados.categorias.map((categoria) => ({ valor: String(categoria.id), texto: categoria.rotulo() })),
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
