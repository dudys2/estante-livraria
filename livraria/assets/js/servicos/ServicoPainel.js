const arredondar = (valor) => Math.round(valor * 100) / 100;
export class ServicoPainel {
    #vendas;
    #livros;
    constructor(vendas, livros) {
        this.#vendas = vendas;
        this.#livros = livros;
    }
    resumir(filtros) {
        const vendas = this.filtrarVendas(filtros);
        const porLivro = this.somarPor(vendas, (venda) => venda.produto, (venda) => venda.quantidade);
        const porCategoria = this.somarPor(vendas, (venda) => venda.categoria, (venda) => venda.quantidade * venda.valorUnitario);
        return {
            indicadores: this.calcularIndicadores(vendas),
            destaque: this.maiorItem(porLivro),
            porCategoria: this.maioresItens(porCategoria, 6),
            porLivro: this.maioresItens(porLivro, 5),
            criticos: this.filtrarCriticos(filtros.categoriaId),
            recentes: vendas.slice(0, 6),
        };
    }
    filtrarVendas(filtros) {
        return this.#vendas.filter((venda) => (filtros.categoriaId === 0 || venda.categoriaId === filtros.categoriaId) &&
            (filtros.inicio === '' || venda.dataVenda >= filtros.inicio) &&
            (filtros.fim === '' || venda.dataVenda <= filtros.fim));
    }
    filtrarCriticos(categoriaId) {
        return this.#livros
            .filter((livro) => livro.statusEstoque === 'critico' && (categoriaId === 0 || livro.categoriaId === categoriaId))
            .sort((a, b) => a.estoque - b.estoque);
    }
    calcularIndicadores(vendas) {
        const faturamento = arredondar(vendas.reduce((soma, venda) => soma + venda.quantidade * venda.valorUnitario, 0));
        const unidades = vendas.reduce((soma, venda) => soma + venda.quantidade, 0);
        const ticketMedio = vendas.length > 0 ? arredondar(faturamento / vendas.length) : 0;
        return { faturamento, unidades, ticketMedio, totalVendas: vendas.length };
    }
    somarPor(vendas, agrupador, medida) {
        const acumulado = vendas.reduce((contagem, venda) => {
            const chave = agrupador(venda);
            contagem[chave] = (contagem[chave] ?? 0) + medida(venda);
            return contagem;
        }, {});
        return Object.entries(acumulado).map(([nome, valor]) => ({ nome, valor: arredondar(valor) }));
    }
    maiorItem(itens) {
        return itens.reduce((destaque, item) => (destaque === null || item.valor > destaque.valor ? item : destaque), null);
    }
    maioresItens(itens, limite) {
        return [...itens].sort((a, b) => b.valor - a.valor).slice(0, limite);
    }
}
