/**
 * Guarda o usuário logado em um só lugar. Qualquer página ou componente
 * pode ler o usuário ou assinar para ser avisado quando ele mudar
 * (por exemplo, o nome no menu depois de editar o perfil).
 */
export class ContextoUsuario {
    static #usuario = null;
    static #ouvintes = new Set();
    constructor() { }
    static get usuario() {
        return ContextoUsuario.#usuario;
    }
    static definir(usuario) {
        ContextoUsuario.#usuario = usuario;
        ContextoUsuario.#ouvintes.forEach((ouvinte) => ouvinte(usuario));
    }
    /** Chama o ouvinte já com o valor atual e devolve a função que cancela a assinatura. */
    static assinar(ouvinte) {
        ContextoUsuario.#ouvintes.add(ouvinte);
        ouvinte(ContextoUsuario.#usuario);
        return () => {
            ContextoUsuario.#ouvintes.delete(ouvinte);
        };
    }
}
