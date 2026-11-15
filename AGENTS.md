# Estante

Sistema de gestão de livros, categorias, autores e vendas, com login por JWT.
Projeto acadêmico: o código precisa ser simples de explicar numa defesa técnica.

## Estrutura
- `livraria/api/`: back-end em PHP 8 (uma rota por arquivo, PDO, JWT HS256).
- `livraria/frontend/`: front-end em **React + TypeScript** (Vite). Telas em `src/paginas/`, componentes reutilizáveis em `src/componentes/`, estado compartilhado em `src/contexto/`, hooks em `src/hooks/` e rotas em `src/App.tsx` (HashRouter).
- `livraria/src/`: camadas de negócio do front, em TypeScript puro e sem React. O React as importa pelo alias `@src`. Contém `entidades/` (regras e validação), `repositorios/` (chamadas à API), `servicos/`, `nucleo/` (api, sessão, validadores, formatadores, tipos), `erros/` e `contexto/` (usuário logado).
- `livraria/assets/css/estilo.css`: estilo da aplicação, importado pelo React.
- `livraria/database/`: scripts SQL do banco `biblioteca`.

## Comandos
- Desenvolvimento: `cd livraria && php -S localhost:8000` (API) e, em outro terminal, `cd livraria/frontend && npm run dev` (abre em `http://localhost:5173`).
- Checar tipos e compilar o front: `cd livraria/frontend && npm run build` (rode depois de editar qualquer `.ts` ou `.tsx`).
- Checar PHP: `php -l arquivo.php`.

## Regras do código
- Entidades estendem `Entidade`, usam campos `#privados` e validam nos setters.
- Repositórios estendem `Repositorio<T, TDto, TCorpo>`; erros usam as classes de `src/erros/`.
- Regra de negócio e chamada à API ficam em `livraria/src/` (entidades e repositórios), nunca dentro de componentes React.
- Componentes React são funções com hooks. Cada tela fica em `frontend/src/paginas/`, e o que se repete vira componente em `frontend/src/componentes/`.
- Proibido `any` no TypeScript. Use interfaces, type aliases e generics.
- Toda rota de `api/` chama `exigirAutenticacao()`, exceto `login.php` e o `POST` de cadastro em `usuarios.php`.
- Listagens são paginadas (`parametrosPaginacao()` e `paginar()`).
- Editar ou excluir recurso inexistente devolve 404. Conflito de regra de negócio devolve 409.
- O e-mail do usuário nunca pode ser alterado. Cada usuário só edita a si mesmo.
- Nomes de arquivos, funções e variáveis em português, como no restante do projeto.

## Guardrails (limites do agente)
- **Nunca leia, mostre, copie ou comite o `.env`** nem qualquer segredo (`JWT_SECRET`, senhas). Use o `.env example` como referência.
- Não apague arquivos nem tabelas, não rode `DROP`/`DELETE` no banco e não use `git push` ou `git reset --hard` sem o usuário pedir.
- Não mexa nos objetos SQL de empréstimos (`emprestimos`, `fn_dias_atraso`, triggers e views da biblioteca): eles pertencem a outra disciplina.
- Não instale dependências novas sem avisar.
- Faça só o que foi pedido. Se faltar informação, pergunte antes de supor.
- Antes de dizer que terminou: `npm run build` sem erros em `livraria/frontend`, `php -l` nos arquivos PHP alterados e nada de segredo no diff.

## Skills do projeto (`.claude/skills/`)
- `novo-crud`: cria um CRUD completo (API, entidade, repositório e telas React separadas).
- `rota-autenticada`: cria ou ajusta uma rota da API com autenticação e validação.
- `revisar-entrega`: checklist final antes de enviar o projeto.
