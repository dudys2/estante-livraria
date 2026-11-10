import type { Entidade } from '../entidades/Entidade.js';
import { requisitar } from '../nucleo/api.js';
import type { RespostaItem, RespostaLista, RespostaMensagem, RespostaPaginada } from '../nucleo/tipos.js';

export interface Pagina<T> {
    itens: T[];
    total: number;
}

export abstract class Repositorio<T extends Entidade, TDto, TCorpo extends object> {
    readonly #endpoint: string;

    protected constructor(endpoint: string) {
        this.#endpoint = endpoint;
    }

    protected abstract paraEntidade(dto: TDto): T;

    protected abstract paraCorpo(entidade: T): TCorpo;

    protected async listarTodos(): Promise<T[]> {
        const resposta = await requisitar<RespostaLista<TDto>>(this.#endpoint);
        return resposta.dados.map((dto) => this.paraEntidade(dto));
    }

    protected async listarPagina(filtros: Record<string, string>): Promise<Pagina<T>> {
        const parametros = new URLSearchParams(filtros);
        const resposta = await requisitar<RespostaPaginada<TDto>>(`${this.#endpoint}?${parametros}`);

        return { itens: resposta.dados.map((dto) => this.paraEntidade(dto)), total: resposta.total };
    }

    protected async obterPorId(id: number): Promise<T> {
        const resposta = await requisitar<RespostaItem<TDto>>(`${this.#endpoint}?id=${id}`);
        return this.paraEntidade(resposta.dados);
    }

    async salvar(entidade: T): Promise<string> {
        const url = entidade.persistida ? `${this.#endpoint}?id=${entidade.id}` : this.#endpoint;
        const resposta = await requisitar<RespostaMensagem>(
            url,
            entidade.persistida ? 'PUT' : 'POST',
            this.paraCorpo(entidade),
        );

        return resposta.mensagem;
    }

    async excluir(id: number): Promise<string> {
        const resposta = await requisitar<RespostaMensagem>(`${this.#endpoint}?id=${id}`, 'DELETE');
        return resposta.mensagem;
    }
}
