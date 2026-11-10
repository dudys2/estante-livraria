import { ContextoUsuario } from '../contexto/ContextoUsuario.js';
import { Usuario } from '../entidades/Usuario.js';
import { obter } from '../nucleo/dom.js';
import { Sessao } from '../nucleo/sessao.js';
import { mostrarAviso, tratarErro } from '../nucleo/ui.js';
import { formatarCpf, nivelSenha, validarCpf } from '../nucleo/validadores.js';
import { RepositorioUsuarios } from '../repositorios/RepositorioUsuarios.js';

if (!Sessao.ativa) {
    window.location.assign('login.php');
}

const repositorio = new RepositorioUsuarios();

const formulario = obter('formulario', HTMLFormElement);
const campoNome = obter('campoNome', HTMLInputElement);
const campoEmail = obter('campoEmail', HTMLInputElement);
const campoCpf = obter('campoCpf', HTMLInputElement);
const campoSenha = obter('campoSenha', HTMLInputElement);
const campoConfirmacao = obter('campoConfirmacao', HTMLInputElement);
const indicadorNivel = obter('nivelSenha', HTMLElement);

const CLASSES_NIVEL = {
    fraca: 'selo-critico',
    media: 'selo-baixo',
    forte: 'selo-normal',
};

if (formulario && campoNome && campoEmail && campoCpf && campoSenha && campoConfirmacao && indicadorNivel) {
    const botaoSalvar = formulario.querySelector<HTMLButtonElement>('button[type="submit"]');

    // O e-mail é só leitura: a API também recusa qualquer alteração.
    campoEmail.readOnly = true;

    const marcar = (campo: HTMLInputElement, valido: boolean): boolean => {
        campo.classList.toggle('is-invalid', !valido);
        return valido;
    };

    const validar = (): boolean =>
        [
            marcar(campoNome, campoNome.value.trim() !== '' && campoNome.value.trim().length <= 120),
            marcar(campoCpf, validarCpf(campoCpf.value)),
            marcar(campoSenha, nivelSenha(campoSenha.value) === 'forte'),
            marcar(campoConfirmacao, campoConfirmacao.value !== '' && campoConfirmacao.value === campoSenha.value),
        ].every(Boolean);

    const atualizarNivel = (): void => {
        const nivel = nivelSenha(campoSenha.value);

        indicadorNivel.textContent = nivel;
        indicadorNivel.className = `selo ${CLASSES_NIVEL[nivel]}`;
    };

    // Preenche o formulário com os dados que estão no contexto global.
    ContextoUsuario.assinar((usuario) => {
        if (usuario !== null) {
            campoNome.value = usuario.nome;
            campoEmail.value = usuario.email;
            campoCpf.value = usuario.cpfFormatado;
        }
    });

    const salvar = async (evento: Event): Promise<void> => {
        evento.preventDefault();

        const atual = ContextoUsuario.usuario;

        if (atual === null) {
            mostrarAviso('Os seus dados ainda estão carregando. Tente de novo em instantes.', 'warning');
            return;
        }
        if (!validar()) {
            return;
        }

        if (botaoSalvar) {
            botaoSalvar.disabled = true;
            botaoSalvar.textContent = 'Salvando...';
        }

        try {
            const editado = new Usuario({
                id: atual.id,
                nome: campoNome.value,
                email: atual.email,
                cpf: campoCpf.value,
            });
            const { usuario, mensagem } = await repositorio.atualizar(editado, campoSenha.value);

            ContextoUsuario.definir(usuario);
            campoSenha.value = '';
            campoConfirmacao.value = '';
            atualizarNivel();
            mostrarAviso(mensagem);
        } catch (erro) {
            tratarErro(erro);
        } finally {
            if (botaoSalvar) {
                botaoSalvar.disabled = false;
                botaoSalvar.textContent = 'Salvar alterações';
            }
        }
    };

    campoCpf.addEventListener('input', () => {
        campoCpf.value = formatarCpf(campoCpf.value);
    });
    campoSenha.addEventListener('input', atualizarNivel);
    campoConfirmacao.addEventListener('input', () => {
        campoConfirmacao.classList.remove('is-invalid');
    });
    formulario.addEventListener('submit', (evento) => {
        void salvar(evento);
    });
}
