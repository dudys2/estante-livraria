export type StatusEstoque = 'critico' | 'baixo' | 'normal';

export interface Categoria {
    id: number;
    nome: string;
    total_livros: number;
}

export interface Produto {
    id: number;
    titulo: string;
    autor: string;
    categoria_id: number;
    categoria: string;
    preco: number;
    estoque: number;
    status_estoque: StatusEstoque;
    unidades_vendidas: number;
    receita: number;
}

export interface Venda {
    venda_id: number;
    data_venda: string;
    produto_id: number;
    produto: string;
    categoria_id: number;
    categoria: string;
    quantidade: number;
    valor_unitario: number;
    total: number;
}

export interface RespostaLista<T> {
    dados: T[];
}

export interface RespostaPaginada<T> extends RespostaLista<T> {
    total: number;
    pagina: number;
    por_pagina: number;
}

export interface RespostaDashboard {
    vendas: Venda[];
    produtos: Produto[];
    categorias: Categoria[];
}

export interface RespostaMensagem {
    sucesso: boolean;
    mensagem: string;
    id?: number;
}
