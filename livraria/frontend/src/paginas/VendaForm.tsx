import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Livro } from '@src/entidades/Livro';
import { Venda } from '@src/entidades/Venda';
import { formatarMoeda, hojeIso } from '@src/nucleo/formatadores';
import { RepositorioLivros } from '@src/repositorios/RepositorioLivros';
import { RepositorioVendas } from '@src/repositorios/RepositorioVendas';
import { Campo } from '../componentes/Campo';
import { useAvisos } from '../contexto/AvisosContexto';
import { useTitulo } from '../hooks/useTitulo';

const repositorio = new RepositorioVendas();
const repositorioLivros = new RepositorioLivros();

/** Tela única para registrar (/vendas/novo) e editar (/vendas/:id/editar) uma venda. */
export function VendaForm() {
    const { id: idDaRota } = useParams();
    const id = Number(idDaRota ?? 0);
    const editando = id > 0;

    useTitulo('Venda');

    const navegar = useNavigate();
    const { mostrar, tratarErro } = useAvisos();
    const [catalogo, setCatalogo] = useState<Livro[]>([]);
    const [produtoId, setProdutoId] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [data, setData] = useState(hojeIso());
    const [validado, setValidado] = useState(false);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        repositorioLivros
            .listar({ busca: '', categoriaId: 0, pagina: 1, porPagina: 1000 })
            .then((pagina) => setCatalogo(pagina.itens))
            .catch(tratarErro);
    }, [tratarErro]);

    useEffect(() => {
        if (!editando) {
            return;
        }
        repositorio
            .buscar(id)
            .then((venda) => {
                setProdutoId(String(venda.produtoId));
                setQuantidade(String(venda.quantidade));
                setData(venda.dataVenda);
            })
            .catch(tratarErro);
    }, [editando, id, tratarErro]);

    const livroSelecionado = catalogo.find((livro) => livro.id === Number(produtoId));

    async function salvar(evento: FormEvent<HTMLFormElement>): Promise<void> {
        evento.preventDefault();

        if (!evento.currentTarget.checkValidity()) {
            setValidado(true);
            return;
        }

        setSalvando(true);

        try {
            const venda = new Venda({
                id: editando ? id : 0,
                produtoId: Number(produtoId),
                quantidade: Number(quantidade),
                dataVenda: data,
            });

            mostrar(await repositorio.salvar(venda));
            window.setTimeout(() => navegar('/vendas'), 700);
        } catch (erro) {
            tratarErro(erro);
            setSalvando(false);
        }
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
                <h1 className="titulo-pagina">{editando ? 'Editar venda' : 'Nova venda'}</h1>
                <p className="subtitulo mb-4">O estoque do livro é ajustado automaticamente.</p>

                <form
                    className={`card card-body${validado ? ' was-validated' : ''}`}
                    noValidate
                    onSubmit={(evento) => void salvar(evento)}
                >
                    <div className="mb-3">
                        <label className="form-label" htmlFor="campoProduto">
                            Livro
                        </label>
                        <select
                            className="form-select"
                            id="campoProduto"
                            required
                            value={produtoId}
                            onChange={(evento) => setProdutoId(evento.target.value)}
                        >
                            <option value="">Selecione</option>
                            {catalogo.map((livro) => (
                                <option key={livro.id} value={livro.id}>
                                    {livro.rotulo()}
                                </option>
                            ))}
                        </select>
                        <div className="invalid-feedback">Selecione o livro.</div>
                        <div className="form-text">
                            {livroSelecionado
                                ? `Preço atual: ${formatarMoeda(livroSelecionado.preco)}. Estoque: ${livroSelecionado.estoque}.`
                                : ''}
                        </div>
                    </div>
                    <div className="row g-3 mb-4">
                        <div className="col-6">
                            <Campo
                                id="campoQuantidade"
                                rotulo="Quantidade"
                                type="number"
                                min="1"
                                step="1"
                                required
                                classeGrupo=""
                                value={quantidade}
                                mensagem="Informe ao menos 1 unidade."
                                onChange={(evento) => setQuantidade(evento.target.value)}
                            />
                        </div>
                        <div className="col-6">
                            <Campo
                                id="campoData"
                                rotulo="Data da venda"
                                type="date"
                                required
                                classeGrupo=""
                                value={data}
                                mensagem="Informe a data."
                                onChange={(evento) => setData(evento.target.value)}
                            />
                        </div>
                    </div>

                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={salvando}>
                            Salvar
                        </button>
                        <Link className="btn btn-light" to="/vendas">
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
