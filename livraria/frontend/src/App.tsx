import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './componentes/Layout';
import { RotaProtegida } from './componentes/RotaProtegida';
import { ProvedorAvisos } from './contexto/AvisosContexto';
import { ProvedorSessao } from './contexto/SessaoContexto';
import { Autores } from './paginas/Autores';
import { AutorForm } from './paginas/AutorForm';
import { Cadastro } from './paginas/Cadastro';
import { CategoriaForm } from './paginas/CategoriaForm';
import { Categorias } from './paginas/Categorias';
import { LivroForm } from './paginas/LivroForm';
import { Livros } from './paginas/Livros';
import { Login } from './paginas/Login';
import { Painel } from './paginas/Painel';
import { Perfil } from './paginas/Perfil';
import { VendaForm } from './paginas/VendaForm';
import { Vendas } from './paginas/Vendas';

export function App() {
    return (
        <ProvedorAvisos>
            <ProvedorSessao>
                <Routes>
                    <Route element={<Layout />}>
                        <Route element={<RotaProtegida />}>
                            <Route index element={<Painel />} />
                            <Route path="vendas" element={<Vendas />} />
                            <Route path="vendas/novo" element={<VendaForm />} />
                            <Route path="vendas/:id/editar" element={<VendaForm />} />
                            <Route path="livros" element={<Livros />} />
                            <Route path="livros/novo" element={<LivroForm />} />
                            <Route path="livros/:id/editar" element={<LivroForm />} />
                            <Route path="categorias" element={<Categorias />} />
                            <Route path="categorias/novo" element={<CategoriaForm />} />
                            <Route path="categorias/:id/editar" element={<CategoriaForm />} />
                            <Route path="autores" element={<Autores />} />
                            <Route path="autores/novo" element={<AutorForm />} />
                            <Route path="autores/:id/editar" element={<AutorForm />} />
                            <Route path="perfil" element={<Perfil />} />
                        </Route>
                        <Route path="cadastro" element={<Cadastro />} />
                        <Route path="login" element={<Login />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </ProvedorSessao>
        </ProvedorAvisos>
    );
}
