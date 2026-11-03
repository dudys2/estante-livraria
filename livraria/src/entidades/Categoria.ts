import type { CategoriaDto } from '../nucleo/tipos.js';
import { Entidade } from './Entidade.js';

export interface DadosCategoria {
    id?: number;
    nome: string;
    totalLivros?: number;
}

export class Categoria extends Entidade {
    #nome = '';
    readonly totalLivros: number;

    constructor(dados: DadosCategoria) {
        super(dados.id);
        this.nome = dados.nome;
        this.totalLivros = dados.totalLivros ?? 0;
    }

    static deApi(dto: CategoriaDto): Categoria {
        return new Categoria({ id: dto.id, nome: dto.nome, totalLivros: dto.total_livros });
    }

    get nome(): string {
        return this.#nome;
    }

    set nome(valor: string) {
        this.#nome = Entidade.texto('o nome', valor, 60);
    }

    rotulo(): string {
        return this.#nome;
    }

    paraApi(): { nome: string } {
        return { nome: this.#nome };
    }
}
