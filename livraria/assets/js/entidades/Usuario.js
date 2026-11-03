import { ErroValidacao } from '../erros/ErroValidacao.js';
import { formatarCpf, validarCpf, validarEmail } from '../nucleo/validadores.js';
import { Entidade } from './Entidade.js';
export class Usuario extends Entidade {
    #nome = '';
    #email = '';
    #cpf = '';
    constructor(dados) {
        super(dados.id);
        this.nome = dados.nome;
        this.email = dados.email;
        if (dados.cpf !== undefined) {
            this.cpf = dados.cpf;
        }
    }
    get nome() {
        return this.#nome;
    }
    set nome(valor) {
        this.#nome = Entidade.texto('o nome', valor, 120);
    }
    get email() {
        return this.#email;
    }
    set email(valor) {
        const limpo = valor.trim().toLowerCase();
        if (!validarEmail(limpo) || limpo.length > 150) {
            throw new ErroValidacao('o e-mail', 'Informe um e-mail válido.');
        }
        this.#email = limpo;
    }
    get cpf() {
        return this.#cpf;
    }
    set cpf(valor) {
        if (!validarCpf(valor)) {
            throw new ErroValidacao('o CPF', 'Informe um CPF válido.');
        }
        this.#cpf = valor.replace(/\D/g, '');
    }
    get cpfFormatado() {
        return formatarCpf(this.#cpf);
    }
    rotulo() {
        return this.#nome;
    }
}
