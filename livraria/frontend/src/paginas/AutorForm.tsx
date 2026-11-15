import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Autor } from '@src/entidades/Autor';
import { RepositorioAutores } from '@src/repositorios/RepositorioAutores';
import { Campo } from '../componentes/Campo';
import { useAvisos } from '../contexto/AvisosContexto';
import { useTitulo } from '../hooks/useTitulo';

const repositorio = new RepositorioAutores();

/** Tela única para cadastrar (/autores/novo) e editar (/autores/:id/editar) um autor. */
export function AutorForm() {
    const { id: idDaRota } = useParams();
    const id = Number(idDaRota ?? 0);
    const editando = id > 0;

    useTitulo('Autor');

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
            .then((autor) => setNome(autor.nome))
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
            const autor = new Autor({ id: editando ? id : 0, nome });
            const mensagem = await repositorio.salvar(autor);

            mostrar(mensagem);
            window.setTimeout(() => navegar('/autores'), 700);
        } catch (erro) {
            tratarErro(erro);
            setSalvando(false);
        }
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
                <h1 className="titulo-pagina">{editando ? 'Editar autor' : 'Novo autor'}</h1>
                <p className="subtitulo mb-4">Informe o nome do autor.</p>

                <form
                    className={`card card-body${validado ? ' was-validated' : ''}`}
                    noValidate
                    onSubmit={(evento) => void salvar(evento)}
                >
                    <Campo
                        id="campoNome"
                        rotulo="Nome"
                        maxLength={120}
                        required
                        classeGrupo="mb-4"
                        value={nome}
                        mensagem="Informe o nome do autor."
                        onChange={(evento) => setNome(evento.target.value)}
                    />

                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={salvando}>
                            Salvar
                        </button>
                        <Link className="btn btn-light" to="/autores">
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
