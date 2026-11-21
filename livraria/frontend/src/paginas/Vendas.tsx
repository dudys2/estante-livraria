import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Categoria } from '@src/entidades/Categoria';
import type { Venda } from '@src/entidades/Venda';
import { formatarData, formatarMoeda } from '@src/nucleo/formatadores';
import { RepositorioCategorias } from '@src/repositorios/RepositorioCategorias';
import { RepositorioVendas } from '@src/repositorios/RepositorioVendas';
import { AcoesLinha } from '../componentes/AcoesLinha';
import { ModalConfirmacao } from '../componentes/ModalConfirmacao';
import { Paginacao } from '../componentes/Paginacao';
import { useAvisos } from '../contexto/AvisosContexto';
import { useAtraso } from '../hooks/useAtraso';
import { useListaPaginada } from '../hooks/useListaPaginada';
import { useTitulo } from '../hooks/useTitulo';

const POR_PAGINA = 8;

const repositorio = new RepositorioVendas();
const repositorioCategorias = new RepositorioCategorias();

export function Vendas() {
    useTitulo('Vendas');

    const navegar = useNavigate();
    const { mostrar, tratarErro } = useAvisos();
    const [textoBusca, setTextoBusca] = useState('');
    const [categoriaId, setCategoriaId] = useState(0);
    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [paraExcluir, setParaExcluir] = useState<Venda | null>(null);

    const busca = useAtraso(textoBusca.trim());
    const listar = useCallback(
        (pagina: number) => repositorio.listar({ busca, categoriaId, inicio, fim, pagina, porPagina: POR_PAGINA }),
        [busca, categoriaId, inicio, fim],
    );
    const { itens: vendas, total, carregado, pagina, irParaPagina, recarregar } = useListaPaginada(listar);

    useEffect(() => {
        repositorioCategorias.listar().then(setCategorias).catch(tratarErro);
    }, [tratarErro]);

    async function excluir(venda: Venda): Promise<void> {
        setParaExcluir(null);

        try {
            mostrar(await repositorio.excluir(venda.id));
            await recarregar();
        } catch (erro) {
            tratarErro(erro);
        }
    }

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                <div>
                    <h1 className="titulo-pagina">Vendas</h1>
                    <p className="subtitulo mb-0">
                        {carregado ? `${total} ${total === 1 ? 'venda encontrada' : 'vendas encontradas'}` : 'Histórico de vendas.'}
                    </p>
                </div>
                <Link className="btn btn-primary" to="/vendas/novo">
                    Nova venda
                </Link>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-md-6 col-lg-4">
                    <input
                        className="form-control"
                        type="search"
                        placeholder="Buscar por livro"
                        aria-label="Buscar venda por livro"
                        value={textoBusca}
                        onChange={(evento) => setTextoBusca(evento.target.value)}
                    />
                </div>
                <div className="col-md-6 col-lg-3">
                    <select
                        className="form-select"
                        aria-label="Filtrar por categoria"
                        value={categoriaId}
                        onChange={(evento) => setCategoriaId(Number(evento.target.value))}
                    >
                        <option value={0}>Todas as categorias</option>
                        {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.rotulo()}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-6 col-lg-2">
                    <input
                        className="form-control"
                        type="date"
                        aria-label="Data inicial"
                        value={inicio}
                        onChange={(evento) => setInicio(evento.target.value)}
                    />
                </div>
                <div className="col-6 col-lg-2">
                    <input
                        className="form-control"
                        type="date"
                        aria-label="Data final"
                        value={fim}
                        onChange={(evento) => setFim(evento.target.value)}
                    />
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Livro</th>
                                <th>Categoria</th>
                                <th className="text-center">Qtd.</th>
                                <th className="text-end">Unitário</th>
                                <th className="text-end">Total</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregado && vendas.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="vazio">
                                        Nenhuma venda encontrada.
                                    </td>
                                </tr>
                            )}
                            {vendas.map((venda) => (
                                <tr key={venda.id}>
                                    <td>{formatarData(venda.dataVenda)}</td>
                                    <td className="fw-medium">{venda.produto}</td>
                                    <td>{venda.categoria}</td>
                                    <td className="text-center">{venda.quantidade}</td>
                                    <td className="text-end">{formatarMoeda(venda.valorUnitario)}</td>
                                    <td className="text-end fw-medium">{formatarMoeda(venda.total)}</td>
                                    <AcoesLinha aoEditar={() => navegar(`/vendas/${venda.id}/editar`)} aoExcluir={() => setParaExcluir(venda)} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Paginacao pagina={pagina} total={total} porPagina={POR_PAGINA} aoMudar={irParaPagina} />

            {paraExcluir && (
                <ModalConfirmacao
                    mensagem={`Excluir a ${paraExcluir.rotulo()}? O estoque será devolvido.`}
                    aoCancelar={() => setParaExcluir(null)}
                    aoConfirmar={() => void excluir(paraExcluir)}
                />
            )}
        </>
    );
}
