import { Categoria } from '../entidades/Categoria.js';
import { obter } from '../nucleo/dom.js';
import { escapar } from '../nucleo/formatadores.js';
import { abrirModal, botoesAcao, confirmar, delegarAcoes, fecharModal, linhaVazia, mostrarAviso, renderizarPaginacao, tratarErro, } from '../nucleo/ui.js';
import { RepositorioCategorias } from '../repositorios/RepositorioCategorias.js';
const POR_PAGINA = 8;
const repositorio = new RepositorioCategorias();
const corpoTabela = obter('tabela', HTMLTableSectionElement);
const navegacao = obter('paginacao', HTMLElement);
const formulario = obter('formulario', HTMLFormElement);
const campoId = obter('campoId', HTMLInputElement);
const campoNome = obter('campoNome', HTMLInputElement);
const tituloModal = obter('tituloModal', HTMLElement);
const botaoNovo = obter('botaoNovo', HTMLButtonElement);
let pagina = 1;
let categorias = [];
function linhaCategoria(categoria) {
    return `<tr>
        <td class="fw-medium">${escapar(categoria.nome)}</td>
        <td class="text-center">${categoria.totalLivros}</td>
        <td class="text-end acoes">${botoesAcao(categoria.id)}</td>
    </tr>`;
}
function renderizar(total) {
    if (!corpoTabela) {
        return;
    }
    corpoTabela.innerHTML =
        categorias.length === 0
            ? linhaVazia(3, 'Nenhuma categoria cadastrada.')
            : categorias.map(linhaCategoria).join('');
    if (navegacao) {
        renderizarPaginacao(navegacao, pagina, total, POR_PAGINA, (destino) => {
            pagina = destino;
            void carregar();
        });
    }
}
async function carregar() {
    try {
        const resultado = await repositorio.listarPaginado(pagina, POR_PAGINA);
        if (resultado.itens.length === 0 && pagina > 1) {
            pagina -= 1;
            await carregar();
            return;
        }
        categorias = resultado.itens;
        renderizar(resultado.total);
    }
    catch (erro) {
        tratarErro(erro);
    }
}
function abrirFormulario(categoria) {
    if (!formulario || !campoId || !campoNome || !tituloModal) {
        return;
    }
    formulario.reset();
    formulario.classList.remove('was-validated');
    campoId.value = categoria ? String(categoria.id) : '';
    campoNome.value = categoria ? categoria.nome : '';
    tituloModal.textContent = categoria ? 'Editar categoria' : 'Nova categoria';
    abrirModal('modalFormulario');
}
async function salvar(evento) {
    evento.preventDefault();
    if (!formulario || !campoId || !campoNome) {
        return;
    }
    if (!formulario.checkValidity()) {
        formulario.classList.add('was-validated');
        return;
    }
    try {
        const categoria = new Categoria({ id: Number(campoId.value), nome: campoNome.value });
        const mensagem = await repositorio.salvar(categoria);
        fecharModal('modalFormulario');
        mostrarAviso(mensagem);
        await carregar();
    }
    catch (erro) {
        tratarErro(erro);
    }
}
async function excluir(id) {
    const categoria = categorias.find((item) => item.id === id);
    if (!categoria || !(await confirmar(`Excluir "${categoria.rotulo()}"?`))) {
        return;
    }
    try {
        mostrarAviso(await repositorio.excluir(id));
        await carregar();
    }
    catch (erro) {
        tratarErro(erro);
    }
}
botaoNovo?.addEventListener('click', () => abrirFormulario());
formulario?.addEventListener('submit', (evento) => void salvar(evento));
if (corpoTabela) {
    delegarAcoes(corpoTabela, (acao, id) => {
        if (acao === 'editar') {
            abrirFormulario(categorias.find((item) => item.id === id));
        }
        else if (acao === 'excluir') {
            void excluir(id);
        }
    });
}
void carregar();
