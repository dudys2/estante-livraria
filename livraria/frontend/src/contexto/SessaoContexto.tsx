import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ContextoUsuario } from '@src/contexto/ContextoUsuario';
import type { Usuario } from '@src/entidades/Usuario';
import { Sessao } from '@src/nucleo/sessao';
import { RepositorioUsuarios } from '@src/repositorios/RepositorioUsuarios';
import { useAvisos } from './AvisosContexto';

interface ValorSessao {
    logado: boolean;
    usuario: Usuario | null;
    /** Relê o token salvo. Chame depois de entrar ou sair. */
    sincronizar: () => void;
}

const Contexto = createContext<ValorSessao | null>(null);

/**
 * Liga a Sessao e o ContextoUsuario (camada em livraria/src) ao React.
 * Se há sessão ativa, carrega o perfil do usuário no ContextoUsuario.
 */
export function ProvedorSessao({ children }: { children: ReactNode }) {
    const { tratarErro } = useAvisos();
    const [logado, setLogado] = useState<boolean>(Sessao.ativa);
    const [usuario, setUsuario] = useState<Usuario | null>(ContextoUsuario.usuario);

    const sincronizar = useCallback((): void => setLogado(Sessao.ativa), []);

    // O ContextoUsuario continua sendo a fonte do usuário logado; aqui só o assinamos.
    useEffect(() => ContextoUsuario.assinar(setUsuario), []);

    useEffect(() => {
        if (!logado) {
            return;
        }

        new RepositorioUsuarios()
            .buscarPerfil()
            .then((perfil) => ContextoUsuario.definir(perfil))
            .catch((erro: unknown) => {
                sincronizar();
                tratarErro(erro);
            });
    }, [logado, sincronizar, tratarErro]);

    const valor = useMemo(() => ({ logado, usuario, sincronizar }), [logado, usuario, sincronizar]);

    return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessao(): ValorSessao {
    const valor = useContext(Contexto);

    if (valor === null) {
        throw new Error('useSessao precisa estar dentro de ProvedorSessao.');
    }
    return valor;
}
