import { ErroValidacao } from '../erros/ErroValidacao.js';
import { Entidade } from './Entidade.js';
export class Venda extends Entidade {
    #quantidade = 0;
    #valorUnitario = 0;
    #dataVenda = '';
    produtoId;
    produto;
    categoriaId;
    categoria;
    constructor(dados) {
        super(dados.id);
        if (!Number.isInteger(dados.produtoId) || dados.produtoId < 1) {
            throw new ErroValidacao('o livro', 'Selecione o livro vendido.');
        }
        this.quantidade = dados.quantidade;
        this.dataVenda = dados.dataVenda;
        if (dados.valorUnitario !== undefined) {
            this.#valorUnitario = Entidade.dinheiro('o valor unitário', dados.valorUnitario);
        }
        this.produtoId = dados.produtoId;
        this.produto = dados.produto ?? '';
        this.categoriaId = dados.categoriaId ?? 0;
        this.categoria = dados.categoria ?? '';
    }
    static deApi(dto) {
        return new Venda({
            id: dto.venda_id,
            produtoId: dto.produto_id,
            produto: dto.produto,
            categoriaId: dto.categoria_id,
            categoria: dto.categoria,
            quantidade: dto.quantidade,
            valorUnitario: dto.valor_unitario,
            dataVenda: dto.data_venda,
        });
    }
    get quantidade() {
        return this.#quantidade;
    }
    set quantidade(valor) {
        this.#quantidade = Entidade.inteiro('a quantidade', valor, 1);
    }
    get dataVenda() {
        return this.#dataVenda;
    }
    set dataVenda(valor) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(Date.parse(valor))) {
            throw new ErroValidacao('a data', 'Informe uma data de venda válida.');
        }
        this.#dataVenda = valor;
    }
    get valorUnitario() {
        return this.#valorUnitario;
    }
    get total() {
        return Math.round(this.#quantidade * this.#valorUnitario * 100) / 100;
    }
    rotulo() {
        return `venda de "${this.produto}"`;
    }
    paraApi() {
        return { produto_id: this.produtoId, quantidade: this.#quantidade, data_venda: this.#dataVenda };
    }
}
