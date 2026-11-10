import type { AutorDto } from '../nucleo/tipos.js';
import { Entidade } from './Entidade.js';

export interface DadosAutor {
    id?: number;
    nome: string;
    totalLivros?: number;
}

export class Autor extends Entidade {
    #nome = '';
    readonly totalLivros: number;

    constructor(dados: DadosAutor) {
        super(dados.id);
        this.nome = dados.nome;
        this.totalLivros = dados.totalLivros ?? 0;
    }

    static deApi(dto: AutorDto): Autor {
        return new Autor({ id: dto.id, nome: dto.nome, totalLivros: dto.total_livros });
    }

    get nome(): string {
        return this.#nome;
    }

    set nome(valor: string) {
        this.#nome = Entidade.texto('o nome', valor, 120);
    }

    rotulo(): string {
        return this.#nome;
    }

    paraApi(): { nome: string } {
        return { nome: this.#nome };
    }
}
