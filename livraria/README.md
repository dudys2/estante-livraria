# Estante

Sistema de gestão de livros, categorias, autores e vendas, com painel de indicadores e login por JWT.

## Persona

**Marina Souza, 38 anos, dona de uma livraria independente.**
Ela controla estoque e vendas em planilhas e perde tempo para saber quais livros estão acabando e quais categorias vendem mais. Precisa de um sistema simples, que ela e um funcionário usem sem treinamento, com acesso protegido por login.

## Como o projeto atende a persona

| Necessidade da Marina | Funcionalidade |
|---|---|
| Saber o que está vendendo | Painel com faturamento, ticket médio e ranking de livros |
| Evitar falta de estoque | Lista de livros com estoque crítico no painel |
| Organizar o acervo | Cadastro de livros, autores e categorias |
| Registrar vendas | CRUD de vendas |
| Proteger os dados da loja | Cadastro e login com senha criptografada e JWT |

## Tecnologias

- Front-end: React, TypeScript (Vite) e Bootstrap
- Back-end: PHP 8, PDO e JWT (HS256)
- Banco de dados: MySQL/MariaDB (banco `biblioteca`)

## Como executar

1. Copie `.env example` para `.env` e defina um valor seguro para `JWT_SECRET`.
2. Execute no banco os scripts de `database/`: primeiro `complementar_biblioteca.sql` e depois `usuarios_cadastro.sql`.
3. Na pasta `livraria`, inicie a API: `php -S localhost:8000`.
4. Em outro terminal, na pasta `livraria/frontend`, rode `npm install` e `npm run dev`, e acesse `http://localhost:5173`.

Para gerar a versão de produção, rode `npm run build` em `livraria/frontend`: o resultado fica em `frontend/dist/` e deve ser servido na raiz do site, com a pasta `api/` ao lado.

## Estrutura

- `api/`: rotas da API (uma por arquivo)
- `frontend/`: aplicação React (`src/paginas`, `src/componentes`, `src/contexto`, `src/hooks`)
- `src/`: camadas de negócio em TypeScript (`entidades`, `repositorios`, `servicos`, `nucleo`, `erros`, `contexto`), usadas pelo React
- `assets/css/`: estilo
- `database/`: scripts SQL
