interface PropsPaginacao {
    pagina: number;
    total: number;
    porPagina: number;
    aoMudar: (pagina: number) => void;
}

interface PropsItemPagina {
    rotulo: string;
    destino: number;
    desativado?: boolean;
    ativo?: boolean;
    aoMudar: (pagina: number) => void;
}

function ItemPagina({ rotulo, destino, desativado = false, ativo = false, aoMudar }: PropsItemPagina) {
    return (
        <li className={`page-item${desativado ? ' disabled' : ''}${ativo ? ' active' : ''}`}>
            <button type="button" className="page-link" onClick={() => aoMudar(destino)}>
                {rotulo}
            </button>
        </li>
    );
}

/** Botões de paginação: só aparecem quando há mais de uma página. */
export function Paginacao({ pagina, total, porPagina, aoMudar }: PropsPaginacao) {
    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
    const numeros = Array.from({ length: totalPaginas }, (_, indice) => indice + 1);

    return (
        <nav className="mt-3" aria-label="Paginação">
            {totalPaginas > 1 && (
                <ul className="pagination pagination-sm mb-0 justify-content-end">
                    <ItemPagina rotulo="Anterior" destino={pagina - 1} desativado={pagina <= 1} aoMudar={aoMudar} />
                    {numeros.map((numero) => (
                        <ItemPagina key={numero} rotulo={String(numero)} destino={numero} ativo={numero === pagina} aoMudar={aoMudar} />
                    ))}
                    <ItemPagina rotulo="Próxima" destino={pagina + 1} desativado={pagina >= totalPaginas} aoMudar={aoMudar} />
                </ul>
            )}
        </nav>
    );
}
