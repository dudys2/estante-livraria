import type { Livro } from '../entidades/Livro.js';
import { Venda } from '../entidades/Venda.js';
import { definirTexto, obter } from '../nucleo/dom.js';
import { escapar, formatarData, formatarMoeda, hojeIso } from '../nucleo/formatadores.js';
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
import { RepositorioCategorias } from '../repositorios/RepositorioCategorias.js';
import { RepositorioLivros } from '../repositorios/RepositorioLivros.js';
import { RepositorioVendas } from '../repositorios/RepositorioVendas.js';

const POR_PAGINA = 8;

const repositorio = new RepositorioVendas();
const repositorioLivros = new RepositorioLivros();
const repositorioCategorias = new RepositorioCategorias();

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
let catalogo: Livro[] = [];

function linhaVenda(venda: Venda): string {
    return `<tr>
        <td>${formatarData(venda.dataVenda)}</td>
        <td class="fw-medium">${escapar(venda.produto)}</td>
        <td>${escapar(venda.categoria)}</td>
        <td class="text-center">${venda.quantidade}</td>
        <td class="text-end">${formatarMoeda(venda.valorUnitario)}</td>
        <td class="text-end fw-medium">${formatarMoeda(venda.total)}</td>
        <td class="text-end acoes">${botoesAcao(venda.id)}</td>
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
    try {
        const resultado = await repositorio.listar({
            busca: filtroBusca?.value.trim() ?? '',
            categoriaId: Number(filtroCategoria?.value ?? 0),
            inicio: filtroInicio?.value ?? '',
            fim: filtroFim?.value ?? '',
            pagina,
            porPagina: POR_PAGINA,
        });

        if (resultado.itens.length === 0 && pagina > 1) {
            pagina -= 1;
            await carregar();
            return;
        }
        vendas = resultado.itens;
        renderizar(resultado.total);
    } catch (erro) {
        tratarErro(erro);
    }
}

async function carregarApoio(): Promise<void> {
    try {
        const [categorias, livros] = await Promise.all([
            repositorioCategorias.listar(),
            repositorioLivros.listar({ busca: '', categoriaId: 0, pagina: 1, porPagina: 1000 }),
        ]);
        catalogo = livros.itens;

        if (filtroCategoria) {
            preencherSelect(filtroCategoria, [
                { valor: '0', texto: 'Todas as categorias' },
                ...categorias.map((categoria) => ({ valor: String(categoria.id), texto: categoria.rotulo() })),
            ]);
        }
        if (campoProduto) {
            preencherSelect(campoProduto, [
                { valor: '', texto: 'Selecione' },
                ...catalogo.map((livro) => ({ valor: String(livro.id), texto: livro.rotulo() })),
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
    campoId.value = venda ? String(venda.id) : '';
    campoProduto.value = venda ? String(venda.produtoId) : '';
    campoQuantidade.value = venda ? String(venda.quantidade) : '';
    campoData.value = venda ? venda.dataVenda : hojeIso();
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

    try {
        const venda = new Venda({
            id: Number(campoId.value),
            produtoId: Number(campoProduto.value),
            quantidade: Number(campoQuantidade.value),
            dataVenda: campoData.value,
        });
        const mensagem = await repositorio.salvar(venda);

        fecharModal('modalFormulario');
        mostrarAviso(mensagem);
        await Promise.all([carregar(), carregarApoio()]);
    } catch (erro) {
        tratarErro(erro);
    }
}

async function excluir(id: number): Promise<void> {
    const venda = vendas.find((item) => item.id === id);
    if (!venda || !(await confirmar(`Excluir a ${venda.rotulo()}? O estoque será devolvido.`))) {
        return;
    }

    try {
        mostrarAviso(await repositorio.excluir(id));
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
            abrirFormulario(vendas.find((item) => item.id === id));
        } else if (acao === 'excluir') {
            void excluir(id);
        }
    });
}

void carregarApoio().then(carregar);
