import { Venda } from '../entidades/Venda.js';
import { Repositorio } from './Repositorio.js';
export class RepositorioVendas extends Repositorio {
    constructor() {
        super('api/vendas.php');
    }
    listar(filtros) {
        return this.listarPagina({
            busca: filtros.busca,
            categoria_id: String(filtros.categoriaId),
            inicio: filtros.inicio,
            fim: filtros.fim,
            pagina: String(filtros.pagina),
            por_pagina: String(filtros.porPagina),
        });
    }
    paraEntidade(dto) {
        return Venda.deApi(dto);
    }
    paraCorpo(venda) {
        return venda.paraApi();
    }
}
