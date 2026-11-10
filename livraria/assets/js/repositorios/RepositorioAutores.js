import { Autor } from '../entidades/Autor.js';
import { Repositorio } from './Repositorio.js';
export class RepositorioAutores extends Repositorio {
    constructor() {
        super('api/autores.php');
    }
    listar(filtros) {
        return this.listarPagina({
            busca: filtros.busca,
            pagina: String(filtros.pagina),
            por_pagina: String(filtros.porPagina),
        });
    }
    buscar(id) {
        return this.obterPorId(id);
    }
    paraEntidade(dto) {
        return Autor.deApi(dto);
    }
    paraCorpo(autor) {
        return autor.paraApi();
    }
}
