interface InstanciaModal {
    show(): void;
    hide(): void;
}

declare const bootstrap: {
    Modal: {
        getOrCreateInstance(elemento: Element): InstanciaModal;
    };
};
