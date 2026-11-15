import { useEffect, useState } from 'react';

/** Devolve o valor só depois que ele para de mudar (usado nos campos de busca). */
export function useAtraso<T>(valor: T, milissegundos: number = 300): T {
    const [atrasado, setAtrasado] = useState<T>(valor);

    useEffect(() => {
        const temporizador = window.setTimeout(() => setAtrasado(valor), milissegundos);

        return () => window.clearTimeout(temporizador);
    }, [valor, milissegundos]);

    return atrasado;
}
