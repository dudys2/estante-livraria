import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Categoria } from '@src/entidades/Categoria';
import type { Livro } from '@src/entidades/Livro';
import { formatarMoeda } from '@src/nucleo/formatadores';
import { RepositorioCategorias } from '@src/repositorios/RepositorioCategorias';
import { RepositorioLivros } from '@src/repositorios/RepositorioLivros';
import { AcoesLinha } from '../componentes/AcoesLinha';
import { ModalConfirmacao } from '../componentes/ModalConfirmacao';
import { Paginacao } from '../componentes/Paginacao';
import { useAvisos } from '../contexto/AvisosContexto';
import { useAtraso } from '../hooks/useAtraso';
import { useListaPaginada } from '../hooks/useListaPaginada';
import { useTitulo } from '../hooks/useTitulo';

const POR_PAGINA = 8;

const repositorio = new RepositorioLivros();
const repositorioCategorias = new RepositorioCategorias();

export function Livros() {
    useTitulo('Livros');

    const navegar = useNavigate();
    const { mostrar, tratarErro } = useAvisos();
    const [textoBusca, setTextoBusca] = useState('');
    const [categoriaId, setCategoriaId] = useState(0);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [paraExcluir, setParaExcluir] = useState<Livro | null>(null);

    const busca = useAtraso(textoBusca.trim());
    const listar = useCallback(
        (pagina: number) => repositorio.listar({ busca, categoriaId, pagina, porPagina: POR_PAGINA }),
        [busca, categoriaId],
    );
    const { itens: livros, total, carregado, pagina, irParaPagina, recarregar } = useListaPaginada(listar);

    useEffect(() => {
        repositorioCategorias.listar().then(setCategorias).catch(tratarErro);
    }, [tratarErro]);

    async function excluir(livro: Livro): Promise<void> {
        setParaExcluir(null);

        try {
            mostrar(await repositorio.excluir(livro.id));
            await recarregar();
        } catch (erro) {
            tratarErro(erro);
        }
    }

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                <div>
                    <h1 className="titulo-pagina">Livros</h1>
                    <p className="subtitulo mb-0">
                        {carregado ? `${total} ${total === 1 ? 'livro cadastrado' : 'livros cadastrados'}` : 'Acervo e estoque.'}
                    </p>
                </div>
                <Link className="btn btn-primary" to="/livros/novo">
                    Novo livro
                </Link>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-md-6 col-lg-5">
                    <input
                        className="form-control"
                        type="search"
                        placeholder="Buscar por título ou autor"
                        aria-label="Buscar livro"
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
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Livro</th>
                                <th>Categoria</th>
                                <th className="text-end">Preço</th>
                                <th className="text-center">Estoque</th>
                                <th className="text-center">Vendidos</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregado && livros.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="vazio">
                                        Nenhum livro encontrado.
                                    </td>
                                </tr>
                            )}
                            {livros.map((livro) => (
                                <tr key={livro.id}>
                                    <td>
                                        <div className="fw-medium">{livro.titulo}</div>
                                        <div className="texto-suave">{livro.autor}</div>
                                    </td>
                                    <td>{livro.categoria}</td>
                                    <td className="text-end">{formatarMoeda(livro.preco)}</td>
                                    <td className="text-center">
                                        <span className={`selo selo-${livro.statusEstoque}`}>{livro.estoque}</span>
                                    </td>
                                    <td className="text-center">{livro.unidadesVendidas}</td>
                                    <AcoesLinha aoEditar={() => navegar(`/livros/${livro.id}/editar`)} aoExcluir={() => setParaExcluir(livro)} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Paginacao pagina={pagina} total={total} porPagina={POR_PAGINA} aoMudar={irParaPagina} />

            {paraExcluir && (
                <ModalConfirmacao
                    mensagem={`Excluir "${paraExcluir.rotulo()}"?`}
                    aoCancelar={() => setParaExcluir(null)}
                    aoConfirmar={() => void excluir(paraExcluir)}
                />
            )}
        </>
    );
}
