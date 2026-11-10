import { Autor } from '../entidades/Autor.js';
import { obter } from '../nucleo/dom.js';
import { mostrarAviso, tratarErro } from '../nucleo/ui.js';
import { RepositorioAutores } from '../repositorios/RepositorioAutores.js';

const repositorio = new RepositorioAutores();

const formulario = obter('formulario', HTMLFormElement);
const campoNome = obter('campoNome', HTMLInputElement);
const titulo = obter('tituloPagina', HTMLElement);

const id = Number(new URLSearchParams(window.location.search).get('id') ?? 0);

async function carregarAutor(): Promise<void> {
    if (!campoNome || id <= 0) {
        return;
    }

    try {
        const autor = await repositorio.buscar(id);

        campoNome.value = autor.nome;
        if (titulo) {
            titulo.textContent = 'Editar autor';
        }
    } catch (erro) {
        tratarErro(erro);
    }
}

async function salvar(evento: Event): Promise<void> {
    evento.preventDefault();

    if (!formulario || !campoNome) {
        return;
    }
    if (!formulario.checkValidity()) {
        formulario.classList.add('was-validated');
        return;
    }

    const botao = formulario.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (botao) {
        botao.disabled = true;
    }

    try {
        const autor = new Autor({ id: id > 0 ? id : 0, nome: campoNome.value });
        const mensagem = await repositorio.salvar(autor);

        mostrarAviso(mensagem);
        window.setTimeout(() => window.location.assign('autores.php'), 700);
    } catch (erro) {
        tratarErro(erro);
        if (botao) {
            botao.disabled = false;
        }
    }
}

formulario?.addEventListener('submit', (evento) => void salvar(evento));

void carregarAutor();
