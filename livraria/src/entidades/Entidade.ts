import { ErroValidacao } from '../erros/ErroValidacao.js';

export abstract class Entidade {
    readonly id: number;

    protected constructor(id: number = 0) {
        if (!Number.isInteger(id) || id < 0) {
            throw new ErroValidacao('id', 'Identificador inválido.');
        }
        this.id = id;
    }

    abstract rotulo(): string;

    get persistida(): boolean {
        return this.id > 0;
    }

    protected static texto(campo: string, valor: string, maximo: number): string {
        const limpo = valor.trim();

        if (limpo === '' || limpo.length > maximo) {
            throw new ErroValidacao(campo, `Informe ${campo} com até ${maximo} caracteres.`);
        }
        return limpo;
    }

    protected static inteiro(campo: string, valor: number, minimo: number): number {
        if (!Number.isInteger(valor) || valor < minimo) {
            throw new ErroValidacao(campo, `Informe ${campo} como número inteiro maior ou igual a ${minimo}.`);
        }
        return valor;
    }

    protected static dinheiro(campo: string, valor: number): number {
        if (!Number.isFinite(valor) || valor <= 0) {
            throw new ErroValidacao(campo, `Informe ${campo} com valor maior que zero.`);
        }
        return Math.round(valor * 100) / 100;
    }
}
