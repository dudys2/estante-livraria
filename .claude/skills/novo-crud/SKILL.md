---
name: novo-crud
description: Cria um CRUD completo no Estante (API em PHP, entidade e repositório em TypeScript e telas React separadas de listagem e formulário). Use quando pedirem um novo cadastro ou recurso.
---

# Novo CRUD

Use o CRUD de **autores** como modelo. Ele está completo e segue todas as regras da rubrica.

## Passos
1. **API** `livraria/api/<recurso>.php`: copie `api/autores.php` e ajuste tabela e campos. Mantenha `exigirAutenticacao()`, `GET` paginado (com `?id=` para um item), `POST`, `PUT` e `DELETE`. Valide os campos obrigatórios, devolva 404 se o recurso não existir e 409 em conflitos (nome repetido, registros vinculados).
2. **Tipos** em `src/nucleo/tipos.ts`: adicione o DTO do recurso (campos em `snake_case`, como a API devolve).
3. **Entidade** `src/entidades/<Recurso>.ts`: estenda `Entidade`, use campos `#privados` e valide nos setters (modelo: `Autor.ts`). Inclua `deApi()` e `paraApi()`.
4. **Repositório** `src/repositorios/Repositorio<Recurso>.ts`: estenda `Repositorio<T, TDto, TCorpo>` (modelo: `RepositorioAutores.ts`).
5. **Telas React separadas**, sem modal:
   - `livraria/frontend/src/paginas/<Recurso>.tsx`: listagem com busca e paginação (modelo: `Autores.tsx`, que usa o hook `useListaPaginada`).
   - `livraria/frontend/src/paginas/<Recurso>Form.tsx`: cadastro e edição pela rota com `:id` (modelo: `AutorForm.tsx`).
6. **Rotas e menu**: registre as rotas em `frontend/src/App.tsx` e adicione o item em `MENU`, em `frontend/src/componentes/Layout.tsx`.
7. Rode `npm run build` em `livraria/frontend` e `php -l` na API nova.

## Cuidados
- Nunca use `any`.
- Regras de negócio e chamadas à API ficam em `src/` (entidade e repositório); o componente só usa essas classes.
- Liste no fim os arquivos criados e alterados.
