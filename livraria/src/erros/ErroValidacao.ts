import { ErroAplicacao } from './ErroAplicacao.js';

export class ErroValidacao extends ErroAplicacao {
    readonly campo: string;

    constructor(campo: string, mensagem: string) {
        super(mensagem);
        this.campo = campo;
    }
}
