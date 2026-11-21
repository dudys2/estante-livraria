import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Categoria } from '@src/entidades/Categoria';
import { Livro } from '@src/entidades/Livro';
import { RepositorioCategorias } from '@src/repositorios/RepositorioCategorias';
import { RepositorioLivros } from '@src/repositorios/RepositorioLivros';
import { Campo } from '../componentes/Campo';
import { useAvisos } from '../contexto/AvisosContexto';
import { useTitulo } from '../hooks/useTitulo';

const repositorio = new RepositorioLivros();
const repositorioCategorias = new RepositorioCategorias();

// Os campos do formulário ficam como texto, igual aos <input> do HTML.
interface FormularioLivro {
    titulo: string;
    autor: string;
    categoriaId: string;
    preco: string;
    estoque: string;
}

const FORMULARIO_VAZIO: FormularioLivro = { titulo: '', autor: '', categoriaId: '', preco: '', estoque: '' };

/** Tela única para cadastrar (/livros/novo) e editar (/livros/:id/editar) um livro. */
export function LivroForm() {
    const { id: idDaRota } = useParams();
    const id = Number(idDaRota ?? 0);
    const editando = id > 0;

    useTitulo('Livro');

    const navegar = useNavigate();
    const { mostrar, tratarErro } = useAvisos();
    const [formulario, setFormulario] = useState<FormularioLivro>(FORMULARIO_VAZIO);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [validado, setValidado] = useState(false);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        repositorioCategorias.listar().then(setCategorias).catch(tratarErro);
    }, [tratarErro]);

    useEffect(() => {
        if (!editando) {
            return;
        }
        repositorio
            .buscar(id)
            .then((livro) =>
                setFormulario({
                    titulo: livro.titulo,
                    autor: livro.autor,
                    categoriaId: String(livro.categoriaId),
                    preco: String(livro.preco),
                    estoque: String(livro.estoque),
                }),
            )
            .catch(tratarErro);
    }, [editando, id, tratarErro]);

    function alterar(campo: keyof FormularioLivro, valor: string): void {
        setFormulario((atual) => ({ ...atual, [campo]: valor }));
    }

    async function salvar(evento: FormEvent<HTMLFormElement>): Promise<void> {
        evento.preventDefault();

        if (!evento.currentTarget.checkValidity()) {
            setValidado(true);
            return;
        }

        setSalvando(true);

        try {
            const livro = new Livro({
                id: editando ? id : 0,
                titulo: formulario.titulo,
                autor: formulario.autor,
                categoriaId: Number(formulario.categoriaId),
                preco: Number(formulario.preco),
                estoque: Number(formulario.estoque),
            });

            mostrar(await repositorio.salvar(livro));
            window.setTimeout(() => navegar('/livros'), 700);
        } catch (erro) {
            tratarErro(erro);
            setSalvando(false);
        }
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
                <h1 className="titulo-pagina">{editando ? 'Editar livro' : 'Novo livro'}</h1>
                <p className="subtitulo mb-4">Informe os dados do livro e o estoque.</p>

                <form
                    className={`card card-body${validado ? ' was-validated' : ''}`}
                    noValidate
                    onSubmit={(evento) => void salvar(evento)}
                >
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
                    <div className="row g-3 mb-4">
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

                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={salvando}>
                            Salvar
                        </button>
                        <Link className="btn btn-light" to="/livros">
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
