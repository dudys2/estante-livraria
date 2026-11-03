import { ErroAplicacao } from './ErroAplicacao.js';
export class ErroValidacao extends ErroAplicacao {
    campo;
    constructor(campo, mensagem) {
        super(mensagem);
        this.campo = campo;
    }
}
