import { Livro } from '../entidades/Livro.js';
import { Repositorio } from './Repositorio.js';
export class RepositorioLivros extends Repositorio {
    constructor() {
        super('api/produtos.php');
    }
    listar(filtros) {
        return this.listarPagina({
            busca: filtros.busca,
            categoria_id: String(filtros.categoriaId),
            pagina: String(filtros.pagina),
            por_pagina: String(filtros.porPagina),
        });
    }
    paraEntidade(dto) {
        return Livro.deApi(dto);
    }
    paraCorpo(livro) {
        return livro.paraApi();
    }
}
