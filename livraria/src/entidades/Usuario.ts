import { ErroValidacao } from '../erros/ErroValidacao.js';
import { formatarCpf, validarCpf, validarEmail } from '../nucleo/validadores.js';
import { Entidade } from './Entidade.js';

export interface DadosUsuario {
    id?: number;
    nome: string;
    email: string;
    cpf?: string;
}

export class Usuario extends Entidade {
    #nome = '';
    #email = '';
    #cpf = '';

    constructor(dados: DadosUsuario) {
        super(dados.id);
        this.nome = dados.nome;
        this.email = dados.email;
        if (dados.cpf !== undefined) {
            this.cpf = dados.cpf;
        }
    }

    get nome(): string {
        return this.#nome;
    }

    set nome(valor: string) {
        this.#nome = Entidade.texto('o nome', valor, 120);
    }

    get email(): string {
        return this.#email;
    }

    set email(valor: string) {
        const limpo = valor.trim().toLowerCase();

        if (!validarEmail(limpo) || limpo.length > 150) {
            throw new ErroValidacao('o e-mail', 'Informe um e-mail válido.');
        }
        this.#email = limpo;
    }

    get cpf(): string {
        return this.#cpf;
    }

    set cpf(valor: string) {
        if (!validarCpf(valor)) {
            throw new ErroValidacao('o CPF', 'Informe um CPF válido.');
        }
        this.#cpf = valor.replace(/\D/g, '');
    }

    get cpfFormatado(): string {
        return formatarCpf(this.#cpf);
    }

    rotulo(): string {
        return this.#nome;
    }
}
