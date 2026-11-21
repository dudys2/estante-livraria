import { Navigate, Outlet } from 'react-router-dom';
import { useSessao } from '../contexto/SessaoContexto';

/** Só deixa passar quem está logado; os demais vão para a tela de login. */
export function RotaProtegida() {
    const { logado } = useSessao();

    return logado ? <Outlet /> : <Navigate to="/login" replace />;
}
