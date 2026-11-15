import type { InputHTMLAttributes, ReactNode } from 'react';

interface PropsCampo extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    rotulo: string;
    /** Marca o campo com is-invalid (usado nas telas que validam por código). */
    invalido?: boolean;
    /** Texto do .invalid-feedback. */
    mensagem?: string;
    /** Texto de apoio (.form-text) abaixo do campo. */
    ajuda?: ReactNode;
    classeGrupo?: string;
}

/** Rótulo + campo + mensagens do Bootstrap, para não repetir esse HTML em cada formulário. */
export function Campo({ rotulo, invalido = false, mensagem, ajuda, classeGrupo = 'mb-3', ...atributos }: PropsCampo) {
    return (
        <div className={classeGrupo}>
            <label className="form-label" htmlFor={atributos.id}>
                {rotulo}
            </label>
            <input {...atributos} className={`form-control${invalido ? ' is-invalid' : ''}`} />
            {mensagem && <div className="invalid-feedback">{mensagem}</div>}
            {ajuda && <div className="form-text">{ajuda}</div>}
        </div>
    );
}
