import { useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { ContextoUsuario } from '@src/contexto/ContextoUsuario';
import { Usuario } from '@src/entidades/Usuario';
import { Sessao } from '@src/nucleo/sessao';
import { formatarCpf, nivelSenha, validarCpf } from '@src/nucleo/validadores';
import { RepositorioUsuarios } from '@src/repositorios/RepositorioUsuarios';
import { Campo } from '../componentes/Campo';
import { SeloNivelSenha } from '../componentes/SeloNivelSenha';
import { useAvisos } from '../contexto/AvisosContexto';
import { useSessao } from '../contexto/SessaoContexto';
import { useTitulo } from '../hooks/useTitulo';

const repositorio = new RepositorioUsuarios();

type CampoPerfil = 'nome' | 'cpf' | 'senha' | 'confirmacao';

const SEM_ERROS: Record<CampoPerfil, boolean> = { nome: false, cpf: false, senha: false, confirmacao: false };

/** Sem sessão ativa, vai para o login. */
export function Perfil() {
    if (!Sessao.ativa) {
        return <Navigate to="/login" replace />;
    }
    return <FormularioPerfil />;
}

function FormularioPerfil() {
    useTitulo('Meu perfil');

    const { mostrar, tratarErro } = useAvisos();
    const { usuario } = useSessao();

    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmacao, setConfirmacao] = useState('');
    const [invalidos, setInvalidos] = useState(SEM_ERROS);
    const [salvando, setSalvando] = useState(false);

    // Preenche o formulário com os dados do usuário que estão no contexto global.
    useEffect(() => {
        if (usuario !== null) {
            setNome(usuario.nome);
            setCpf(usuario.cpfFormatado);
        }
    }, [usuario]);

    async function salvar(evento: FormEvent<HTMLFormElement>): Promise<void> {
        evento.preventDefault();

        if (usuario === null) {
            mostrar('Os seus dados ainda estão carregando. Tente de novo em instantes.', 'warning');
            return;
        }

        const validos: Record<CampoPerfil, boolean> = {
            nome: nome.trim() !== '' && nome.trim().length <= 120,
            cpf: validarCpf(cpf),
            senha: nivelSenha(senha) === 'forte',
            confirmacao: confirmacao !== '' && confirmacao === senha,
        };

        setInvalidos({
            nome: !validos.nome,
            cpf: !validos.cpf,
            senha: !validos.senha,
            confirmacao: !validos.confirmacao,
        });

        if (!Object.values(validos).every(Boolean)) {
            return;
        }

        setSalvando(true);

        try {
            const editado = new Usuario({ id: usuario.id, nome, email: usuario.email, cpf });
            const resposta = await repositorio.atualizar(editado, senha);

            ContextoUsuario.definir(resposta.usuario);
            setSenha('');
            setConfirmacao('');
            mostrar(resposta.mensagem);
        } catch (erro) {
            tratarErro(erro);
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
                <h1 className="titulo-pagina">Meu perfil</h1>
                <p className="subtitulo mb-4">Atualize seus dados. Por segurança, informe a senha ao salvar.</p>

                <form className="card card-body" noValidate onSubmit={(evento) => void salvar(evento)}>
                    <Campo
                        id="campoNome"
                        rotulo="Nome"
                        name="nome"
                        maxLength={120}
                        autoComplete="name"
                        required
                        value={nome}
                        invalido={invalidos.nome}
                        mensagem="Informe o nome."
                        onChange={(evento) => setNome(evento.target.value)}
                    />
                    {/* O e-mail é só leitura: a API também recusa qualquer alteração. */}
                    <Campo
                        id="campoEmail"
                        rotulo="E-mail"
                        type="email"
                        name="email"
                        autoComplete="email"
                        readOnly
                        value={usuario?.email ?? ''}
                        ajuda="O e-mail não pode ser alterado."
                    />
                    <Campo
                        id="campoCpf"
                        rotulo="CPF"
                        name="cpf"
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        maxLength={14}
                        autoComplete="off"
                        required
                        value={cpf}
                        invalido={invalidos.cpf}
                        mensagem="Informe um CPF válido."
                        onChange={(evento) => setCpf(formatarCpf(evento.target.value))}
                    />
                    <Campo
                        id="campoSenha"
                        rotulo="Senha"
                        type="password"
                        name="senha"
                        autoComplete="new-password"
                        required
                        value={senha}
                        invalido={invalidos.senha}
                        mensagem="Use 8 ou mais caracteres, com maiúscula, minúscula, número e símbolo."
                        ajuda={
                            <>
                                Nível da senha: <SeloNivelSenha senha={senha} />
                            </>
                        }
                        onChange={(evento) => setSenha(evento.target.value)}
                    />
                    <Campo
                        id="campoConfirmacao"
                        rotulo="Confirmar senha"
                        type="password"
                        name="confirmacao"
                        autoComplete="new-password"
                        required
                        classeGrupo="mb-4"
                        value={confirmacao}
                        invalido={invalidos.confirmacao}
                        mensagem="As senhas não conferem."
                        onChange={(evento) => {
                            setConfirmacao(evento.target.value);
                            setInvalidos((atuais) => ({ ...atuais, confirmacao: false }));
                        }}
                    />

                    <button type="submit" className="btn btn-primary" disabled={salvando}>
                        {salvando ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                </form>
            </div>
        </div>
    );
}
