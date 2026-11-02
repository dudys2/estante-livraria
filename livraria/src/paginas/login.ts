
import { requisitar } from '../nucleo/api.js';
import { obter } from '../nucleo/dom.js';
import type { RespostaMensagem } from '../nucleo/tipos.js';
import { mostrarAviso, tratarErro } from '../nucleo/ui.js';
import { validarEmail } from '../nucleo/validadores.js';

interface RespostaLogin extends RespostaMensagem {
    usuario: {
        id: number;
        nome: string;
        email: string;
    };
}

const formulario = obter('formularioLogin', HTMLFormElement);
const campoEmail = obter('campoEmailLogin', HTMLInputElement);
const campoSenha = obter('campoSenhaLogin', HTMLInputElement);
const botaoEntrar = obter('botaoEntrar', HTMLButtonElement);

if (formulario && campoEmail && campoSenha && botaoEntrar) {

    // Verifica se o usuário acabou de se cadastrar.
    const parametros = new URLSearchParams(window.location.search);

    if (parametros.get('cadastro') === 'sucesso') {
        mostrarAviso(
            'Cadastro realizado! Agora entre com seu e-mail e sua senha.'
        );
    }

    // Marca os campos que possuem erros.
    const marcar = (
        campo: HTMLInputElement,
        valido: boolean
    ): boolean => {
        campo.classList.toggle('is-invalid', !valido);
        return valido;
    };

    // Valida os campos.
    const validar = (): boolean => {
        const emailValido = marcar(
            campoEmail,
            validarEmail(campoEmail.value.trim())
        );

        const senhaValida = marcar(
            campoSenha,
            campoSenha.value.trim() !== ''
        );

        return emailValido && senhaValida;
    };

    // Realiza o login.
    const entrar = async (evento: Event): Promise<void> => {
        evento.preventDefault();

        if (!validar()) {
            return;
        }

        botaoEntrar.disabled = true;
        botaoEntrar.textContent = 'Entrando...';

        try {
            const resposta = await requisitar<RespostaLogin>(
                'api/login.php',
                'POST',
                {
                    email: campoEmail.value.trim(),
                    senha: campoSenha.value,
                }
            );

            mostrarAviso(resposta.mensagem);

            // Após o login, vai para o painel.
            window.setTimeout(() => {
                window.location.assign('index.php');
            }, 600);

        } catch (erro) {

            // Mostra os erros retornados pela API.
            tratarErro(erro);

            botaoEntrar.disabled = false;
            botaoEntrar.textContent = 'Entrar';
        }
    };

    campoEmail.addEventListener('input', () => {
        campoEmail.classList.remove('is-invalid');
    });

    campoSenha.addEventListener('input', () => {
        campoSenha.classList.remove('is-invalid');
    });

    formulario.addEventListener('submit', (evento) => {
        void entrar(evento);
    });
}
