import { Usuario } from '../entidades/Usuario.js';
import { requisitar } from '../nucleo/api.js';
import type { RespostaLogin, RespostaMensagem } from '../nucleo/tipos.js';

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

        return new Usuario({ id: resposta.usuario.id, nome: resposta.usuario.nome, email: resposta.usuario.email });
    }
}
