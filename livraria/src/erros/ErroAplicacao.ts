export abstract class ErroAplicacao extends Error {
    protected constructor(mensagem: string) {
        super(mensagem);
        this.name = new.target.name;
    }
}
