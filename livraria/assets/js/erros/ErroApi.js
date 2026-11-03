import { ErroAplicacao } from './ErroAplicacao.js';
export class ErroApi extends ErroAplicacao {
    status;
    constructor(mensagem, status = 0) {
        super(mensagem);
        this.status = status;
    }
    get violaRegraDeNegocio() {
        return this.status === 409;
    }
}
