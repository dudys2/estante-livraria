import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Usuario } from '@src/entidades/Usuario';
import { formatarCpf, nivelSenha, validarCpf, validarEmail } from '@src/nucleo/validadores';
import { RepositorioUsuarios } from '@src/repositorios/RepositorioUsuarios';
import { Campo } from '../componentes/Campo';
import { SeloNivelSenha } from '../componentes/SeloNivelSenha';
import { useAvisos } from '../contexto/AvisosContexto';
import { useTitulo } from '../hooks/useTitulo';

const repositorio = new RepositorioUsuarios();

type CampoCadastro = 'nome' | 'email' | 'cpf' | 'senha' | 'confirmacao';

const SEM_ERROS: Record<CampoCadastro, boolean> = {
    nome: false,
    email: false,
    cpf: false,
    senha: false,
    confirmacao: false,
};

export function Cadastro() {
    useTitulo('Cadastro');

    const navegar = useNavigate();
    const { mostrar, tratarErro, limpar } = useAvisos();

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmacao, setConfirmacao] = useState('');
    const [invalidos, setInvalidos] = useState(SEM_ERROS);
    const [enviando, setEnviando] = useState(false);

    async function cadastrar(evento: FormEvent<HTMLFormElement>): Promise<void> {
        evento.preventDefault();

        // Regras de validação de cada campo (true = válido).
        const validos: Record<CampoCadastro, boolean> = {
            nome: nome.trim() !== '' && nome.trim().length <= 120,
            email: validarEmail(email.trim()) && email.trim().length <= 150,
            cpf: validarCpf(cpf),
            senha: nivelSenha(senha) === 'forte',
            confirmacao: confirmacao !== '' && confirmacao === senha,
        };

        setInvalidos({
            nome: !validos.nome,
            email: !validos.email,
            cpf: !validos.cpf,
            senha: !validos.senha,
            confirmacao: !validos.confirmacao,
        });

        if (!Object.values(validos).every(Boolean)) {
            return;
        }

        setEnviando(true);

        try {
            const usuario = new Usuario({ nome, email, cpf });
            const mensagem = await repositorio.cadastrar(usuario, senha);

            mostrar(mensagem);

            // Depois do cadastro, vai para o login.
            window.setTimeout(() => {
                limpar();
                navegar('/login?cadastro=sucesso');
            }, 800);
        } catch (erro) {
            tratarErro(erro);
            setEnviando(false);
        }
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
                <h1 className="titulo-pagina">Cadastro de usuário</h1>
                <p className="subtitulo mb-4">Preencha os dados para criar sua conta.</p>

                <form className="card card-body" noValidate onSubmit={(evento) => void cadastrar(evento)}>
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
                    <Campo
                        id="campoEmail"
                        rotulo="E-mail"
                        type="email"
                        name="email"
                        maxLength={150}
                        autoComplete="email"
                        required
                        value={email}
                        invalido={invalidos.email}
                        mensagem="Informe um e-mail válido."
                        onChange={(evento) => setEmail(evento.target.value)}
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

                    <button type="submit" className="btn btn-primary" disabled={enviando}>
                        {enviando ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
