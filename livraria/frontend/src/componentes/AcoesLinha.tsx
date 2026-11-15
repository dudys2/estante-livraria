interface PropsAcoesLinha {
    aoEditar: () => void;
    aoExcluir: () => void;
}

/** Botões "Editar" e "Excluir" das linhas das tabelas. */
export function AcoesLinha({ aoEditar, aoExcluir }: PropsAcoesLinha) {
    return (
        <td className="text-end acoes">
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={aoEditar}>
                Editar
            </button>{' '}
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={aoExcluir}>
                Excluir
            </button>
        </td>
    );
}
