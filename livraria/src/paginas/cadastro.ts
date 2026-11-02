import { requisitar } from '../nucleo/api.js';
import { obter } from '../nucleo/dom.js';
import type { RespostaMensagem } from '../nucleo/tipos.js';
import { mostrarAviso, tratarErro } from '../nucleo/ui.js';
import {
    formatarCpf,
    nivelSenha,
    validarCpf,
    validarEmail
} from '../nucleo/validadores.js';

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
    forte: 'selo-normal'
};

if (
    formulario &&
    campoNome &&
    campoEmail &&
    campoCpf &&
    campoSenha &&
    campoConfirmacao &&
    indicadorNivel
) {
    const botaoCadastrar =
        formulario.querySelector<HTMLButtonElement>('button[type="submit"]');

    const atualizarNivel = (): void => {
        const nivel = nivelSenha(campoSenha.value);

        indicadorNivel.textContent = nivel;
        indicadorNivel.className = `selo ${CLASSES_NIVEL[nivel]}`;
    };

    const marcar = (
        campo: HTMLInputElement,
        valido: boolean
    ): boolean => {
        campo.classList.toggle('is-invalid', !valido);
        return valido;
    };

    const validar = (): boolean =>
        [
            marcar(
                campoNome,
                campoNome.value.trim() !== '' &&
                campoNome.value.trim().length <= 120
            ),

            marcar(
                campoEmail,
                validarEmail(campoEmail.value.trim()) &&
                campoEmail.value.trim().length <= 150
            ),

            marcar(campoCpf, validarCpf(campoCpf.value)),

            marcar(
                campoSenha,
                nivelSenha(campoSenha.value) === 'forte'
            ),

            marcar(
                campoConfirmacao,
                campoConfirmacao.value !== '' &&
                campoConfirmacao.value === campoSenha.value
            )
        ].every(Boolean);

    const cadastrar = async (evento: Event): Promise<void> => {
        evento.preventDefault();

        if (!validar()) {
            return;
        }

        if (botaoCadastrar) {
            botaoCadastrar.disabled = true;
            botaoCadastrar.textContent = 'Cadastrando...';
        }

        try {
            const resposta = await requisitar<RespostaMensagem>(
                'api/usuarios.php',
                'POST',
                {
                    nome: campoNome.value.trim(),
                    email: campoEmail.value.trim(),
                    cpf: campoCpf.value.replace(/\D/g, ''),
                    senha: campoSenha.value
                }
            );

            mostrarAviso(resposta.mensagem);

            window.setTimeout(() => {
                window.location.assign('login.php?cadastro=sucesso');
            }, 800);

        } catch (erro) {
            tratarErro(erro);

            if (botaoCadastrar) {
                botaoCadastrar.disabled = false;
                botaoCadastrar.textContent = 'Cadastrar';
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
        void cadastrar(evento);
    });
}