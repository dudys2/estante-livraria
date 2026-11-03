import { ErroAplicacao } from './ErroAplicacao.js';

export class ErroApi extends ErroAplicacao {
    readonly status: number;

    constructor(mensagem: string, status: number = 0) {
        super(mensagem);
        this.status = status;
    }

    get violaRegraDeNegocio(): boolean {
        return this.status === 409;
    }
}
