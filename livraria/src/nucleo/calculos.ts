import type { Produto, Venda } from './tipos.js';

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

export interface LinhaBarra {
    rotulo: string;
    texto: string;
    percentual: number;
}

const arredondar = (valor: number): number => Math.round(valor * 100) / 100;

export function filtrarVendas(vendas: Venda[], filtros: FiltrosPainel): Venda[] {
    return vendas.filter(
        (venda) =>
            (filtros.categoriaId === 0 || venda.categoria_id === filtros.categoriaId) &&
            (filtros.inicio === '' || venda.data_venda >= filtros.inicio) &&
            (filtros.fim === '' || venda.data_venda <= filtros.fim),
    );
}

export function filtrarCriticos(produtos: Produto[], categoriaId: number): Produto[] {
    return produtos
        .filter(
            (produto) =>
                produto.status_estoque === 'critico' && (categoriaId === 0 || produto.categoria_id === categoriaId),
        )
        .sort((a, b) => a.estoque - b.estoque);
}

export function calcularIndicadores(vendas: Venda[]): Indicadores {
    const faturamento = arredondar(vendas.reduce((soma, venda) => soma + venda.quantidade * venda.valor_unitario, 0));
    const unidades = vendas.reduce((soma, venda) => soma + venda.quantidade, 0);
    const ticketMedio = vendas.length > 0 ? arredondar(faturamento / vendas.length) : 0;

    return { faturamento, unidades, ticketMedio, totalVendas: vendas.length };
}

export function somarPor(
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

export function maiorItem(itens: ItemRanking[]): ItemRanking | null {
    return itens.reduce<ItemRanking | null>(
        (destaque, item) => (destaque === null || item.valor > destaque.valor ? item : destaque),
        null,
    );
}

export function maioresItens(itens: ItemRanking[], limite: number): ItemRanking[] {
    return [...itens].sort((a, b) => b.valor - a.valor).slice(0, limite);
}

export function paraBarras(itens: ItemRanking[], formatar: (valor: number) => string): LinhaBarra[] {
    const maximo = itens.reduce((maior, item) => Math.max(maior, item.valor), 0);

    return itens.map((item) => ({
        rotulo: item.nome,
        texto: formatar(item.valor),
        percentual: maximo > 0 ? (item.valor / maximo) * 100 : 0,
    }));
}
