import { Venda, type CorpoVenda } from '../entidades/Venda.js';
import type { VendaDto } from '../nucleo/tipos.js';
import { Repositorio, type Pagina } from './Repositorio.js';

export interface FiltrosVendas {
    busca: string;
    categoriaId: number;
    inicio: string;
    fim: string;
    pagina: number;
    porPagina: number;
}

export class RepositorioVendas extends Repositorio<Venda, VendaDto, CorpoVenda> {
    constructor() {
        super('api/vendas.php');
    }

    listar(filtros: FiltrosVendas): Promise<Pagina<Venda>> {
        return this.listarPagina({
            busca: filtros.busca,
            categoria_id: String(filtros.categoriaId),
            inicio: filtros.inicio,
            fim: filtros.fim,
            pagina: String(filtros.pagina),
            por_pagina: String(filtros.porPagina),
        });
    }

    protected paraEntidade(dto: VendaDto): Venda {
        return Venda.deApi(dto);
    }

    protected paraCorpo(venda: Venda): CorpoVenda {
        return venda.paraApi();
    }
}
