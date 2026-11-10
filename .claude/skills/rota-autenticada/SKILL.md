---
name: rota-autenticada
description: Cria ou ajusta uma rota da API do Estante com JWT, validação dos campos e respostas de erro corretas. Use ao mexer em arquivos de livraria/api/.
---

# Rota autenticada

## Estrutura de uma rota
1. `require __DIR__ . '/bootstrap.php';` no topo.
2. `exigirAutenticacao();` antes de qualquer lógica (devolve 401 sem token válido). Só `login.php` e o `POST` de cadastro em `usuarios.php` ficam abertos.
3. Funções pequenas (`listar`, `criar`, `editar`, `excluir`) e um `match ($_SERVER['REQUEST_METHOD'])` no fim, com `405` no `default`.

## Helpers que já existem em `bootstrap.php`
- `entrada()` lê o JSON do corpo. `idDaRequisicao()` lê e valida `?id=`.
- `falhar($mensagem, $status)` interrompe com erro. `responder($corpo, $status)` devolve JSON.
- `consultar()`, `escalar()` e `executar()` rodam SQL com parâmetros (PDO). Nunca concatene valores do usuário no SQL.
- `parametrosPaginacao()` e `paginar()` montam listagens paginadas.

## Regras
- Todos os campos obrigatórios são validados, com mensagem clara em português.
- Editar ou excluir recurso inexistente devolve 404 (confira `executar(...) === 0`).
- Regra de negócio violada ou duplicidade devolve 409.
- Quando a rota edita um usuário, confira `$payload['sub']` para só permitir o próprio usuário.
- Rode `php -l` no arquivo ao terminar.
