export function obter<T extends HTMLElement>(id: string, tipo: new () => T): T | null {
    const elemento = document.getElementById(id);
    return elemento instanceof tipo ? elemento : null;
}

export function definirTexto(id: string, texto: string): void {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = texto;
    }
}

export function definirHtml(id: string, html: string): void {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.innerHTML = html;
    }
}
