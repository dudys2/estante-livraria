import { requisitar } from '../nucleo/api.js';
import { definirTexto, obter } from '../nucleo/dom.js';
import { escapar, formatarData, formatarMoeda, hojeIso } from '../nucleo/formatadores.js';
import type {
    Categoria,
    Produto,
    RespostaLista,
    RespostaMensagem,
    RespostaPaginada,
    Venda,
} from '../nucleo/tipos.js';
import {
    abrirModal,
    atrasar,
    botoesAcao,
    confirmar,
    delegarAcoes,
    fecharModal,
    linhaVazia,
    mostrarAviso,
    preencherSelect,
    renderizarPaginacao,
    tratarErro,
} from '../nucleo/ui.js';

const ENDPOINT = 'api/vendas.php';
const POR_PAGINA = 8;

const corpoTabela = obter('tabela', HTMLTableSectionElement);
const navegacao = obter('paginacao', HTMLElement);
const filtroBusca = obter('filtroBusca', HTMLInputElement);
const filtroCategoria = obter('filtroCategoria', HTMLSelectElement);
const filtroInicio = obter('filtroInicio', HTMLInputElement);
const filtroFim = obter('filtroFim', HTMLInputElement);
const botaoNovo = obter('botaoNovo', HTMLButtonElement);
const formulario = obter('formulario', HTMLFormElement);
const tituloModal = obter('tituloModal', HTMLElement);
const campoId = obter('campoId', HTMLInputElement);
const campoProduto = obter('campoProduto', HTMLSelectElement);
const campoQuantidade = obter('campoQuantidade', HTMLInputElement);
const campoData = obter('campoData', HTMLInputElement);

let pagina = 1;
let vendas: Venda[] = [];
let catalogo: Produto[] = [];

function linhaVenda(venda: Venda): string {
    return `<tr>
        <td>${formatarData(venda.data_venda)}</td>
        <td class="fw-medium">${escapar(venda.produto)}</td>
        <td>${escapar(venda.categoria)}</td>
        <td class="text-center">${venda.quantidade}</td>
        <td class="text-end">${formatarMoeda(venda.valor_unitario)}</td>
        <td class="text-end fw-medium">${formatarMoeda(venda.total)}</td>
        <td class="text-end acoes">${botoesAcao(venda.venda_id)}</td>
    </tr>`;
}

function renderizar(total: number): void {
    if (corpoTabela) {
        corpoTabela.innerHTML =
            vendas.length === 0 ? linhaVazia(7, 'Nenhuma venda encontrada.') : vendas.map(linhaVenda).join('');
    }
    if (navegacao) {
        renderizarPaginacao(navegacao, pagina, total, POR_PAGINA, (destino) => {
            pagina = destino;
            void carregar();
        });
    }
    definirTexto('resumo', `${total} ${total === 1 ? 'venda encontrada' : 'vendas encontradas'}`);
}

async function carregar(): Promise<void> {
    const parametros = new URLSearchParams({
        busca: filtroBusca?.value.trim() ?? '',
        categoria_id: filtroCategoria?.value ?? '0',
        inicio: filtroInicio?.value ?? '',
        fim: filtroFim?.value ?? '',
        pagina: String(pagina),
        por_pagina: String(POR_PAGINA),
    });

    try {
        const resposta = await requisitar<RespostaPaginada<Venda>>(`${ENDPOINT}?${parametros}`);

        if (resposta.dados.length === 0 && pagina > 1) {
            pagina -= 1;
            await carregar();
            return;
        }
        vendas = resposta.dados;
        renderizar(resposta.total);
    } catch (erro) {
        tratarErro(erro);
    }
}

async function carregarApoio(): Promise<void> {
    try {
        const [categorias, livros] = await Promise.all([
            requisitar<RespostaLista<Categoria>>('api/categorias.php'),
            requisitar<RespostaPaginada<Produto>>('api/produtos.php?por_pagina=1000'),
        ]);
        catalogo = livros.dados;

        if (filtroCategoria) {
            preencherSelect(filtroCategoria, [
                { valor: '0', texto: 'Todas as categorias' },
                ...categorias.dados.map((categoria) => ({ valor: String(categoria.id), texto: categoria.nome })),
            ]);
        }
        if (campoProduto) {
            preencherSelect(campoProduto, [
                { valor: '', texto: 'Selecione' },
                ...catalogo.map((livro) => ({ valor: String(livro.id), texto: livro.titulo })),
            ]);
        }
    } catch (erro) {
        tratarErro(erro);
    }
}

function atualizarInfoProduto(): void {
    const livro = catalogo.find((item) => item.id === Number(campoProduto?.value));
    definirTexto('infoProduto', livro ? `Preço atual: ${formatarMoeda(livro.preco)}. Estoque: ${livro.estoque}.` : '');
}

function abrirFormulario(venda?: Venda): void {
    if (!formulario || !tituloModal || !campoId || !campoProduto || !campoQuantidade || !campoData) {
        return;
    }

    formulario.reset();
    formulario.classList.remove('was-validated');
    campoId.value = venda ? String(venda.venda_id) : '';
    campoProduto.value = venda ? String(venda.produto_id) : '';
    campoQuantidade.value = venda ? String(venda.quantidade) : '';
    campoData.value = venda ? venda.data_venda : hojeIso();
    tituloModal.textContent = venda ? 'Editar venda' : 'Nova venda';
    atualizarInfoProduto();
    abrirModal('modalFormulario');
}

async function salvar(evento: Event): Promise<void> {
    evento.preventDefault();
    if (!formulario || !campoId || !campoProduto || !campoQuantidade || !campoData) {
        return;
    }
    if (!formulario.checkValidity()) {
        formulario.classList.add('was-validated');
        return;
    }

    const id = Number(campoId.value);
    const corpo = {
        produto_id: Number(campoProduto.value),
        quantidade: Number(campoQuantidade.value),
        data_venda: campoData.value,
    };

    try {
        const resposta = await requisitar<RespostaMensagem>(
            id > 0 ? `${ENDPOINT}?id=${id}` : ENDPOINT,
            id > 0 ? 'PUT' : 'POST',
            corpo,
        );
        fecharModal('modalFormulario');
        mostrarAviso(resposta.mensagem);
        await Promise.all([carregar(), carregarApoio()]);
    } catch (erro) {
        tratarErro(erro);
    }
}

async function excluir(id: number): Promise<void> {
    const venda = vendas.find((item) => item.venda_id === id);
    if (!venda || !(await confirmar(`Excluir a venda de "${venda.produto}"? O estoque será devolvido.`))) {
        return;
    }

    try {
        const resposta = await requisitar<RespostaMensagem>(`${ENDPOINT}?id=${id}`, 'DELETE');
        mostrarAviso(resposta.mensagem);
        await Promise.all([carregar(), carregarApoio()]);
    } catch (erro) {
        tratarErro(erro);
    }
}

function reiniciarBusca(): void {
    pagina = 1;
    void carregar();
}

filtroBusca?.addEventListener('input', atrasar(reiniciarBusca));
[filtroCategoria, filtroInicio, filtroFim].forEach((campo) => campo?.addEventListener('change', reiniciarBusca));
campoProduto?.addEventListener('change', atualizarInfoProduto);
botaoNovo?.addEventListener('click', () => abrirFormulario());
formulario?.addEventListener('submit', (evento) => void salvar(evento));

if (corpoTabela) {
    delegarAcoes(corpoTabela, (acao, id) => {
        if (acao === 'editar') {
            abrirFormulario(vendas.find((item) => item.venda_id === id));
        } else if (acao === 'excluir') {
            void excluir(id);
        }
    });
}

void carregarApoio().then(carregar);
