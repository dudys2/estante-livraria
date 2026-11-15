import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { ErroApi } from '@src/erros/ErroApi';
import { ErroValidacao } from '@src/erros/ErroValidacao';
import { mensagemDoErro } from '@src/nucleo/api';

export type TipoAviso = 'success' | 'danger' | 'warning';

interface Aviso {
    id: number;
    mensagem: string;
    tipo: TipoAviso;
}

interface ValorAvisos {
    mostrar: (mensagem: string, tipo?: TipoAviso) => void;
    /** Erro de validação e conflito de regra de negócio (409) viram aviso amarelo; os demais, vermelho. */
    tratarErro: (erro: unknown) => void;
    limpar: () => void;
}

const DURACAO_MS = 6000;

const Contexto = createContext<ValorAvisos | null>(null);

/** Guarda e mostra os avisos (alertas do Bootstrap) no canto da tela. */
export function ProvedorAvisos({ children }: { children: ReactNode }) {
    const [avisos, setAvisos] = useState<Aviso[]>([]);
    const proximoId = useRef(1);

    const remover = useCallback((id: number): void => {
        setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id));
    }, []);

    const mostrar = useCallback(
        (mensagem: string, tipo: TipoAviso = 'success'): void => {
            const id = proximoId.current++;

            setAvisos((atuais) => [...atuais, { id, mensagem, tipo }]);
            window.setTimeout(() => remover(id), DURACAO_MS);
        },
        [remover],
    );

    const tratarErro = useCallback(
        (erro: unknown): void => {
            const aviso = erro instanceof ErroValidacao || (erro instanceof ErroApi && erro.violaRegraDeNegocio);
            mostrar(mensagemDoErro(erro), aviso ? 'warning' : 'danger');
        },
        [mostrar],
    );

    const limpar = useCallback((): void => setAvisos([]), []);

    // useMemo mantém o objeto estável: sem isso, as telas recarregariam os dados a cada aviso.
    const valor = useMemo(() => ({ mostrar, tratarErro, limpar }), [mostrar, tratarErro, limpar]);

    return (
        <Contexto.Provider value={valor}>
            {children}
            <div className="area-avisos" aria-live="polite">
                {avisos.map((aviso) => (
                    <div key={aviso.id} className={`alert alert-${aviso.tipo} alert-dismissible fade show shadow-sm`} role="alert">
                        {aviso.mensagem}
                        <button type="button" className="btn-close" aria-label="Fechar" onClick={() => remover(aviso.id)} />
                    </div>
                ))}
            </div>
        </Contexto.Provider>
    );
}

export function useAvisos(): ValorAvisos {
    const valor = useContext(Contexto);

    if (valor === null) {
        throw new Error('useAvisos precisa estar dentro de ProvedorAvisos.');
    }
    return valor;
}
