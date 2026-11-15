import { useEffect, type ReactNode } from 'react';

interface PropsModal {
    aoFechar: () => void;
    tamanho?: 'sm';
    children: ReactNode;
}

/** Modal do Bootstrap feito só com classes e estado do React (não usa o JavaScript do Bootstrap). */
export function Modal({ aoFechar, tamanho, children }: PropsModal) {
    useEffect(() => {
        const aoTeclar = (evento: KeyboardEvent): void => {
            if (evento.key === 'Escape') {
                aoFechar();
            }
        };

        document.body.classList.add('modal-open');
        document.addEventListener('keydown', aoTeclar);

        return () => {
            document.body.classList.remove('modal-open');
            document.removeEventListener('keydown', aoTeclar);
        };
    }, [aoFechar]);

    return (
        <>
            <div
                className="modal fade show d-block"
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                onMouseDown={(evento) => {
                    // Clicar fora da caixa fecha o modal.
                    if (evento.target === evento.currentTarget) {
                        aoFechar();
                    }
                }}
            >
                <div className={`modal-dialog modal-dialog-centered${tamanho ? ` modal-${tamanho}` : ''}`}>{children}</div>
            </div>
            <div className="modal-backdrop fade show" />
        </>
    );
}
