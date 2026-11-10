# Estante

Sistema de gestão de livros, categorias, autores e vendas, com login por JWT.
Projeto acadêmico: o código precisa ser simples de explicar numa defesa técnica.

## Estrutura
- `livraria/api/`: back-end em PHP 8 (uma rota por arquivo, PDO, JWT HS256).
- `livraria/src/`: front-end em **TypeScript**. Compila para `livraria/assets/js/` (esse JS é gerado, nunca edite à mão).
- `livraria/*.php`: páginas que só montam o HTML e carregam um script de `assets/js/paginas/`.
- `livraria/database/`: scripts SQL do banco `biblioteca`.

Camadas do front: `entidades/` (regras e validação), `repositorios/` (chamadas à API), `paginas/` (telas), `nucleo/` (utilitários), `erros/`, `contexto/` (usuário logado).

## Comandos
- Compilar o front: `cd livraria && npm run build` (rode depois de editar qualquer `.ts`).
- Checar PHP: `php -l arquivo.php`.

## Regras do código
- Entidades estendem `Entidade`, usam campos `#privados` e validam nos setters.
- Repositórios estendem `Repositorio<T, TDto, TCorpo>`; erros usam as classes de `src/erros/`.
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
- Antes de dizer que terminou: build sem erros, `php -l` nos arquivos PHP alterados e nada de segredo no diff.

## Skills do projeto (`.claude/skills/`)
- `novo-crud`: cria um CRUD completo (API, entidade, repositório e telas separadas).
- `rota-autenticada`: cria ou ajusta uma rota da API com autenticação e validação.
- `revisar-entrega`: checklist final antes de enviar o projeto.
