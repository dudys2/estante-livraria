# Estante — banco `biblioteca`

Sistema de gestão de livros, categorias e vendas, com painel de indicadores.

## Instalação no ambiente atual

1. Faça uma cópia da pasta do projeto antes de substituir arquivos.
2. Coloque a pasta `livraria` em `C:\xampp\htdocs\estante\livraria`.
3. Inicie Apache e MySQL/MariaDB no XAMPP.
4. No DBeaver, abra `database/complementar_biblioteca.sql` conectado ao servidor local e execute o arquivo inteiro como **SQL Script**. O script complementa o banco existente `biblioteca`; não apaga tabelas nem registros.
5. Abra `http://localhost/estante/livraria/api/diagnostico.php`. O diagnóstico verifica conexão, tabelas e procedures.
6. Abra `http://localhost/estante/livraria/`.

O arquivo `api/bootstrap.php` está configurado para host `127.0.0.1`, porta `3306`, banco `biblioteca`, usuário `root` e senha vazia (padrão comum do XAMPP). Se a conexão do DBeaver usar outro usuário ou senha, ajuste `DB_USUARIO` e `DB_SENHA` nesse arquivo.

## TypeScript

O JavaScript compilado já está em `assets/js`. Para recompilar após alterações:

```bash
npm install
npm run build
```

## Estrutura e rubrica

- `database/complementar_biblioteca.sql`: complementa tabelas, CTEs, views, funções, triggers e procedures sem apagar as tabelas/dados existentes.
- `api/`: endpoints JSON de categorias, produtos, vendas e dashboard.
- `api/diagnostico.php`: teste local de conexão e objetos necessários.
- `includes/`: template compartilhado.
- `src/nucleo/`: tipos, acesso à API, DOM, formatação, cálculos e componentes.
- `src/paginas/`: TypeScript por página.
- `assets/`: CSS e JavaScript compilado.

Fluxo: MySQL/MariaDB (views e procedures) → PHP (PDO/CALL) → JSON → TypeScript (`fetch`, cálculos) → DOM.
