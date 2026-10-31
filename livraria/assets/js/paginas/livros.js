import { requisitar } from '../nucleo/api.js';
import { definirTexto, obter } from '../nucleo/dom.js';
import { escapar, formatarMoeda } from '../nucleo/formatadores.js';
import { abrirModal, atrasar, botoesAcao, confirmar, delegarAcoes, fecharModal, linhaVazia, mostrarAviso, preencherSelect, renderizarPaginacao, tratarErro, } from '../nucleo/ui.js';
const ENDPOINT = 'api/produtos.php';
const POR_PAGINA = 8;
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
let produtos = [];
function linhaProduto(produto) {
    return `<tr>
        <td>
            <div class="fw-medium">${escapar(produto.titulo)}</div>
            <div class="texto-suave">${escapar(produto.autor)}</div>
        </td>
        <td>${escapar(produto.categoria)}</td>
        <td class="text-end">${formatarMoeda(produto.preco)}</td>
        <td class="text-center"><span class="selo selo-${produto.status_estoque}">${produto.estoque}</span></td>
        <td class="text-center">${produto.unidades_vendidas}</td>
        <td class="text-end acoes">${botoesAcao(produto.id)}</td>
    </tr>`;
}
function renderizar(total) {
    if (corpoTabela) {
        corpoTabela.innerHTML =
            produtos.length === 0 ? linhaVazia(6, 'Nenhum livro encontrado.') : produtos.map(linhaProduto).join('');
    }
    if (navegacao) {
        renderizarPaginacao(navegacao, pagina, total, POR_PAGINA, (destino) => {
            pagina = destino;
            void carregar();
        });
    }
    definirTexto('resumo', `${total} ${total === 1 ? 'livro cadastrado' : 'livros cadastrados'}`);
}
async function carregar() {
    const parametros = new URLSearchParams({
        busca: filtroBusca?.value.trim() ?? '',
        categoria_id: filtroCategoria?.value ?? '0',
        pagina: String(pagina),
        por_pagina: String(POR_PAGINA),
    });
    try {
        const resposta = await requisitar(`${ENDPOINT}?${parametros}`);
        if (resposta.dados.length === 0 && pagina > 1) {
            pagina -= 1;
            await carregar();
            return;
        }
        produtos = resposta.dados;
        renderizar(resposta.total);
    }
    catch (erro) {
        tratarErro(erro);
    }
}
async function carregarCategorias() {
    try {
        const resposta = await requisitar('api/categorias.php');
        const opcoes = resposta.dados.map((categoria) => ({ valor: String(categoria.id), texto: categoria.nome }));
        if (filtroCategoria) {
            preencherSelect(filtroCategoria, [{ valor: '0', texto: 'Todas as categorias' }, ...opcoes]);
        }
        if (campoCategoria) {
            preencherSelect(campoCategoria, [{ valor: '', texto: 'Selecione' }, ...opcoes]);
        }
    }
    catch (erro) {
        tratarErro(erro);
    }
}
function abrirFormulario(produto) {
    if (!formulario || !tituloModal || !campoId || !campoTitulo || !campoAutor || !campoCategoria || !campoPreco || !campoEstoque) {
        return;
    }
    formulario.reset();
    formulario.classList.remove('was-validated');
    campoId.value = produto ? String(produto.id) : '';
    campoTitulo.value = produto ? produto.titulo : '';
    campoAutor.value = produto ? produto.autor : '';
    campoCategoria.value = produto ? String(produto.categoria_id) : '';
    campoPreco.value = produto ? String(produto.preco) : '';
    campoEstoque.value = produto ? String(produto.estoque) : '';
    tituloModal.textContent = produto ? 'Editar livro' : 'Novo livro';
    abrirModal('modalFormulario');
}
async function salvar(evento) {
    evento.preventDefault();
    if (!formulario || !campoId || !campoTitulo || !campoAutor || !campoCategoria || !campoPreco || !campoEstoque) {
        return;
    }
    if (!formulario.checkValidity()) {
        formulario.classList.add('was-validated');
        return;
    }
    const id = Number(campoId.value);
    const corpo = {
        titulo: campoTitulo.value.trim(),
        autor: campoAutor.value.trim(),
        categoria_id: Number(campoCategoria.value),
        preco: Number(campoPreco.value),
        estoque: Number(campoEstoque.value),
    };
    try {
        const resposta = await requisitar(id > 0 ? `${ENDPOINT}?id=${id}` : ENDPOINT, id > 0 ? 'PUT' : 'POST', corpo);
        fecharModal('modalFormulario');
        mostrarAviso(resposta.mensagem);
        await carregar();
    }
    catch (erro) {
        tratarErro(erro);
    }
}
async function excluir(id) {
    const produto = produtos.find((item) => item.id === id);
    if (!produto || !(await confirmar(`Excluir o livro "${produto.titulo}"?`))) {
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
function reiniciarBusca() {
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
            abrirFormulario(produtos.find((item) => item.id === id));
        }
        else if (acao === 'excluir') {
            void excluir(id);
        }
    });
}
void carregarCategorias().then(carregar);
