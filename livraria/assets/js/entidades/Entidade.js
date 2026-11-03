import { ErroValidacao } from '../erros/ErroValidacao.js';
export class Entidade {
    id;
    constructor(id = 0) {
        if (!Number.isInteger(id) || id < 0) {
            throw new ErroValidacao('id', 'Identificador inválido.');
        }
        this.id = id;
    }
    get persistida() {
        return this.id > 0;
    }
    static texto(campo, valor, maximo) {
        const limpo = valor.trim();
        if (limpo === '' || limpo.length > maximo) {
            throw new ErroValidacao(campo, `Informe ${campo} com até ${maximo} caracteres.`);
        }
        return limpo;
    }
    static inteiro(campo, valor, minimo) {
        if (!Number.isInteger(valor) || valor < minimo) {
            throw new ErroValidacao(campo, `Informe ${campo} como número inteiro maior ou igual a ${minimo}.`);
        }
        return valor;
    }
    static dinheiro(campo, valor) {
        if (!Number.isFinite(valor) || valor <= 0) {
            throw new ErroValidacao(campo, `Informe ${campo} com valor maior que zero.`);
        }
        return Math.round(valor * 100) / 100;
    }
}
