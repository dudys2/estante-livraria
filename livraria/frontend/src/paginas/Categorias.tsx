import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Categoria } from '@src/entidades/Categoria';
import { RepositorioCategorias } from '@src/repositorios/RepositorioCategorias';
import { AcoesLinha } from '../componentes/AcoesLinha';
import { ModalConfirmacao } from '../componentes/ModalConfirmacao';
import { Paginacao } from '../componentes/Paginacao';
import { useAvisos } from '../contexto/AvisosContexto';
import { useListaPaginada } from '../hooks/useListaPaginada';
import { useTitulo } from '../hooks/useTitulo';

const POR_PAGINA = 8;

const repositorio = new RepositorioCategorias();

export function Categorias() {
    useTitulo('Categorias');

    const navegar = useNavigate();
    const { mostrar, tratarErro } = useAvisos();
    const [paraExcluir, setParaExcluir] = useState<Categoria | null>(null);

    const listar = useCallback((pagina: number) => repositorio.listarPaginado(pagina, POR_PAGINA), []);
    const { itens: categorias, total, carregado, pagina, irParaPagina, recarregar } = useListaPaginada(listar);

    async function excluir(categoria: Categoria): Promise<void> {
        setParaExcluir(null);

        try {
            mostrar(await repositorio.excluir(categoria.id));
            await recarregar();
        } catch (erro) {
            tratarErro(erro);
        }
    }

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                <div>
                    <h1 className="titulo-pagina">Categorias</h1>
                    <p className="subtitulo mb-0">Organize os livros por assunto.</p>
                </div>
                <Link className="btn btn-primary" to="/categorias/novo">
                    Nova categoria
                </Link>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th className="text-center">Livros</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carregado && categorias.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="vazio">
                                        Nenhuma categoria cadastrada.
                                    </td>
                                </tr>
                            )}
                            {categorias.map((categoria) => (
                                <tr key={categoria.id}>
                                    <td className="fw-medium">{categoria.nome}</td>
                                    <td className="text-center">{categoria.totalLivros}</td>
                                    <AcoesLinha aoEditar={() => navegar(`/categorias/${categoria.id}/editar`)} aoExcluir={() => setParaExcluir(categoria)} />
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
