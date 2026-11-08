export type StatusEstoque = 'critico' | 'baixo' | 'normal';

export interface CategoriaDto {
    id: number;
    nome: string;
    total_livros: number;
}

export interface ProdutoDto {
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

export interface VendaDto {
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
    vendas: VendaDto[];
    produtos: ProdutoDto[];
    categorias: CategoriaDto[];
}

export interface RespostaMensagem {
    sucesso: boolean;
    mensagem: string;
    id?: number;
}

export interface UsuarioDto {
    id: number;
    nome: string;
    email: string;
}

export interface RespostaLogin extends RespostaMensagem {
    token: string;
    tipo: string;
    expira_em: number;
    usuario: UsuarioDto;
}
