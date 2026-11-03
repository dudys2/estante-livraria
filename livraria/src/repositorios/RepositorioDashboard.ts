import { Categoria } from '../entidades/Categoria.js';
import { Livro } from '../entidades/Livro.js';
import { Venda } from '../entidades/Venda.js';
import { requisitar } from '../nucleo/api.js';
import type { RespostaDashboard } from '../nucleo/tipos.js';

export interface DadosDashboard {
    vendas: Venda[];
    livros: Livro[];
    categorias: Categoria[];
}

export class RepositorioDashboard {
    async carregar(): Promise<DadosDashboard> {
        const resposta = await requisitar<RespostaDashboard>('api/dashboard.php');

        return {
            vendas: resposta.vendas.map(Venda.deApi),
            livros: resposta.produtos.map(Livro.deApi),
            categorias: resposta.categorias.map(Categoria.deApi),
        };
    }
}
