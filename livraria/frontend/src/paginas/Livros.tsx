import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { Categoria } from '@src/entidades/Categoria';
import { Livro } from '@src/entidades/Livro';
import { formatarMoeda } from '@src/nucleo/formatadores';
import { RepositorioCategorias } from '@src/repositorios/RepositorioCategorias';
import { RepositorioLivros } from '@src/repositorios/RepositorioLivros';
import { AcoesLinha } from '../componentes/AcoesLinha';
import { Campo } from '../componentes/Campo';
import { Modal } from '../componentes/Modal';
import { ModalConfirmacao } from '../componentes/ModalConfirmacao';
import { Paginacao } from '../componentes/Paginacao';
import { useAvisos } from '../contexto/AvisosContexto';
import { useAtraso } from '../hooks/useAtraso';
import { useListaPaginada } from '../hooks/useListaPaginada';
import { useTitulo } from '../hooks/useTitulo';

const POR_PAGINA = 8;

const repositorio = new RepositorioLivros();
const repositorioCategorias = new RepositorioCategorias();

// Os campos do formulário ficam como texto, igual aos <input> do HTML.
interface FormularioLivro {
    id: number;
    titulo: string;
    autor: string;
    categoriaId: string;
    preco: string;
    estoque: string;
}

const FORMULARIO_VAZIO: FormularioLivro = { id: 0, titulo: '', autor: '', categoriaId: '', preco: '', estoque: '' };

export function Livros() {
    useTitulo('Livros');

    const { mostrar, tratarErro } = useAvisos();
    const [textoBusca, setTextoBusca] = useState('');
    const [categoriaId, setCategoriaId] = useState(0);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [formulario, setFormulario] = useState<FormularioLivro | null>(null);
    const [validado, setValidado] = useState(false);
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

    function abrirFormulario(livro?: Livro): void {
        setValidado(false);
        setFormulario(
            livro
                ? {
                      id: livro.id,
                      titulo: livro.titulo,
                      autor: livro.autor,
                      categoriaId: String(livro.categoriaId),
                      preco: String(livro.preco),
                      estoque: String(livro.estoque),
                  }
                : FORMULARIO_VAZIO,
        );
    }

    function alterar(campo: keyof FormularioLivro, valor: string): void {
        setFormulario((atual) => (atual === null ? atual : { ...atual, [campo]: valor }));
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
            const livro = new Livro({
                id: formulario.id,
                titulo: formulario.titulo,
                autor: formulario.autor,
                categoriaId: Number(formulario.categoriaId),
                preco: Number(formulario.preco),
                estoque: Number(formulario.estoque),
            });
            const mensagem = await repositorio.salvar(livro);

            setFormulario(null);
            mostrar(mensagem);
            await recarregar();
        } catch (erro) {
            tratarErro(erro);
        }
    }

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
                <button type="button" className="btn btn-primary" onClick={() => abrirFormulario()}>
                    Novo livro
                </button>
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
                                    <AcoesLinha aoEditar={() => abrirFormulario(livro)} aoExcluir={() => setParaExcluir(livro)} />
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
                            <h2 className="modal-title fs-5">{formulario.id > 0 ? 'Editar livro' : 'Novo livro'}</h2>
                            <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setFormulario(null)} />
                        </div>
                        <div className="modal-body">
                            <Campo
                                id="campoTitulo"
                                rotulo="Título"
                                maxLength={120}
                                required
                                value={formulario.titulo}
                                mensagem="Informe o título."
                                onChange={(evento) => alterar('titulo', evento.target.value)}
                            />
                            <Campo
                                id="campoAutor"
                                rotulo="Autor"
                                maxLength={80}
                                required
                                value={formulario.autor}
                                mensagem="Informe o autor."
                                onChange={(evento) => alterar('autor', evento.target.value)}
                            />
                            <div className="mb-3">
                                <label className="form-label" htmlFor="campoCategoria">
                                    Categoria
                                </label>
                                <select
                                    className="form-select"
                                    id="campoCategoria"
                                    required
                                    value={formulario.categoriaId}
                                    onChange={(evento) => alterar('categoriaId', evento.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {categorias.map((categoria) => (
                                        <option key={categoria.id} value={categoria.id}>
                                            {categoria.rotulo()}
                                        </option>
                                    ))}
                                </select>
                                <div className="invalid-feedback">Selecione a categoria.</div>
                            </div>
                            <div className="row g-3">
                                <div className="col-6">
                                    <Campo
                                        id="campoPreco"
                                        rotulo="Preço (R$)"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        required
                                        classeGrupo=""
                                        value={formulario.preco}
                                        mensagem="Informe um valor maior que zero."
                                        onChange={(evento) => alterar('preco', evento.target.value)}
                                    />
                                </div>
                                <div className="col-6">
                                    <Campo
                                        id="campoEstoque"
                                        rotulo="Estoque"
                                        type="number"
                                        min="0"
                                        step="1"
                                        required
                                        classeGrupo=""
                                        value={formulario.estoque}
                                        mensagem="Informe o estoque."
                                        onChange={(evento) => alterar('estoque', evento.target.value)}
                                    />
                                </div>
                            </div>
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
