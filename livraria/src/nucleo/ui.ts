import { ErroApi } from '../erros/ErroApi.js';
import { ErroValidacao } from '../erros/ErroValidacao.js';
import { mensagemDoErro } from './api.js';
import { obter } from './dom.js';
import { escapar } from './formatadores.js';

export type TipoAviso = 'success' | 'danger' | 'warning';

export interface OpcaoSelect {
    valor: string;
    texto: string;
}

export function mostrarAviso(mensagem: string, tipo: TipoAviso = 'success'): void {
    const area = obter('avisos', HTMLDivElement);
    if (!area) {
        return;
    }

    const aviso = document.createElement('div');
    aviso.className = `alert alert-${tipo} alert-dismissible fade show shadow-sm`;
    aviso.setAttribute('role', 'alert');
    aviso.textContent = mensagem;

    const fechar = document.createElement('button');
    fechar.type = 'button';
    fechar.className = 'btn-close';
    fechar.setAttribute('data-bs-dismiss', 'alert');
    fechar.setAttribute('aria-label', 'Fechar');

    aviso.append(fechar);
    area.append(aviso);
    window.setTimeout(() => aviso.remove(), 6000);
}

export function tratarErro(erro: unknown): void {
    const aviso = erro instanceof ErroValidacao || (erro instanceof ErroApi && erro.violaRegraDeNegocio);
    mostrarAviso(mensagemDoErro(erro), aviso ? 'warning' : 'danger');
}

export function abrirModal(id: string): void {
    const elemento = document.getElementById(id);
    if (elemento) {
        bootstrap.Modal.getOrCreateInstance(elemento).show();
    }
}

export function fecharModal(id: string): void {
    const elemento = document.getElementById(id);
    if (elemento) {
        bootstrap.Modal.getOrCreateInstance(elemento).hide();
    }
}

export function confirmar(mensagem: string): Promise<boolean> {
    const modal = obter('modalConfirmacao', HTMLDivElement);
    const texto = obter('textoConfirmacao', HTMLElement);
    const botao = obter('botaoConfirmar', HTMLButtonElement);

    if (!modal || !texto || !botao) {
        return Promise.resolve(false);
    }

    texto.textContent = mensagem;

    return new Promise<boolean>((resolver) => {
        let confirmado = false;

        botao.onclick = () => {
            confirmado = true;
            fecharModal('modalConfirmacao');
        };
        modal.addEventListener('hidden.bs.modal', () => resolver(confirmado), { once: true });
        abrirModal('modalConfirmacao');
    });
}

export function preencherSelect(select: HTMLSelectElement, opcoes: OpcaoSelect[]): void {
    const anterior = select.value;

    select.innerHTML = opcoes
        .map((opcao) => `<option value="${escapar(opcao.valor)}">${escapar(opcao.texto)}</option>`)
        .join('');

    if (opcoes.some((opcao) => opcao.valor === anterior)) {
        select.value = anterior;
    }
}

export function linhaVazia(colunas: number, mensagem: string): string {
    return `<tr><td colspan="${colunas}" class="vazio">${escapar(mensagem)}</td></tr>`;
}

export function botoesAcao(id: number): string {
    return `<button type="button" class="btn btn-sm btn-outline-primary" data-acao="editar" data-id="${id}">Editar</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-acao="excluir" data-id="${id}">Excluir</button>`;
}

export function delegarAcoes(tabela: HTMLElement, aoAcionar: (acao: string, id: number) => void): void {
    tabela.addEventListener('click', (evento) => {
        const alvo = evento.target;
        if (!(alvo instanceof Element)) {
            return;
        }

        const botao = alvo.closest('button[data-acao]');
        if (botao instanceof HTMLButtonElement) {
            aoAcionar(botao.dataset.acao ?? '', Number(botao.dataset.id));
        }
    });
}

export function atrasar(funcao: () => void, milissegundos: number = 300): () => void {
    let temporizador: number | undefined;

    return () => {
        window.clearTimeout(temporizador);
        temporizador = window.setTimeout(funcao, milissegundos);
    };
}

export function renderizarPaginacao(
    nav: HTMLElement,
    pagina: number,
    total: number,
    porPagina: number,
    aoMudar: (pagina: number) => void,
): void {
    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
    nav.replaceChildren();

    if (totalPaginas === 1) {
        return;
    }

    const lista = document.createElement('ul');
    lista.className = 'pagination pagination-sm mb-0 justify-content-end';

    const adicionar = (rotulo: string, destino: number, desativado: boolean, ativo: boolean = false): void => {
        const item = document.createElement('li');
        item.className = `page-item${desativado ? ' disabled' : ''}${ativo ? ' active' : ''}`;

        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'page-link';
        botao.textContent = rotulo;
        botao.addEventListener('click', () => aoMudar(destino));

        item.append(botao);
        lista.append(item);
    };

    adicionar('Anterior', pagina - 1, pagina <= 1);
    for (let numero = 1; numero <= totalPaginas; numero++) {
        adicionar(String(numero), numero, false, numero === pagina);
    }
    adicionar('Próxima', pagina + 1, pagina >= totalPaginas);

    nav.append(lista);
}
