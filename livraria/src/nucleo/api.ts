import { ErroApi } from '../erros/ErroApi.js';
import { Sessao } from './sessao.js';

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

const MENSAGEM_PADRAO = 'Não foi possível concluir a operação.';

function extrairMensagem(conteudo: unknown): string {
    if (typeof conteudo === 'object' && conteudo !== null && 'mensagem' in conteudo) {
        const { mensagem } = conteudo as { mensagem: unknown };
        if (typeof mensagem === 'string') {
            return mensagem;
        }
    }
    return MENSAGEM_PADRAO;
}

export function mensagemDoErro(erro: unknown): string {
    return erro instanceof Error ? erro.message : MENSAGEM_PADRAO;
}

export async function requisitar<T>(url: string, metodo: Metodo = 'GET', corpo?: object): Promise<T> {
    let resposta: Response;

    const token = Sessao.token();
    const cabecalhos: Record<string, string> = { 'Content-Type': 'application/json' };

    if (token !== null) {
        cabecalhos['Authorization'] = `Bearer ${token}`;
    }

    try {
        resposta = await fetch(url, {
            method: metodo,
            headers: cabecalhos,
            body: corpo === undefined ? undefined : JSON.stringify(corpo),
        });
    } catch {
        throw new ErroApi('Não foi possível conectar ao servidor. Verifique se o Apache e o MariaDB estão em execução.');
    }

    const conteudo: unknown = await resposta.json().catch(() => null);

    if (resposta.status === 401 && token !== null) {
        Sessao.encerrar();
    }

    if (!resposta.ok) {
        throw new ErroApi(extrairMensagem(conteudo), resposta.status);
    }
    return conteudo as T;
}
