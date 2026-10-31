const arredondar = (valor) => Math.round(valor * 100) / 100;
export function filtrarVendas(vendas, filtros) {
    return vendas.filter((venda) => (filtros.categoriaId === 0 || venda.categoria_id === filtros.categoriaId) &&
        (filtros.inicio === '' || venda.data_venda >= filtros.inicio) &&
        (filtros.fim === '' || venda.data_venda <= filtros.fim));
}
export function filtrarCriticos(produtos, categoriaId) {
    return produtos
        .filter((produto) => produto.status_estoque === 'critico' && (categoriaId === 0 || produto.categoria_id === categoriaId))
        .sort((a, b) => a.estoque - b.estoque);
}
export function calcularIndicadores(vendas) {
    const faturamento = arredondar(vendas.reduce((soma, venda) => soma + venda.quantidade * venda.valor_unitario, 0));
    const unidades = vendas.reduce((soma, venda) => soma + venda.quantidade, 0);
    const ticketMedio = vendas.length > 0 ? arredondar(faturamento / vendas.length) : 0;
    return { faturamento, unidades, ticketMedio, totalVendas: vendas.length };
}
export function somarPor(vendas, agrupador, medida) {
    const acumulado = vendas.reduce((contagem, venda) => {
        const chave = agrupador(venda);
        contagem[chave] = (contagem[chave] ?? 0) + medida(venda);
        return contagem;
    }, {});
    return Object.entries(acumulado).map(([nome, valor]) => ({ nome, valor: arredondar(valor) }));
}
export function maiorItem(itens) {
    return itens.reduce((destaque, item) => (destaque === null || item.valor > destaque.valor ? item : destaque), null);
}
export function maioresItens(itens, limite) {
    return [...itens].sort((a, b) => b.valor - a.valor).slice(0, limite);
}
export function paraBarras(itens, formatar) {
    const maximo = itens.reduce((maior, item) => Math.max(maior, item.valor), 0);
    return itens.map((item) => ({
        rotulo: item.nome,
        texto: formatar(item.valor),
        percentual: maximo > 0 ? (item.valor / maximo) * 100 : 0,
    }));
}
