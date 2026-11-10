import type { Autor } from '../entidades/Autor.js';
import { definirTexto, obter } from '../nucleo/dom.js';
import { escapar } from '../nucleo/formatadores.js';
import {
    atrasar,
    botoesAcao,
    confirmar,
    delegarAcoes,
    linhaVazia,
    mostrarAviso,
    renderizarPaginacao,
    tratarErro,
} from '../nucleo/ui.js';
import { RepositorioAutores } from '../repositorios/RepositorioAutores.js';

const POR_PAGINA = 8;

const repositorio = new RepositorioAutores();

const corpoTabela = obter('tabela', HTMLTableSectionElement);
const navegacao = obter('paginacao', HTMLElement);
const filtroBusca = obter('filtroBusca', HTMLInputElement);

let pagina = 1;
let autores: Autor[] = [];

function linhaAutor(autor: Autor): string {
    return `<tr>
        <td class="fw-medium">${escapar(autor.nome)}</td>
        <td class="text-center">${autor.totalLivros}</td>
        <td class="text-end acoes">${botoesAcao(autor.id)}</td>
    </tr>`;
}

function renderizar(total: number): void {
    if (corpoTabela) {
        corpoTabela.innerHTML =
            autores.length === 0 ? linhaVazia(3, 'Nenhum autor encontrado.') : autores.map(linhaAutor).join('');
    }
    if (navegacao) {
        renderizarPaginacao(navegacao, pagina, total, POR_PAGINA, (destino) => {
            pagina = destino;
            void carregar();
        });
    }
    definirTexto('resumo', `${total} ${total === 1 ? 'autor cadastrado' : 'autores cadastrados'}`);
}

async function carregar(): Promise<void> {
    try {
        const resultado = await repositorio.listar({
            busca: filtroBusca?.value.trim() ?? '',
            pagina,
            porPagina: POR_PAGINA,
        });

        if (resultado.itens.length === 0 && pagina > 1) {
            pagina -= 1;
            await carregar();
            return;
        }
        autores = resultado.itens;
        renderizar(resultado.total);
    } catch (erro) {
        tratarErro(erro);
    }
}

async function excluir(id: number): Promise<void> {
    const autor = autores.find((item) => item.id === id);
    if (!autor || !(await confirmar(`Excluir "${autor.rotulo()}"?`))) {
        return;
    }

    try {
        mostrarAviso(await repositorio.excluir(id));
        await carregar();
    } catch (erro) {
        tratarErro(erro);
    }
}

filtroBusca?.addEventListener(
    'input',
    atrasar(() => {
        pagina = 1;
        void carregar();
    }),
);

if (corpoTabela) {
    delegarAcoes(corpoTabela, (acao, id) => {
        if (acao === 'editar') {
            // O cadastro e a edição ficam em uma tela separada da listagem.
            window.location.assign(`autor-form.php?id=${id}`);
        } else if (acao === 'excluir') {
            void excluir(id);
        }
    });
}

void carregar();
