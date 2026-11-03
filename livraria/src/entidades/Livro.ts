import type { ProdutoDto, StatusEstoque } from '../nucleo/tipos.js';
import { ErroValidacao } from '../erros/ErroValidacao.js';
import { Entidade } from './Entidade.js';

export interface DadosLivro {
    id?: number;
    titulo: string;
    autor: string;
    categoriaId: number;
    categoria?: string;
    preco: number;
    estoque: number;
    unidadesVendidas?: number;
}

export interface CorpoLivro {
    titulo: string;
    autor: string;
    categoria_id: number;
    preco: number;
    estoque: number;
}

const LIMITE_CRITICO = 5;
const LIMITE_BAIXO = 15;

export class Livro extends Entidade {
    #titulo = '';
    #autor = '';
    #preco = 0;
    #estoque = 0;
    readonly categoriaId: number;
    readonly categoria: string;
    readonly unidadesVendidas: number;

    constructor(dados: DadosLivro) {
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

    static deApi(dto: ProdutoDto): Livro {
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

    get titulo(): string {
        return this.#titulo;
    }

    set titulo(valor: string) {
        this.#titulo = Entidade.texto('o título', valor, 120);
    }

    get autor(): string {
        return this.#autor;
    }

    set autor(valor: string) {
        this.#autor = Entidade.texto('o autor', valor, 80);
    }

    get preco(): number {
        return this.#preco;
    }

    set preco(valor: number) {
        this.#preco = Entidade.dinheiro('o preço', valor);
    }

    get estoque(): number {
        return this.#estoque;
    }

    set estoque(valor: number) {
        this.#estoque = Entidade.inteiro('o estoque', valor, 0);
    }

    get statusEstoque(): StatusEstoque {
        if (this.#estoque <= LIMITE_CRITICO) {
            return 'critico';
        }
        return this.#estoque <= LIMITE_BAIXO ? 'baixo' : 'normal';
    }

    rotulo(): string {
        return this.#titulo;
    }

    paraApi(): CorpoLivro {
        return {
            titulo: this.#titulo,
            autor: this.#autor,
            categoria_id: this.categoriaId,
            preco: this.#preco,
            estoque: this.#estoque,
        };
    }
}
