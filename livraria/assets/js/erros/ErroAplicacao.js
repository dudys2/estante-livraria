export class ErroAplicacao extends Error {
    constructor(mensagem) {
        super(mensagem);
        this.name = new.target.name;
    }
}
