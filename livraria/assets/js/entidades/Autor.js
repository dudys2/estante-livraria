import { Entidade } from './Entidade.js';
export class Autor extends Entidade {
    #nome = '';
    totalLivros;
    constructor(dados) {
        super(dados.id);
        this.nome = dados.nome;
        this.totalLivros = dados.totalLivros ?? 0;
    }
    static deApi(dto) {
        return new Autor({ id: dto.id, nome: dto.nome, totalLivros: dto.total_livros });
    }
    get nome() {
        return this.#nome;
    }
    set nome(valor) {
        this.#nome = Entidade.texto('o nome', valor, 120);
    }
    rotulo() {
        return this.#nome;
    }
    paraApi() {
        return { nome: this.#nome };
    }
}
