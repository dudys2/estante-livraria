import { Modal } from './Modal';

interface PropsModalConfirmacao {
    mensagem: string;
    aoConfirmar: () => void;
    aoCancelar: () => void;
}

/** Janela de confirmação usada antes de excluir um registro. */
export function ModalConfirmacao({ mensagem, aoConfirmar, aoCancelar }: PropsModalConfirmacao) {
    return (
        <Modal aoFechar={aoCancelar} tamanho="sm">
            <div className="modal-content">
                <div className="modal-body pt-4">
                    <p className="mb-0">{mensagem}</p>
                </div>
                <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-light" onClick={aoCancelar}>
                        Cancelar
                    </button>
                    <button type="button" className="btn btn-primary" onClick={aoConfirmar}>
                        Excluir
                    </button>
                </div>
            </div>
        </Modal>
    );
}
