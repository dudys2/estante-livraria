import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// "@src" aponta para a pasta livraria/src, onde ficam as camadas de negócio em TypeScript puro
// (entidades, repositórios, serviços, núcleo, erros e contexto). Elas não dependem do React.
const pastaSrc = fileURLToPath(new URL('../src', import.meta.url));
const pastaLivraria = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
    // Caminhos relativos: os repositórios chamam 'api/....php' e isso continua funcionando.
    base: './',
    plugins: [react()],
    resolve: { alias: { '@src': pastaSrc } },
    server: {
        port: 5173,
        // Permite ler livraria/src e livraria/assets/css, que ficam fora desta pasta.
        fs: { allow: [pastaLivraria] },
        // Em desenvolvimento, as chamadas a /api vão para o servidor PHP (php -S localhost:8000).
        proxy: { '/api': 'http://localhost:8000' },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        assetsDir: 'app',
    },
});
