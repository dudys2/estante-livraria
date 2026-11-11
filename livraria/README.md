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

- Front-end: TypeScript (compilado para `assets/js/`), HTML e Bootstrap
- Back-end: PHP 8, PDO e JWT (HS256)
- Banco de dados: MySQL/MariaDB (banco `biblioteca`)

## Como executar

1. Copie `.env example` para `.env` e defina um valor seguro para `JWT_SECRET`.
2. Execute no banco os scripts de `database/`: primeiro `complementar_biblioteca.sql` e depois `usuarios_cadastro.sql`.
3. Na pasta `livraria`, rode `npm install` e `npm run build`.
4. Sirva a pasta `livraria` em um servidor PHP e acesse `index.php`.

## Estrutura

- `api/`: rotas da API (uma por arquivo)
- `src/`: código TypeScript (`entidades`, `repositorios`, `servicos`, `paginas`, `nucleo`, `erros`, `contexto`)
- `assets/js/`: JavaScript gerado pelo build (não editar à mão)
- `database/`: scripts SQL