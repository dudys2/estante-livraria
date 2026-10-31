export function obter(id, tipo) {
    const elemento = document.getElementById(id);
    return elemento instanceof tipo ? elemento : null;
}
export function definirTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = texto;
    }
}
export function definirHtml(id, html) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.innerHTML = html;
    }
}
