const CHAVE_TOKEN = 'estante.token';

interface PayloadToken {
    exp?: number;
}

function lerPayload(token: string): PayloadToken | null {
    try {
        const corpo = token.split('.')[1] ?? '';
        const base64 = corpo.replace(/-/g, '+').replace(/_/g, '/');
        const texto = new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));
        return JSON.parse(texto) as PayloadToken;
    } catch {
        return null;
    }
}

export class Sessao {
    private constructor() {}

    static salvar(token: string): void {
        try {
            window.localStorage.setItem(CHAVE_TOKEN, token);
        } catch {
            // Armazenamento indisponível (modo privado, por exemplo): o usuário terá de entrar de novo.
        }
    }

    static token(): string | null {
        try {
            const token = window.localStorage.getItem(CHAVE_TOKEN);
            return token !== null && !Sessao.expirado(token) ? token : null;
        } catch {
            return null;
        }
    }

    static encerrar(): void {
        try {
            window.localStorage.removeItem(CHAVE_TOKEN);
        } catch {
            // Nada a remover.
        }
    }

    static get ativa(): boolean {
        return Sessao.token() !== null;
    }

    private static expirado(token: string): boolean {
        const exp = lerPayload(token)?.exp;
        return typeof exp !== 'number' || exp * 1000 <= Date.now();
    }
}
