import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Categoria } from '@src/entidades/Categoria';
import { RepositorioCategorias } from '@src/repositorios/RepositorioCategorias';
import { Campo } from '../componentes/Campo';
import { useAvisos } from '../contexto/AvisosContexto';
import { useTitulo } from '../hooks/useTitulo';

const repositorio = new RepositorioCategorias();

/** Tela única para cadastrar (/categorias/novo) e editar (/categorias/:id/editar) uma categoria. */
export function CategoriaForm() {
    const { id: idDaRota } = useParams();
    const id = Number(idDaRota ?? 0);
    const editando = id > 0;

    useTitulo('Categoria');

    const navegar = useNavigate();
    const { mostrar, tratarErro } = useAvisos();
    const [nome, setNome] = useState('');
    const [validado, setValidado] = useState(false);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (!editando) {
            return;
        }
        repositorio
            .buscar(id)
            .then((categoria) => setNome(categoria.nome))
            .catch(tratarErro);
    }, [editando, id, tratarErro]);

    async function salvar(evento: FormEvent<HTMLFormElement>): Promise<void> {
        evento.preventDefault();

        if (!evento.currentTarget.checkValidity()) {
            setValidado(true);
            return;
        }

        setSalvando(true);

        try {
            const mensagem = await repositorio.salvar(new Categoria({ id: editando ? id : 0, nome }));

            mostrar(mensagem);
            window.setTimeout(() => navegar('/categorias'), 700);
        } catch (erro) {
            tratarErro(erro);
            setSalvando(false);
        }
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
                <h1 className="titulo-pagina">{editando ? 'Editar categoria' : 'Nova categoria'}</h1>
                <p className="subtitulo mb-4">Informe o nome da categoria.</p>

                <form
                    className={`card card-body${validado ? ' was-validated' : ''}`}
                    noValidate
                    onSubmit={(evento) => void salvar(evento)}
                >
                    <Campo
                        id="campoNome"
                        rotulo="Nome"
                        maxLength={60}
                        required
                        classeGrupo="mb-4"
                        value={nome}
                        mensagem="Informe o nome da categoria."
                        onChange={(evento) => setNome(evento.target.value)}
                    />

                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={salvando}>
                            Salvar
                        </button>
                        <Link className="btn btn-light" to="/categorias">
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
