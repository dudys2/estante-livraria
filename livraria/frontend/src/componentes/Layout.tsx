import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ContextoUsuario } from '@src/contexto/ContextoUsuario';
import { Sessao } from '@src/nucleo/sessao';
import { useSessao } from '../contexto/SessaoContexto';
import { Icone } from './Icone';

type Visibilidade = 'todos' | 'logado' | 'visitante';

interface ItemMenu {
    caminho: string;
    rotulo: string;
    visivel: Visibilidade;
    exato?: boolean;
}

// Itens do menu e quem pode vê-los: todos, só logado ou só visitante.
const MENU: ItemMenu[] = [
    { caminho: '/', rotulo: 'Painel', visivel: 'todos', exato: true },
    { caminho: '/vendas', rotulo: 'Vendas', visivel: 'todos' },
    { caminho: '/livros', rotulo: 'Livros', visivel: 'todos' },
    { caminho: '/categorias', rotulo: 'Categorias', visivel: 'todos' },
    { caminho: '/autores', rotulo: 'Autores', visivel: 'todos' },
    { caminho: '/perfil', rotulo: 'Meu perfil', visivel: 'logado' },
    { caminho: '/cadastro', rotulo: 'Cadastro', visivel: 'visitante' },
    { caminho: '/login', rotulo: 'Login', visivel: 'visitante' },
];

/** Menu + área de conteúdo, compartilhados por todas as páginas. */
export function Layout() {
    const { logado, usuario, sincronizar } = useSessao();
    const navegar = useNavigate();
    const { pathname } = useLocation();
    const [menuAberto, setMenuAberto] = useState(false);

    // A cada troca de página: fecha o menu no celular e confere se a sessão ainda vale
    // (a API encerra a sessão sozinha quando recebe 401).
    useEffect(() => {
        sincronizar();
        setMenuAberto(false);
    }, [pathname, sincronizar]);

    function sair(): void {
        Sessao.encerrar();
        ContextoUsuario.definir(null);
        sincronizar();
        navegar('/login');
    }

    const itensVisiveis = MENU.filter((item) => item.visivel === 'todos' || (item.visivel === 'logado') === logado);

    return (
        <>
            <nav className="navbar navbar-expand-md barra">
                <div className="container">
                    <Link className="navbar-brand marca d-flex align-items-center gap-2" to="/">
                        <Icone tamanho={22}>
                            <path d="M5 4h5v16H5zM12 4h3.5v16H12z" />
                            <path d="M17.2 5.2l3.3.9-3.6 14-3.3-.9z" />
                        </Icone>
                        Estante
                    </Link>
                    <button
                        className="navbar-toggler border-0"
                        type="button"
                        aria-controls="menuPrincipal"
                        aria-expanded={menuAberto}
                        aria-label="Abrir menu"
                        onClick={() => setMenuAberto((aberto) => !aberto)}
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className={`collapse navbar-collapse${menuAberto ? ' show' : ''}`} id="menuPrincipal">
                        <ul className="navbar-nav ms-md-4 gap-md-1">
                            {itensVisiveis.map((item) => (
                                <li className="nav-item" key={item.caminho}>
                                    <NavLink
                                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                        to={item.caminho}
                                        end={item.exato}
                                    >
                                        {item.rotulo}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        {logado && (
                            <div className="ms-md-auto">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="navbar-text">{usuario?.nome ?? ''}</span>
                                    <button type="button" className="btn btn-sm btn-light" onClick={sair}>
                                        Sair
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="container py-4 py-md-5">
                <Outlet />
            </main>
        </>
    );
}
