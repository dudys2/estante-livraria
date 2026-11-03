import { Livro } from '../entidades/Livro.js';
import { definirTexto, obter } from '../nucleo/dom.js';
import { escapar, formatarMoeda } from '../nucleo/formatadores.js';
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

const POR_PAGINA = 8;

const repositorio = new RepositorioLivros();
const repositorioCategorias = new RepositorioCategorias();

const corpoTabela = obter('tabela', HTMLTableSectionElement);
const navegacao = obter('paginacao', HTMLElement);
const filtroBusca = obter('filtroBusca', HTMLInputElement);
const filtroCategoria = obter('filtroCategoria', HTMLSelectElement);
const botaoNovo = obter('botaoNovo', HTMLButtonElement);
const formulario = obter('formulario', HTMLFormElement);
const tituloModal = obter('tituloModal', HTMLElement);
const campoId = obter('campoId', HTMLInputElement);
const campoTitulo = obter('campoTitulo', HTMLInputElement);
const campoAutor = obter('campoAutor', HTMLInputElement);
const campoCategoria = obter('campoCategoria', HTMLSelectElement);
const campoPreco = obter('campoPreco', HTMLInputElement);
const campoEstoque = obter('campoEstoque', HTMLInputElement);

let pagina = 1;
let livros: Livro[] = [];

function linhaLivro(livro: Livro): string {
    return `<tr>
        <td>
            <div class="fw-medium">${escapar(livro.titulo)}</div>
            <div class="texto-suave">${escapar(livro.autor)}</div>
        </td>
        <td>${escapar(livro.categoria)}</td>
        <td class="text-end">${formatarMoeda(livro.preco)}</td>
        <td class="text-center"><span class="selo selo-${livro.statusEstoque}">${livro.estoque}</span></td>
        <td class="text-center">${livro.unidadesVendidas}</td>
        <td class="text-end acoes">${botoesAcao(livro.id)}</td>
    </tr>`;
}

function renderizar(total: number): void {
    if (corpoTabela) {
        corpoTabela.innerHTML =
            livros.length === 0 ? linhaVazia(6, 'Nenhum livro encontrado.') : livros.map(linhaLivro).join('');
    }
    if (navegacao) {
        renderizarPaginacao(navegacao, pagina, total, POR_PAGINA, (destino) => {
            pagina = destino;
            void carregar();
        });
    }
    definirTexto('resumo', `${total} ${total === 1 ? 'livro cadastrado' : 'livros cadastrados'}`);
}

async function carregar(): Promise<void> {
    try {
        const resultado = await repositorio.listar({
            busca: filtroBusca?.value.trim() ?? '',
            categoriaId: Number(filtroCategoria?.value ?? 0),
            pagina,
            porPagina: POR_PAGINA,
        });

        if (resultado.itens.length === 0 && pagina > 1) {
            pagina -= 1;
            await carregar();
            return;
        }
        livros = resultado.itens;
        renderizar(resultado.total);
    } catch (erro) {
        tratarErro(erro);
    }
}

async function carregarCategorias(): Promise<void> {
    try {
        const categorias = await repositorioCategorias.listar();
        const opcoes = categorias.map((categoria) => ({ valor: String(categoria.id), texto: categoria.rotulo() }));

        if (filtroCategoria) {
            preencherSelect(filtroCategoria, [{ valor: '0', texto: 'Todas as categorias' }, ...opcoes]);
        }
        if (campoCategoria) {
            preencherSelect(campoCategoria, [{ valor: '', texto: 'Selecione' }, ...opcoes]);
        }
    } catch (erro) {
        tratarErro(erro);
    }
}

function abrirFormulario(livro?: Livro): void {
    if (!formulario || !tituloModal || !campoId || !campoTitulo || !campoAutor || !campoCategoria || !campoPreco || !campoEstoque) {
        return;
    }

    formulario.reset();
    formulario.classList.remove('was-validated');
    campoId.value = livro ? String(livro.id) : '';
    campoTitulo.value = livro ? livro.titulo : '';
    campoAutor.value = livro ? livro.autor : '';
    campoCategoria.value = livro ? String(livro.categoriaId) : '';
    campoPreco.value = livro ? String(livro.preco) : '';
    campoEstoque.value = livro ? String(livro.estoque) : '';
    tituloModal.textContent = livro ? 'Editar livro' : 'Novo livro';
    abrirModal('modalFormulario');
}

async function salvar(evento: Event): Promise<void> {
    evento.preventDefault();
    if (!formulario || !campoId || !campoTitulo || !campoAutor || !campoCategoria || !campoPreco || !campoEstoque) {
        return;
    }
    if (!formulario.checkValidity()) {
        formulario.classList.add('was-validated');
        return;
    }

    try {
        const livro = new Livro({
            id: Number(campoId.value),
            titulo: campoTitulo.value,
            autor: campoAutor.value,
            categoriaId: Number(campoCategoria.value),
            preco: Number(campoPreco.value),
            estoque: Number(campoEstoque.value),
        });
        const mensagem = await repositorio.salvar(livro);

        fecharModal('modalFormulario');
        mostrarAviso(mensagem);
        await carregar();
    } catch (erro) {
        tratarErro(erro);
    }
}

async function excluir(id: number): Promise<void> {
    const livro = livros.find((item) => item.id === id);
    if (!livro || !(await confirmar(`Excluir "${livro.rotulo()}"?`))) {
        return;
    }

    try {
        mostrarAviso(await repositorio.excluir(id));
        await carregar();
    } catch (erro) {
        tratarErro(erro);
    }
}

function reiniciarBusca(): void {
    pagina = 1;
    void carregar();
}

filtroBusca?.addEventListener('input', atrasar(reiniciarBusca));
filtroCategoria?.addEventListener('change', reiniciarBusca);
botaoNovo?.addEventListener('click', () => abrirFormulario());
formulario?.addEventListener('submit', (evento) => void salvar(evento));

if (corpoTabela) {
    delegarAcoes(corpoTabela, (acao, id) => {
        if (acao === 'editar') {
            abrirFormulario(livros.find((item) => item.id === id));
        } else if (acao === 'excluir') {
            void excluir(id);
        }
    });
}

void carregarCategorias().then(carregar);
