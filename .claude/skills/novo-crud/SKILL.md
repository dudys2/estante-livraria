---
name: novo-crud
description: Cria um CRUD completo no Estante (API em PHP, entidade e repositório em TypeScript e telas separadas de listagem e formulário). Use quando pedirem um novo cadastro ou recurso.
---

# Novo CRUD

Use o CRUD de **autores** como modelo. Ele está completo e segue todas as regras da rubrica.

## Passos
1. **API** `livraria/api/<recurso>.php`: copie `api/autores.php` e ajuste tabela e campos. Mantenha `exigirAutenticacao()`, `GET` paginado (com `?id=` para um item), `POST`, `PUT` e `DELETE`. Valide os campos obrigatórios, devolva 404 se o recurso não existir e 409 em conflitos (nome repetido, registros vinculados).
2. **Tipos** em `src/nucleo/tipos.ts`: adicione o DTO do recurso (campos em `snake_case`, como a API devolve).
3. **Entidade** `src/entidades/<Recurso>.ts`: estenda `Entidade`, use campos `#privados` e valide nos setters (modelo: `Autor.ts`). Inclua `deApi()` e `paraApi()`.
4. **Repositório** `src/repositorios/Repositorio<Recurso>.ts`: estenda `Repositorio<T, TDto, TCorpo>` (modelo: `RepositorioAutores.ts`).
5. **Telas separadas**, sem modal:
   - `<recurso>.php` e `src/paginas/<recurso>.ts`: listagem com busca e paginação (modelo: `autores.php`).
   - `<recurso>-form.php` e `src/paginas/<recurso>-form.ts`: cadastro e edição por `?id=` (modelo: `autor-form.php`).
6. **Menu**: adicione o item em `includes/header.php`.
7. Rode `npm run build` em `livraria/` e `php -l` na API e nas páginas novas.

## Cuidados
- Nunca use `any`.
- Nunca edite `assets/js/` à mão: ele é gerado pelo build.
- Liste no fim os arquivos criados e alterados.
