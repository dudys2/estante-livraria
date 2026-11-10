import { Usuario } from '../entidades/Usuario.js';
import { requisitar } from '../nucleo/api.js';
import { Sessao } from '../nucleo/sessao.js';
import type { RespostaLogin, RespostaMensagem, RespostaUsuario, UsuarioDto } from '../nucleo/tipos.js';

export class RepositorioUsuarios {
    async cadastrar(usuario: Usuario, senha: string): Promise<string> {
        const resposta = await requisitar<RespostaMensagem>('api/usuarios.php', 'POST', {
            nome: usuario.nome,
            email: usuario.email,
            cpf: usuario.cpf,
            senha,
        });

        return resposta.mensagem;
    }

    async autenticar(email: string, senha: string): Promise<Usuario> {
        const resposta = await requisitar<RespostaLogin>('api/login.php', 'POST', { email, senha });

        Sessao.salvar(resposta.token);

        return new Usuario({ id: resposta.usuario.id, nome: resposta.usuario.nome, email: resposta.usuario.email });
    }

    /** Busca os dados do usuário logado. */
    async buscarPerfil(): Promise<Usuario> {
        const resposta = await requisitar<RespostaUsuario>('api/usuarios.php');

        return RepositorioUsuarios.paraUsuario(resposta.usuario);
    }

    /** Edita o próprio usuário. O e-mail vai junto só para a API conferir que não mudou. */
    async atualizar(usuario: Usuario, senha: string): Promise<{ usuario: Usuario; mensagem: string }> {
        const resposta = await requisitar<RespostaUsuario>(`api/usuarios.php?id=${usuario.id}`, 'PUT', {
            nome: usuario.nome,
            email: usuario.email,
            cpf: usuario.cpf,
            senha,
        });

        return {
            usuario: RepositorioUsuarios.paraUsuario(resposta.usuario),
            mensagem: resposta.mensagem ?? 'Dados atualizados com sucesso.',
        };
    }

    private static paraUsuario(dto: UsuarioDto): Usuario {
        return new Usuario({ id: dto.id, nome: dto.nome, email: dto.email, cpf: dto.cpf });
    }
}
