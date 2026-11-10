import { Usuario } from '../entidades/Usuario.js';
import { requisitar } from '../nucleo/api.js';
import { Sessao } from '../nucleo/sessao.js';
export class RepositorioUsuarios {
    async cadastrar(usuario, senha) {
        const resposta = await requisitar('api/usuarios.php', 'POST', {
            nome: usuario.nome,
            email: usuario.email,
            cpf: usuario.cpf,
            senha,
        });
        return resposta.mensagem;
    }
    async autenticar(email, senha) {
        const resposta = await requisitar('api/login.php', 'POST', { email, senha });
        Sessao.salvar(resposta.token);
        return new Usuario({ id: resposta.usuario.id, nome: resposta.usuario.nome, email: resposta.usuario.email });
    }
    /** Busca os dados do usuário logado. */
    async buscarPerfil() {
        const resposta = await requisitar('api/usuarios.php');
        return RepositorioUsuarios.paraUsuario(resposta.usuario);
    }
    /** Edita o próprio usuário. O e-mail vai junto só para a API conferir que não mudou. */
    async atualizar(usuario, senha) {
        const resposta = await requisitar(`api/usuarios.php?id=${usuario.id}`, 'PUT', {
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
    static paraUsuario(dto) {
        return new Usuario({ id: dto.id, nome: dto.nome, email: dto.email, cpf: dto.cpf });
    }
}
