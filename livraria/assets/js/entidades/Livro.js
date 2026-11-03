import { ErroValidacao } from '../erros/ErroValidacao.js';
import { Entidade } from './Entidade.js';
const LIMITE_CRITICO = 5;
const LIMITE_BAIXO = 15;
export class Livro extends Entidade {
    #titulo = '';
    #autor = '';
    #preco = 0;
    #estoque = 0;
    categoriaId;
    categoria;
    unidadesVendidas;
    constructor(dados) {
        super(dados.id);
        if (!Number.isInteger(dados.categoriaId) || dados.categoriaId < 1) {
            throw new ErroValidacao('a categoria', 'Selecione a categoria.');
        }
        this.titulo = dados.titulo;
        this.autor = dados.autor;
        this.preco = dados.preco;
        this.estoque = dados.estoque;
        this.categoriaId = dados.categoriaId;
        this.categoria = dados.categoria ?? '';
        this.unidadesVendidas = dados.unidadesVendidas ?? 0;
    }
    static deApi(dto) {
        return new Livro({
            id: dto.id,
            titulo: dto.titulo,
            autor: dto.autor,
            categoriaId: dto.categoria_id,
            categoria: dto.categoria,
            preco: dto.preco,
            estoque: dto.estoque,
            unidadesVendidas: dto.unidades_vendidas,
        });
    }
    get titulo() {
        return this.#titulo;
    }
    set titulo(valor) {
        this.#titulo = Entidade.texto('o título', valor, 120);
    }
    get autor() {
        return this.#autor;
    }
    set autor(valor) {
        this.#autor = Entidade.texto('o autor', valor, 80);
    }
    get preco() {
        return this.#preco;
    }
    set preco(valor) {
        this.#preco = Entidade.dinheiro('o preço', valor);
    }
    get estoque() {
        return this.#estoque;
    }
    set estoque(valor) {
        this.#estoque = Entidade.inteiro('o estoque', valor, 0);
    }
    get statusEstoque() {
        if (this.#estoque <= LIMITE_CRITICO) {
            return 'critico';
        }
        return this.#estoque <= LIMITE_BAIXO ? 'baixo' : 'normal';
    }
    rotulo() {
        return this.#titulo;
    }
    paraApi() {
        return {
            titulo: this.#titulo,
            autor: this.#autor,
            categoria_id: this.categoriaId,
            preco: this.#preco,
            estoque: this.#estoque,
        };
    }
}
