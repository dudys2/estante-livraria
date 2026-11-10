import type { Usuario } from '../entidades/Usuario.js';

type Ouvinte = (usuario: Usuario | null) => void;

/**
 * Guarda o usuário logado em um só lugar. Qualquer página ou componente
 * pode ler o usuário ou assinar para ser avisado quando ele mudar
 * (por exemplo, o nome no menu depois de editar o perfil).
 */
export class ContextoUsuario {
    static #usuario: Usuario | null = null;
    static readonly #ouvintes = new Set<Ouvinte>();

    private constructor() {}

    static get usuario(): Usuario | null {
        return ContextoUsuario.#usuario;
    }

    static definir(usuario: Usuario | null): void {
        ContextoUsuario.#usuario = usuario;
        ContextoUsuario.#ouvintes.forEach((ouvinte) => ouvinte(usuario));
    }

    /** Chama o ouvinte já com o valor atual e devolve a função que cancela a assinatura. */
    static assinar(ouvinte: Ouvinte): () => void {
        ContextoUsuario.#ouvintes.add(ouvinte);
        ouvinte(ContextoUsuario.#usuario);

        return () => {
            ContextoUsuario.#ouvintes.delete(ouvinte);
        };
    }
}
