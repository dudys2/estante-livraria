# Front-end em React

O front-end do Estante é uma aplicação React + TypeScript (Vite) em `livraria/frontend/`.
O front antigo (páginas `.php` com scripts TypeScript) foi removido.

## Onde fica cada coisa

| Pasta | Conteúdo |
|---|---|
| `livraria/frontend/src/paginas/` | uma tela por arquivo (Painel, Login, Cadastro, Perfil, Livros, Vendas, Categorias, Autores, AutorForm) |
| `livraria/frontend/src/componentes/` | peças reutilizáveis: Layout (menu), Modal, ModalConfirmacao, Paginacao, Campo, AcoesLinha, SeloNivelSenha, Icone |
| `livraria/frontend/src/contexto/` | `AvisosContexto` (alertas na tela) e `SessaoContexto` (usuário logado) |
| `livraria/frontend/src/hooks/` | `useListaPaginada`, `useAtraso`, `useTitulo` |
| `livraria/frontend/src/App.tsx` | tabela de rotas |
| `livraria/src/` | camadas de negócio em TypeScript puro, sem React: `entidades`, `repositorios`, `servicos`, `nucleo`, `erros`, `contexto` |
| `livraria/api/` | back-end PHP |
| `livraria/assets/css/estilo.css` | estilo, importado em `main.tsx` |

O React importa `livraria/src/` pelo alias `@src` (definido em `vite.config.ts` e `tsconfig.json`).

## Como rodar

1. API (com o `.env` configurado): `cd livraria && php -S localhost:8000`
2. React, em outro terminal:
   ```
   cd livraria/frontend
   npm install
   npm run dev
   ```
3. Abra `http://localhost:5173`. O Vite repassa `/api/...` para o PHP na porta 8000.

Outros comandos: `npm run tipos` (só checa tipos) e `npm run build` (checa tipos e gera `frontend/dist`).

## Produção

`npm run build` gera `dist/` com `index.html` e a pasta `app/`. Sirva esse conteúdo na raiz do site, com `api/` ao lado
(os repositórios chamam `api/...php` com caminho relativo). Com Nginx, por exemplo: `root` apontando para `dist`
e `location /api/` encaminhando para o PHP.

## Conceitos usados (para a defesa)

- **Componente**: função que devolve JSX. Cada tela e cada peça repetida (modal, paginação, campo) é um componente.
- **useState / useEffect**: estado da tela e carregamento de dados quando ela abre ou quando um filtro muda.
- **Context**: guarda o que várias telas usam: avisos (`AvisosContexto`) e usuário logado (`SessaoContexto`, que assina o `ContextoUsuario` de `livraria/src`).
- **Hook próprio**: `useListaPaginada` concentra o que livros, vendas, autores e categorias têm em comum (carregar, paginar, voltar uma página quando esvazia).
- **Formulário controlado**: o valor de cada campo fica no estado; as validações usam as funções de `livraria/src` (`validadores`, entidades).
- **HashRouter**: as rotas ficam depois do `#` (`/#/livros`, `/#/autores/3/editar`). Assim a URL base não muda e os caminhos relativos `api/...` continuam válidos, sem servidor configurado para reescrever URLs.
- **Separação de camadas**: regra de negócio (entidades) e chamadas à API (repositórios) ficam fora dos componentes.

## Observações

- Menu, modais e avisos usam só as classes do Bootstrap (o CSS vem do CDN); o JavaScript do Bootstrap não é carregado.
- Só `Meu perfil` redireciona para o login quando não há sessão. As outras telas mostram o erro da API (401).
- `StrictMode` ficou de fora para o aviso do login não aparecer em dobro em desenvolvimento.
- Dependências do front (só em `frontend/package.json`): `react`, `react-dom`, `react-router-dom`, `vite`, `@vitejs/plugin-react`, `typescript` e os tipos do React.
