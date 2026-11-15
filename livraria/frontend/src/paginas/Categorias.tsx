import { useCallback, useState, type FormEvent } from 'react';
import { Categoria } from '@src/entidades/Categoria';
import { RepositorioCategorias } from '@src/repositorios/RepositorioCategorias';
import { AcoesLinha } from '../componentes/AcoesLinha';
import { Campo } from '../componentes/Campo';
import { Modal } from '../componentes/Modal';
import { ModalConfirmacao } from '../componentes/ModalConfirmacao';
import { Paginacao } from '../componentes/Paginacao';
import { useAvisos } from '../contexto/AvisosContexto';
import { useListaPaginada } from '../hooks/useListaPaginada';
import { useTitulo } from '../hooks/useTitulo';

const POR_PAGINA = 8;

const repositorio = new RepositorioCategorias();

interface FormularioCategoria {
    id: number;
    nome: string;
}

export function Categorias() {
    useTitulo('Categorias');

    const { mostrar, tratarErro } = useAvisos();
    const [formulario, setFormulario] = useState<FormularioCategoria | null>(null);
    const [validado, setValidado] = useState(false);
    const [paraExcluir, setParaExcluir] = useState<Categoria | null>(null);

    const listar = useCallback((pagina: number) => repositorio.listarPaginado(pagina, POR_PAGINA), []);
    const { itens: categorias, total, carregado, pagina, irParaPagina, recarregar } = useListaPaginada(listar);

    function abrirFormulario(categoria?: Categoria): void {
        setValidado(false);
        setFormulario({ id: categoria ? categoria.id : 0, nome: categoria ? categoria.nome : '' });
    }

    async function salvar(evento: FormEvent<HTMLFormElement>): Promise<void> {
        evento.preventDefault();

        if (formulario === null) {
            return;
        }
        if (!evento.currentTarget.checkValidity()) {
            setValidado(true);
            return;
        }

        try {
            const categoria = new Categoria({ id: formulario.id, nome: formulario.nome });
            const mensagem = await repositorio.salvar(categoria);

            setFormulario(null);
            mostrar(mensagem);
            await recarregar();
        } catch (erro) {
            tratarErro(erro);
        }
    }

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
                <button type="button" className="btn btn-primary" onClick={() => abrirFormulario()}>
                    Nova categoria
                </button>
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
                                    <AcoesLinha aoEditar={() => abrirFormulario(categoria)} aoExcluir={() => setParaExcluir(categoria)} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Paginacao pagina={pagina} total={total} porPagina={POR_PAGINA} aoMudar={irParaPagina} />

            {formulario && (
                <Modal aoFechar={() => setFormulario(null)}>
                    <form
                        className={`modal-content${validado ? ' was-validated' : ''}`}
                        noValidate
                        onSubmit={(evento) => void salvar(evento)}
                    >
                        <div className="modal-header border-0">
                            <h2 className="modal-title fs-5">{formulario.id > 0 ? 'Editar categoria' : 'Nova categoria'}</h2>
                            <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setFormulario(null)} />
                        </div>
                        <div className="modal-body">
                            <Campo
                                id="campoNome"
                                rotulo="Nome"
                                maxLength={60}
                                required
                                classeGrupo=""
                                value={formulario.nome}
                                mensagem="Informe o nome da categoria."
                                onChange={(evento) => setFormulario({ ...formulario, nome: evento.target.value })}
                            />
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-light" onClick={() => setFormulario(null)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

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
