import { nivelSenha, type NivelSenha } from '@src/nucleo/validadores';

const CLASSES_NIVEL: Record<NivelSenha, string> = {
    fraca: 'selo-critico',
    media: 'selo-baixo',
    forte: 'selo-normal',
};

/** Mostra "fraca", "media" ou "forte" usando a função nivelSenha que já existia. */
export function SeloNivelSenha({ senha }: { senha: string }) {
    const nivel = nivelSenha(senha);

    return <span className={`selo ${CLASSES_NIVEL[nivel]}`}>{nivel}</span>;
}
