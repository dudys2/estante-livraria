import type { ReactNode } from 'react';

interface PropsIcone {
    tamanho?: number;
    children: ReactNode;
}

/** Moldura dos ícones de traço usados no menu e nos indicadores do painel. */
export function Icone({ tamanho = 18, children }: PropsIcone) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={tamanho}
            height={tamanho}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}
