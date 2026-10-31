import { requisitar } from '../nucleo/api.js';
import { obter } from '../nucleo/dom.js';
import { escapar } from '../nucleo/formatadores.js';
import { abrirModal, botoesAcao, confirmar, delegarAcoes, fecharModal, linhaVazia, mostrarAviso, tratarErro, } from '../nucleo/ui.js';
const ENDPOINT = 'api/categorias.php';
const corpoTabela = obter('tabela', HTMLTableSectionElement);
const formulario = obter('formulario', HTMLFormElement);
const campoId = obter('campoId', HTMLInputElement);
const campoNome = obter('campoNome', HTMLInputElement);
const tituloModal = obter('tituloModal', HTMLElement);
const botaoNovo = obter('botaoNovo', HTMLButtonElement);
let categorias = [];
function linhaCategoria(categoria) {
    return `<tr>
        <td class="fw-medium">${escapar(categoria.nome)}</td>
        <td class="text-center">${categoria.total_livros}</td>
        <td class="text-end acoes">${botoesAcao(categoria.id)}</td>
    </tr>`;
}
function renderizar() {
    if (!corpoTabela) {
        return;
    }
    corpoTabela.innerHTML =
        categorias.length === 0
            ? linhaVazia(3, 'Nenhuma categoria cadastrada.')
            : categorias.map(linhaCategoria).join('');
}
async function carregar() {
    try {
        const resposta = await requisitar(ENDPOINT);
        categorias = resposta.dados;
        renderizar();
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
    const id = Number(campoId.value);
    try {
        const resposta = await requisitar(id > 0 ? `${ENDPOINT}?id=${id}` : ENDPOINT, id > 0 ? 'PUT' : 'POST', { nome: campoNome.value.trim() });
        fecharModal('modalFormulario');
        mostrarAviso(resposta.mensagem);
        await carregar();
    }
    catch (erro) {
        tratarErro(erro);
    }
}
async function excluir(id) {
    const categoria = categorias.find((item) => item.id === id);
    if (!categoria || !(await confirmar(`Excluir a categoria "${categoria.nome}"?`))) {
        return;
    }
    try {
        const resposta = await requisitar(`${ENDPOINT}?id=${id}`, 'DELETE');
        mostrarAviso(resposta.mensagem);
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
