---
name: revisar-entrega
description: Faz a revisão final do Estante antes de enviar o projeto (build, PHP, any, segredos, rubrica). Use quando pedirem para revisar, finalizar ou preparar a entrega.
---

# Revisar entrega

Execute e relate o resultado de cada item. Não corrija nada sem avisar.

1. `cd livraria && npm run build`: precisa terminar sem erros.
2. `php -l` em todos os `.php` de `livraria/` (inclusive `api/`).
3. Procure `any` em `livraria/src/` (`: any`, `<any>`, `as any`): não pode haver nenhum.
4. Confirme que as rotas de `livraria/api/` (exceto `login.php` e o `POST` de cadastro) chamam `exigirAutenticacao()`.
5. Confirme que o `.env` **não** está no que será enviado e que o `.env example` não tem segredo real. Não abra o `.env`; verifique só se o arquivo existe no pacote.
6. Confirme que `assets/js/` está atualizado com o build (cada `.ts` tem seu `.js`).
7. Confira a rubrica: 4 CRUDs com rotas autenticadas e paginação, edição de usuário, AGENTS.md, skills, docker-compose e persona no README.

Termine com uma lista curta: o que passou, o que falhou e o que falta.
