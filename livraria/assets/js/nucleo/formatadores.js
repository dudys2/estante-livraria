const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const CARACTERES_HTML = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};
export function formatarMoeda(valor) {
    return moeda.format(Number.isFinite(valor) ? valor : 0);
}
export function formatarData(iso) {
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
}
export function hojeIso() {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${agora.getFullYear()}-${mes}-${dia}`;
}
export function escapar(texto) {
    return texto.replace(/[&<>"']/g, (caractere) => CARACTERES_HTML[caractere] ?? caractere);
}
