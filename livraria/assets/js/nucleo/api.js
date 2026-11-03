import { ErroApi } from '../erros/ErroApi.js';
const MENSAGEM_PADRAO = 'Não foi possível concluir a operação.';
function extrairMensagem(conteudo) {
    if (typeof conteudo === 'object' && conteudo !== null && 'mensagem' in conteudo) {
        const { mensagem } = conteudo;
        if (typeof mensagem === 'string') {
            return mensagem;
        }
    }
    return MENSAGEM_PADRAO;
}
export function mensagemDoErro(erro) {
    return erro instanceof Error ? erro.message : MENSAGEM_PADRAO;
}
export async function requisitar(url, metodo = 'GET', corpo) {
    let resposta;
    try {
        resposta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: corpo === undefined ? undefined : JSON.stringify(corpo),
        });
    }
    catch {
        throw new ErroApi('Não foi possível conectar ao servidor. Verifique se o Apache e o MariaDB estão em execução.');
    }
    const conteudo = await resposta.json().catch(() => null);
    if (!resposta.ok) {
        throw new ErroApi(extrairMensagem(conteudo), resposta.status);
    }
    return conteudo;
}
