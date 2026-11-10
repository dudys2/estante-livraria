import { Autor } from '../entidades/Autor.js';
import type { AutorDto } from '../nucleo/tipos.js';
import { Repositorio, type Pagina } from './Repositorio.js';

export interface FiltrosAutores {
    busca: string;
    pagina: number;
    porPagina: number;
}

export class RepositorioAutores extends Repositorio<Autor, AutorDto, { nome: string }> {
    constructor() {
        super('api/autores.php');
    }

    listar(filtros: FiltrosAutores): Promise<Pagina<Autor>> {
        return this.listarPagina({
            busca: filtros.busca,
            pagina: String(filtros.pagina),
            por_pagina: String(filtros.porPagina),
        });
    }

    buscar(id: number): Promise<Autor> {
        return this.obterPorId(id);
    }

    protected paraEntidade(dto: AutorDto): Autor {
        return Autor.deApi(dto);
    }

    protected paraCorpo(autor: Autor): { nome: string } {
        return autor.paraApi();
    }
}
