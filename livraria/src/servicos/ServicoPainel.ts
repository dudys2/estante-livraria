import type { Livro } from '../entidades/Livro.js';
import type { Venda } from '../entidades/Venda.js';

export interface FiltrosPainel {
    categoriaId: number;
    inicio: string;
    fim: string;
}

export interface Indicadores {
    faturamento: number;
    unidades: number;
    ticketMedio: number;
    totalVendas: number;
}

export interface ItemRanking {
    nome: string;
    valor: number;
}

export interface ResumoPainel {
    indicadores: Indicadores;
    destaque: ItemRanking | null;
    porCategoria: ItemRanking[];
    porLivro: ItemRanking[];
    criticos: Livro[];
    recentes: Venda[];
}

const arredondar = (valor: number): number => Math.round(valor * 100) / 100;

export class ServicoPainel {
    readonly #vendas: readonly Venda[];
    readonly #livros: readonly Livro[];

    constructor(vendas: readonly Venda[], livros: readonly Livro[]) {
        this.#vendas = vendas;
        this.#livros = livros;
    }

    resumir(filtros: FiltrosPainel): ResumoPainel {
        const vendas = this.filtrarVendas(filtros);
        const porLivro = this.somarPor(vendas, (venda) => venda.produto, (venda) => venda.quantidade);
        const porCategoria = this.somarPor(
            vendas,
            (venda) => venda.categoria,
            (venda) => venda.quantidade * venda.valorUnitario,
        );

        return {
            indicadores: this.calcularIndicadores(vendas),
            destaque: this.maiorItem(porLivro),
            porCategoria: this.maioresItens(porCategoria, 6),
            porLivro: this.maioresItens(porLivro, 5),
            criticos: this.filtrarCriticos(filtros.categoriaId),
            recentes: vendas.slice(0, 6),
        };
    }

    private filtrarVendas(filtros: FiltrosPainel): Venda[] {
        return this.#vendas.filter(
            (venda) =>
                (filtros.categoriaId === 0 || venda.categoriaId === filtros.categoriaId) &&
                (filtros.inicio === '' || venda.dataVenda >= filtros.inicio) &&
                (filtros.fim === '' || venda.dataVenda <= filtros.fim),
        );
    }

    private filtrarCriticos(categoriaId: number): Livro[] {
        return this.#livros
            .filter((livro) => livro.statusEstoque === 'critico' && (categoriaId === 0 || livro.categoriaId === categoriaId))
            .sort((a, b) => a.estoque - b.estoque);
    }

    private calcularIndicadores(vendas: Venda[]): Indicadores {
        const faturamento = arredondar(vendas.reduce((soma, venda) => soma + venda.quantidade * venda.valorUnitario, 0));
        const unidades = vendas.reduce((soma, venda) => soma + venda.quantidade, 0);
        const ticketMedio = vendas.length > 0 ? arredondar(faturamento / vendas.length) : 0;

        return { faturamento, unidades, ticketMedio, totalVendas: vendas.length };
    }

    private somarPor(
        vendas: Venda[],
        agrupador: (venda: Venda) => string,
        medida: (venda: Venda) => number,
    ): ItemRanking[] {
        const acumulado = vendas.reduce<Record<string, number>>((contagem, venda) => {
            const chave = agrupador(venda);
            contagem[chave] = (contagem[chave] ?? 0) + medida(venda);
            return contagem;
        }, {});

        return Object.entries(acumulado).map(([nome, valor]) => ({ nome, valor: arredondar(valor) }));
    }

    private maiorItem(itens: ItemRanking[]): ItemRanking | null {
        return itens.reduce<ItemRanking | null>(
            (destaque, item) => (destaque === null || item.valor > destaque.valor ? item : destaque),
            null,
        );
    }

    private maioresItens(itens: ItemRanking[], limite: number): ItemRanking[] {
        return [...itens].sort((a, b) => b.valor - a.valor).slice(0, limite);
    }
}
