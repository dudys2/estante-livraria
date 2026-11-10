import { ContextoUsuario } from '../contexto/ContextoUsuario.js';
import { RepositorioUsuarios } from '../repositorios/RepositorioUsuarios.js';
import { obter } from './dom.js';
import { Sessao } from './sessao.js';
import { tratarErro } from './ui.js';

/** Roda em todas as páginas: ajusta o menu e carrega o usuário logado no contexto. */
const nomeUsuario = obter('nomeUsuario', HTMLElement);
const botaoSair = obter('botaoSair', HTMLButtonElement);

function ajustarMenu(logado: boolean): void {
    document.querySelectorAll<HTMLElement>('[data-visivel]').forEach((item) => {
        item.hidden = (item.dataset['visivel'] === 'logado') !== logado;
    });
}

ContextoUsuario.assinar((usuario) => {
    if (nomeUsuario) {
        nomeUsuario.textContent = usuario?.nome ?? '';
    }
});

botaoSair?.addEventListener('click', () => {
    Sessao.encerrar();
    ContextoUsuario.definir(null);
    window.location.assign('login.php');
});

ajustarMenu(Sessao.ativa);

if (Sessao.ativa) {
    new RepositorioUsuarios()
        .buscarPerfil()
        .then((usuario) => ContextoUsuario.definir(usuario))
        .catch((erro: unknown) => {
            ajustarMenu(Sessao.ativa);
            tratarErro(erro);
        });
}
