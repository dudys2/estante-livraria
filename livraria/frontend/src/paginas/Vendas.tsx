import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { Categoria } from '@src/entidades/Categoria';
import type { Livro } from '@src/entidades/Livro';
import { Venda } from '@src/entidades/Venda';
import { formatarData, formatarMoeda, hojeIso } from '@src/nucleo/formatadores';
import { RepositorioCategorias } from '@src/repositorios/RepositorioCategorias';
import { RepositorioLivros } from '@src/repositorios/RepositorioLivros';
import { RepositorioVendas } from '@src/repositorios/RepositorioVendas';
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

const repositorio = new RepositorioVendas();
const repositorioLivros = new RepositorioLivros();
const repositorioCategorias = new RepositorioCategorias();

interface FormularioVenda {
    id: number;
    produtoId: string;
    quantidade: string;
    data: string;
}

export function Vendas() {
    useTitulo('Vendas');

    const { mostrar, tratarErro } = useAvisos();
    const [textoBusca, setTextoBusca] = useState('');
    const [categoriaId, setCategoriaId] = useState(0);
    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [catalogo, setCatalogo] = useState<Livro[]>([]);
    const [formulario, setFormulario] = useState<FormularioVenda | null>(null);
    const [validado, setValidado] = useState(false);
    const [paraExcluir, setParaExcluir] = useState<Venda | null>(null);

    const busca = useAtraso(textoBusca.trim());
    const listar = useCallback(
        (pagina: number) => repositorio.listar({ busca, categoriaId, inicio, fim, pagina, porPagina: POR_PAGINA }),
        [busca, categoriaId, inicio, fim],
    );
    const { itens: vendas, total, carregado, pagina, irParaPagina, recarregar } = useListaPaginada(listar);

    // Categorias e livros usados nos filtros e no formulário.
    const carregarApoio = useCallback(async (): Promise<void> => {
        try {
            const [listaCategorias, livros] = await Promise.all([
                repositorioCategorias.listar(),
                repositorioLivros.listar({ busca: '', categoriaId: 0, pagina: 1, porPagina: 1000 }),
            ]);

            setCategorias(listaCategorias);
            setCatalogo(livros.itens);
        } catch (erro) {
            tratarErro(erro);
        }
    }, [tratarErro]);

    useEffect(() => {
        void carregarApoio();
    }, [carregarApoio]);

    const livroSelecionado = formulario ? catalogo.find((livro) => livro.id === Number(formulario.produtoId)) : undefined;

    function abrirFormulario(venda?: Venda): void {
        setValidado(false);
        setFormulario({
            id: venda ? venda.id : 0,
            produtoId: venda ? String(venda.produtoId) : '',
            quantidade: venda ? String(venda.quantidade) : '',
            data: venda ? venda.dataVenda : hojeIso(),
        });
    }

    function alterar(campo: keyof FormularioVenda, valor: string): void {
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
            const venda = new Venda({
                id: formulario.id,
                produtoId: Number(formulario.produtoId),
                quantidade: Number(formulario.quantidade),
                dataVenda: formulario.data,
            });
            const mensagem = await repositorio.salvar(venda);

            setFormulario(null);
            mostrar(mensagem);
            await Promise.all([recarregar(), carregarApoio()]);
        } catch (erro) {
            tratarErro(erro);
        }
    }

    async function excluir(venda: Venda): Promise<void> {
        setParaExcluir(null);

        try {
            mostrar(await repositorio.excluir(venda.id));
            await Promise.all([recarregar(), carregarApoio()]);
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
                <button type="button" className="btn btn-primary" onClick={() => abrirFormulario()}>
                    Nova venda
                </button>
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
                                    <AcoesLinha aoEditar={() => abrirFormulario(venda)} aoExcluir={() => setParaExcluir(venda)} />
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
                            <h2 className="modal-title fs-5">{formulario.id > 0 ? 'Editar venda' : 'Nova venda'}</h2>
                            <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setFormulario(null)} />
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label" htmlFor="campoProduto">
                                    Livro
                                </label>
                                <select
                                    className="form-select"
                                    id="campoProduto"
                                    required
                                    value={formulario.produtoId}
                                    onChange={(evento) => alterar('produtoId', evento.target.value)}
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
                            <div className="row g-3">
                                <div className="col-6">
                                    <Campo
                                        id="campoQuantidade"
                                        rotulo="Quantidade"
                                        type="number"
                                        min="1"
                                        step="1"
                                        required
                                        classeGrupo=""
                                        value={formulario.quantidade}
                                        mensagem="Informe ao menos 1 unidade."
                                        onChange={(evento) => alterar('quantidade', evento.target.value)}
                                    />
                                </div>
                                <div className="col-6">
                                    <Campo
                                        id="campoData"
                                        rotulo="Data da venda"
                                        type="date"
                                        required
                                        classeGrupo=""
                                        value={formulario.data}
                                        mensagem="Informe a data."
                                        onChange={(evento) => alterar('data', evento.target.value)}
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
                    mensagem={`Excluir a ${paraExcluir.rotulo()}? O estoque será devolvido.`}
                    aoCancelar={() => setParaExcluir(null)}
                    aoConfirmar={() => void excluir(paraExcluir)}
                />
            )}
        </>
    );
}
