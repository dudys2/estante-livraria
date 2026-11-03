import { requisitar } from '../nucleo/api.js';
export class Repositorio {
    #endpoint;
    constructor(endpoint) {
        this.#endpoint = endpoint;
    }
    async listarTodos() {
        const resposta = await requisitar(this.#endpoint);
        return resposta.dados.map((dto) => this.paraEntidade(dto));
    }
    async listarPagina(filtros) {
        const parametros = new URLSearchParams(filtros);
        const resposta = await requisitar(`${this.#endpoint}?${parametros}`);
        return { itens: resposta.dados.map((dto) => this.paraEntidade(dto)), total: resposta.total };
    }
    async salvar(entidade) {
        const url = entidade.persistida ? `${this.#endpoint}?id=${entidade.id}` : this.#endpoint;
        const resposta = await requisitar(url, entidade.persistida ? 'PUT' : 'POST', this.paraCorpo(entidade));
        return resposta.mensagem;
    }
    async excluir(id) {
        const resposta = await requisitar(`${this.#endpoint}?id=${id}`, 'DELETE');
        return resposta.mensagem;
    }
}
