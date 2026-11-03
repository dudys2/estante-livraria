import { Categoria } from '../entidades/Categoria.js';
import { Livro } from '../entidades/Livro.js';
import { Venda } from '../entidades/Venda.js';
import { requisitar } from '../nucleo/api.js';
export class RepositorioDashboard {
    async carregar() {
        const resposta = await requisitar('api/dashboard.php');
        return {
            vendas: resposta.vendas.map(Venda.deApi),
            livros: resposta.produtos.map(Livro.deApi),
            categorias: resposta.categorias.map(Categoria.deApi),
        };
    }
}
