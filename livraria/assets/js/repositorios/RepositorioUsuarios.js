import { Usuario } from '../entidades/Usuario.js';
import { requisitar } from '../nucleo/api.js';
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
        return new Usuario({ id: resposta.usuario.id, nome: resposta.usuario.nome, email: resposta.usuario.email });
    }
}
