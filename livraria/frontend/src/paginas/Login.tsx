import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { validarEmail } from '@src/nucleo/validadores';
import { RepositorioUsuarios } from '@src/repositorios/RepositorioUsuarios';
import { Campo } from '../componentes/Campo';
import { useAvisos } from '../contexto/AvisosContexto';
import { useSessao } from '../contexto/SessaoContexto';
import { useTitulo } from '../hooks/useTitulo';

const repositorio = new RepositorioUsuarios();

export function Login() {
    useTitulo('Login');

    const navegar = useNavigate();
    const [parametros] = useSearchParams();
    const { mostrar, tratarErro } = useAvisos();
    const { sincronizar } = useSessao();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [emailInvalido, setEmailInvalido] = useState(false);
    const [senhaInvalida, setSenhaInvalida] = useState(false);
    const [entrando, setEntrando] = useState(false);

    // Verifica se o usuário acabou de se cadastrar.
    useEffect(() => {
        if (parametros.get('cadastro') === 'sucesso') {
            mostrar('Cadastro realizado! Agora entre com seu e-mail e sua senha.');
        }
    }, [parametros, mostrar]);

    async function entrar(evento: FormEvent<HTMLFormElement>): Promise<void> {
        evento.preventDefault();

        const emailValido = validarEmail(email.trim());
        const senhaValida = senha.trim() !== '';

        setEmailInvalido(!emailValido);
        setSenhaInvalida(!senhaValida);

        if (!emailValido || !senhaValida) {
            return;
        }

        setEntrando(true);

        try {
            const usuario = await repositorio.autenticar(email.trim(), senha);

            mostrar(`Bem-vindo, ${usuario.nome}.`);
            sincronizar();

            // Após o login, vai para o painel.
            window.setTimeout(() => navegar('/'), 600);
        } catch (erro) {
            tratarErro(erro);
            setEntrando(false);
        }
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-5 col-xl-4">
                <h1 className="titulo-pagina">Entrar na Estante</h1>
                <p className="subtitulo mb-4">Informe seu e-mail e sua senha para acessar.</p>

                <form className="card card-body" noValidate onSubmit={(evento) => void entrar(evento)}>
                    <Campo
                        id="campoEmailLogin"
                        rotulo="E-mail"
                        type="email"
                        name="email"
                        maxLength={150}
                        autoComplete="email"
                        required
                        value={email}
                        invalido={emailInvalido}
                        mensagem="Informe um e-mail válido."
                        onChange={(evento) => {
                            setEmail(evento.target.value);
                            setEmailInvalido(false);
                        }}
                    />
                    <Campo
                        id="campoSenhaLogin"
                        rotulo="Senha"
                        type="password"
                        name="senha"
                        autoComplete="current-password"
                        required
                        classeGrupo="mb-4"
                        value={senha}
                        invalido={senhaInvalida}
                        mensagem="Informe sua senha."
                        onChange={(evento) => {
                            setSenha(evento.target.value);
                            setSenhaInvalida(false);
                        }}
                    />

                    <button type="submit" className="btn btn-primary" disabled={entrando}>
                        {entrando ? 'Entrando...' : 'Entrar'}
                    </button>

                    <p className="texto-suave text-center mt-3 mb-0">
                        Ainda não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>.
                    </p>
                </form>
            </div>
        </div>
    );
}
