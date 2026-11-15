import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '../../assets/css/estilo.css';
import { App } from './App';

const raiz = document.getElementById('raiz');

// HashRouter: as rotas ficam depois do "#" (ex.: /#/livros). Assim a URL base não muda
// e os repositórios continuam chamando 'api/...' sem nenhum ajuste.
if (raiz) {
    createRoot(raiz).render(
        <HashRouter>
            <App />
        </HashRouter>,
    );
}
