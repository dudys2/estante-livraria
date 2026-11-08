const CHAVE_TOKEN = 'estante.token';
function lerPayload(token) {
    try {
        const corpo = token.split('.')[1] ?? '';
        const base64 = corpo.replace(/-/g, '+').replace(/_/g, '/');
        const texto = new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));
        return JSON.parse(texto);
    }
    catch {
        return null;
    }
}
export class Sessao {
    constructor() { }
    static salvar(token) {
        try {
            window.localStorage.setItem(CHAVE_TOKEN, token);
        }
        catch {
            // Armazenamento indisponível (modo privado, por exemplo): o usuário terá de entrar de novo.
        }
    }
    static token() {
        try {
            const token = window.localStorage.getItem(CHAVE_TOKEN);
            return token !== null && !Sessao.expirado(token) ? token : null;
        }
        catch {
            return null;
        }
    }
    static encerrar() {
        try {
            window.localStorage.removeItem(CHAVE_TOKEN);
        }
        catch {
            // Nada a remover.
        }
    }
    static get ativa() {
        return Sessao.token() !== null;
    }
    static expirado(token) {
        const exp = lerPayload(token)?.exp;
        return typeof exp !== 'number' || exp * 1000 <= Date.now();
    }
}
