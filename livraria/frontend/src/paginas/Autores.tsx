import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Autor } from '@src/entidades/Autor';
import { RepositorioAutores } from '@src/repositorios/RepositorioAutores';
import { AcoesLinha } from '../componentes/AcoesLinha';
import { ModalConfirmacao } from '../componentes/ModalConfirmacao';
import { Paginacao } from '../componentes/Paginacao';
import { useAvisos } from '../contexto/AvisosContexto';
import { useAtraso } from '../hooks/useAtraso';
import { useListaPaginada } from '../hooks/useListaPaginada';
import { useTitulo } from '../hooks/useTitulo';

const POR_PAGINA = 8;

const repositorio = new RepositorioAutores();

export function Autores() {
    useTitulo('Autores');

    const navegar = useNavigate();
    const { mostrar, tratarErro } = useAvisos();
    const [textoBusca, setTextoBusca] = useState('');
    const [paraExcluir, setParaExcluir] = useState<Autor | null>(null);

    const busca = useAtraso(textoBusca.trim());
    const listar = useCallback(
        (pagina: number) => repositorio.listar({ busca, pagina, porPagina: POR_PAGINA }),
        [busca],
    );
    const { itens: autores, total, carregado, pagina, irParaPagina, recarregar } = useListaPaginada(listar);

    async function excluir(autor: Autor): Promise<void> {
        setParaExcluir(null);

        try {
            mostrar(await repositorio.excluir(autor.id));
            await recarregar();
        } catch (erro) {
            tratarErro(erro);
        }
    }

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                <div>
                    <h1 className="titulo-pagina">Autores</h1>
                    <p className="subtitulo mb-0">
                        {carregado
                            ? `${total} ${total === 1 ? 'autor cadastrado' : 'autores cadastrados'}`
                            : 'Quem escreve os livros do acervo.'}
                    </p>
                </div>
                <Link className="btn btn-primary" to="/autores/novo">
                    Novo autor
                </Link>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-md-6 col-lg-5">
                    <input
                        className="form-control"
                        type="search"
                        placeholder="Buscar por nome"
                        aria-label="Buscar autor"
                        value={textoBusca}
                        onChange={(evento) => setTextoBusca(evento.target.value)}
                    />
                </div>
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
                            {carregado && autores.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="vazio">
                                        Nenhum autor encontrado.
                                    </td>
                                </tr>
                            )}
                            {autores.map((autor) => (
                                <tr key={autor.id}>
                                    <td className="fw-medium">{autor.nome}</td>
                                    <td className="text-center">{autor.totalLivros}</td>
                                    {/* O cadastro e a edição ficam em uma tela separada da listagem. */}
                                    <AcoesLinha aoEditar={() => navegar(`/autores/${autor.id}/editar`)} aoExcluir={() => setParaExcluir(autor)} />
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
