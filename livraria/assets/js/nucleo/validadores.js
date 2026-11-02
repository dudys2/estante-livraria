const REQUISITOS_SENHA = [/.{8,}/, /[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];
export function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
export function nivelSenha(senha) {
    const atendidos = REQUISITOS_SENHA.filter((requisito) => requisito.test(senha)).length;
    if (atendidos === REQUISITOS_SENHA.length) {
        return 'forte';
    }
    return atendidos >= 3 ? 'media' : 'fraca';
}
export function validarCpf(cpf) {
    const digitos = cpf.replace(/\D/g, '');
    if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) {
        return false;
    }
    const calcularDigito = (tamanho) => {
        const soma = digitos
            .slice(0, tamanho)
            .split('')
            .reduce((total, digito, indice) => total + Number(digito) * (tamanho + 1 - indice), 0);
        return ((soma * 10) % 11) % 10;
    };
    return calcularDigito(9) === Number(digitos[9]) && calcularDigito(10) === Number(digitos[10]);
}
export function formatarCpf(valor) {
    return valor
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
