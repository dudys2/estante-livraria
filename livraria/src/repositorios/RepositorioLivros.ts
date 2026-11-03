import { Livro, type CorpoLivro } from '../entidades/Livro.js';
import type { ProdutoDto } from '../nucleo/tipos.js';
import { Repositorio, type Pagina } from './Repositorio.js';

export interface FiltrosLivros {
    busca: string;
    categoriaId: number;
    pagina: number;
    porPagina: number;
}

export class RepositorioLivros extends Repositorio<Livro, ProdutoDto, CorpoLivro> {
    constructor() {
        super('api/produtos.php');
    }

    listar(filtros: FiltrosLivros): Promise<Pagina<Livro>> {
        return this.listarPagina({
            busca: filtros.busca,
            categoria_id: String(filtros.categoriaId),
            pagina: String(filtros.pagina),
            por_pagina: String(filtros.porPagina),
        });
    }

    protected paraEntidade(dto: ProdutoDto): Livro {
        return Livro.deApi(dto);
    }

    protected paraCorpo(livro: Livro): CorpoLivro {
        return livro.paraApi();
    }
}
