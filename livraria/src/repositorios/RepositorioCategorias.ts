import { Categoria } from '../entidades/Categoria.js';
import type { CategoriaDto } from '../nucleo/tipos.js';
import { Repositorio, type Pagina } from './Repositorio.js';

export class RepositorioCategorias extends Repositorio<Categoria, CategoriaDto, { nome: string }> {
    constructor() {
        super('api/categorias.php');
    }

    listar(): Promise<Categoria[]> {
        return this.listarTodos();
    }

    listarPaginado(pagina: number, porPagina: number): Promise<Pagina<Categoria>> {
        return this.listarPagina({ pagina: String(pagina), por_pagina: String(porPagina) });
    }

    protected paraEntidade(dto: CategoriaDto): Categoria {
        return Categoria.deApi(dto);
    }

    protected paraCorpo(categoria: Categoria): { nome: string } {
        return categoria.paraApi();
    }
}
