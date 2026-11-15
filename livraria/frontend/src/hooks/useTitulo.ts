import { useEffect } from 'react';

/** Troca o título da aba do navegador. */
export function useTitulo(titulo: string): void {
    useEffect(() => {
        document.title = `${titulo} - Estante`;
    }, [titulo]);
}
