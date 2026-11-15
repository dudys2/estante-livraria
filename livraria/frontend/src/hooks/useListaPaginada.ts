import { useCallback, useEffect, useRef, useState } from 'react';
import type { Pagina } from '@src/repositorios/Repositorio';
import { useAvisos } from '../contexto/AvisosContexto';

/**
 * Carrega uma listagem paginada (o padrão que livros, vendas, autores e categorias repetiam).
 *
 * `listar` deve ser criada com useCallback e mudar apenas quando os filtros mudarem:
 * quando isso acontece, a página volta para 1 e a lista é buscada de novo.
 */
export function useListaPaginada<T>(listar: (pagina: number) => Promise<Pagina<T>>) {
    const { tratarErro } = useAvisos();
    const [estado, setEstado] = useState({ listar, pagina: 1 });
    const [resultado, setResultado] = useState<Pagina<T> | null>(null);
    const ultimaRequisicao = useRef(0);

    // Se os filtros mudaram (listar é outra função), a página atual deixa de valer.
    const pagina = estado.listar === listar ? estado.pagina : 1;

    const irParaPagina = useCallback((destino: number): void => setEstado({ listar, pagina: destino }), [listar]);

    const recarregar = useCallback(async (): Promise<void> => {
        // Só a resposta da requisição mais recente é usada (evita lista antiga sobrescrever a nova).
        const numero = ++ultimaRequisicao.current;

        try {
            const nova = await listar(pagina);

            if (numero !== ultimaRequisicao.current) {
                return;
            }
            // Excluiu o último item da página: volta uma página.
            if (nova.itens.length === 0 && pagina > 1) {
                irParaPagina(pagina - 1);
                return;
            }
            setResultado(nova);
        } catch (erro) {
            tratarErro(erro);
        }
    }, [listar, pagina, irParaPagina, tratarErro]);

    useEffect(() => {
        void recarregar();
    }, [recarregar]);

    return {
        itens: resultado?.itens ?? [],
        total: resultado?.total ?? 0,
        carregado: resultado !== null,
        pagina,
        irParaPagina,
        recarregar,
    };
}
