import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { formatarData, formatarMoeda } from '@src/nucleo/formatadores';
import { RepositorioDashboard, type DadosDashboard } from '@src/repositorios/RepositorioDashboard';
import { ServicoPainel, type ItemRanking } from '@src/servicos/ServicoPainel';
import { Icone } from '../componentes/Icone';
import { useAvisos } from '../contexto/AvisosContexto';
import { useTitulo } from '../hooks/useTitulo';

const repositorio = new RepositorioDashboard();

interface LinhaBarra {
    rotulo: string;
    texto: string;
    percentual: number;
}

function paraBarras(itens: ItemRanking[], formatar: (valor: number) => string): LinhaBarra[] {
    const maximo = itens.reduce((maior, item) => Math.max(maior, item.valor), 0);

    return itens.map((item) => ({
        rotulo: item.nome,
        texto: formatar(item.valor),
        percentual: maximo > 0 ? (item.valor / maximo) * 100 : 0,
    }));
}

function Barras({ linhas }: { linhas: LinhaBarra[] }) {
    if (linhas.length === 0) {
        return <p className="vazio">Nenhum dado registrado.</p>;
    }

    return (
        <>
            {linhas.map((linha) => (
                <div className="barra-item" key={linha.rotulo}>
                    <div className="barra-topo">
                        <span>{linha.rotulo}</span>
                        <span className="texto-suave">{linha.texto}</span>
                    </div>
                    <div className="barra-trilho">
                        <div className="barra-preenchimento" style={{ width: `${linha.percentual.toFixed(1)}%` }} />
                    </div>
                </div>
            ))}
        </>
    );
}

interface PropsIndicador {
    titulo: string;
    valor: string;
    detalhe: string;
    icone: ReactNode;
    valorEmTexto?: boolean;
}

function Indicador({ titulo, valor, detalhe, icone, valorEmTexto = false }: PropsIndicador) {
    return (
        <div className="col-6 col-lg-3">
            <div className="card indicador">
                <div className="card-body">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="icone-indicador">
                            <Icone>{icone}</Icone>
                        </span>
                        <span className="rotulo mb-0">{titulo}</span>
                    </div>
                    <div className={`indicador-valor${valorEmTexto ? ' indicador-texto' : ''}`}>{valor}</div>
                    <div className="texto-suave">{detalhe}</div>
                </div>
            </div>
        </div>
    );
}

export function Painel() {
    useTitulo('Painel');

    const { tratarErro } = useAvisos();
    const [dados, setDados] = useState<DadosDashboard | null>(null);
    const [categoriaId, setCategoriaId] = useState(0);
    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');

    useEffect(() => {
        repositorio.carregar().then(setDados).catch(tratarErro);
    }, [tratarErro]);

    // Os cálculos continuam no ServicoPainel que já existia.
    const servico = useMemo(() => (dados ? new ServicoPainel(dados.vendas, dados.livros) : null), [dados]);
    const resumo = useMemo(
        () => (servico ? servico.resumir({ categoriaId, inicio, fim }) : null),
        [servico, categoriaId, inicio, fim],
    );

    const indicadores = resumo?.indicadores ?? { faturamento: 0, unidades: 0, ticketMedio: 0, totalVendas: 0 };
    const destaque = resumo?.destaque ?? null;
    const criticos = resumo?.criticos ?? [];
    const recentes = resumo?.recentes ?? [];

    function limparFiltros(): void {
        setCategoriaId(0);
        setInicio('');
        setFim('');
    }

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                <div>
                    <h1 className="titulo-pagina">Painel</h1>
                    <p className="subtitulo mb-0">Vendas e estoque da livraria.</p>
                </div>
                <form className="row g-2 align-items-end" onSubmit={(evento) => evento.preventDefault()}>
                    <div className="col-12 col-sm-auto">
                        <label className="form-label rotulo" htmlFor="filtroCategoria">
                            Categoria
                        </label>
                        <select
                            className="form-select form-select-sm"
                            id="filtroCategoria"
                            value={categoriaId}
                            onChange={(evento) => setCategoriaId(Number(evento.target.value))}
                        >
                            <option value={0}>Todas as categorias</option>
                            {dados?.categorias.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.rotulo()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-6 col-sm-auto">
                        <label className="form-label rotulo" htmlFor="filtroInicio">
                            De
                        </label>
                        <input
                            className="form-control form-control-sm"
                            type="date"
                            id="filtroInicio"
                            value={inicio}
                            onChange={(evento) => setInicio(evento.target.value)}
                        />
                    </div>
                    <div className="col-6 col-sm-auto">
                        <label className="form-label rotulo" htmlFor="filtroFim">
                            Até
                        </label>
                        <input
                            className="form-control form-control-sm"
                            type="date"
                            id="filtroFim"
                            value={fim}
                            onChange={(evento) => setFim(evento.target.value)}
                        />
                    </div>
                    <div className="col-12 col-sm-auto">
                        <button className="btn btn-sm btn-outline-secondary w-100" type="button" onClick={limparFiltros}>
                            Limpar filtros
                        </button>
                    </div>
                </form>
            </div>

            <div className="row g-3 mb-3">
                <Indicador
                    titulo="Faturamento"
                    valor={formatarMoeda(indicadores.faturamento)}
                    detalhe={`${indicadores.totalVendas} ${indicadores.totalVendas === 1 ? 'venda' : 'vendas'}`}
                    icone={
                        <>
                            <rect x="3" y="6" width="18" height="12" rx="2" />
                            <circle cx="12" cy="12" r="2.5" />
                        </>
                    }
                />
                <Indicador
                    titulo="Unidades vendidas"
                    valor={String(indicadores.unidades)}
                    detalhe="Soma das quantidades"
                    icone={
                        <>
                            <path d="M5 4h5v16H5zM12 4h3.5v16H12z" />
                            <path d="M17.2 5.2l3.3.9-3.6 14-3.3-.9z" />
                        </>
                    }
                />
                <Indicador
                    titulo="Ticket médio"
                    valor={formatarMoeda(indicadores.ticketMedio)}
                    detalhe="Valor médio por venda"
                    icone={
                        <>
                            <path d="M5 4h14v16l-3-2-2 2-2-2-2 2-2-2-3 2z" />
                            <path d="M9 9h6M9 13h4" />
                        </>
                    }
                />
                <Indicador
                    titulo="Livro mais vendido"
                    valor={destaque ? destaque.nome : 'Nenhum dado registrado'}
                    detalhe={destaque ? `${destaque.valor} unidade(s) vendida(s)` : 'Sem vendas no período'}
                    valorEmTexto
                    icone={<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />}
                />
            </div>

            <div className="row g-3 mb-3">
                <div className="col-lg-7">
                    <div className="card h-100">
                        <div className="card-body">
                            <h2 className="titulo-secao">Faturamento por categoria</h2>
                            {resumo && <Barras linhas={paraBarras(resumo.porCategoria, formatarMoeda)} />}
                        </div>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="card h-100">
                        <div className="card-body">
                            <h2 className="titulo-secao">Livros mais vendidos</h2>
                            {resumo && <Barras linhas={paraBarras(resumo.porLivro, (valor) => `${valor} un.`)} />}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-lg-5">
                    <div className="card h-100">
                        <div className="card-body">
                            <h2 className="titulo-secao">Estoque crítico</h2>
                            <ul className="lista-simples mb-0">
                                {resumo && criticos.length === 0 && <li className="vazio w-100">Nenhum livro com estoque crítico.</li>}
                                {criticos.map((livro) => (
                                    <li key={livro.id}>
                                        <div>
                                            <div className="fw-medium">{livro.titulo}</div>
                                            <div className="texto-suave">{livro.autor}</div>
                                        </div>
                                        <span className="selo selo-critico">{livro.estoque} un.</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-lg-7">
                    <div className="card h-100">
                        <div className="card-body">
                            <h2 className="titulo-secao">Vendas recentes</h2>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Livro</th>
                                            <th className="text-center">Qtd.</th>
                                            <th className="text-end">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resumo && recentes.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="vazio">
                                                    Nenhum dado registrado.
                                                </td>
                                            </tr>
                                        )}
                                        {recentes.map((venda) => (
                                            <tr key={venda.id}>
                                                <td>{formatarData(venda.dataVenda)}</td>
                                                <td>{venda.produto}</td>
                                                <td className="text-center">{venda.quantidade}</td>
                                                <td className="text-end fw-medium">{formatarMoeda(venda.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
