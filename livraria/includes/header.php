<?php
declare(strict_types=1);

$titulo ??= 'Estante';
$ativo ??= '';

$menu = [
    'painel' => ['index.php', 'Painel', 'todos'],
    'vendas' => ['vendas.php', 'Vendas', 'todos'],
    'livros' => ['produtos.php', 'Livros', 'todos'],
    'categorias' => ['categorias.php', 'Categorias', 'todos'],
    'autores' => ['autores.php', 'Autores', 'todos'],
    'perfil' => ['perfil.php', 'Meu perfil', 'logado'],
    'cadastro' => ['cadastro.php', 'Cadastro', 'visitante'],
    'login' => ['login.php', 'Login', 'visitante'],
];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= htmlspecialchars($titulo) ?> - Estante</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/css/estilo.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-md barra">
        <div class="container">
            <a class="navbar-brand marca d-flex align-items-center gap-2" href="index.php">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h5v16H5zM12 4h3.5v16H12z"/><path d="M17.2 5.2l3.3.9-3.6 14-3.3-.9z"/></svg>
                Estante
            </a>
            <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal" aria-controls="menuPrincipal" aria-expanded="false" aria-label="Abrir menu">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="menuPrincipal">
                <ul class="navbar-nav ms-md-4 gap-md-1">
                    <?php foreach ($menu as $chave => [$arquivo, $rotulo, $visivel]): ?>
                        <li class="nav-item"<?= $visivel !== 'todos' ? ' data-visivel="' . $visivel . '" hidden' : '' ?>>
                            <a class="nav-link<?= $chave === $ativo ? ' active' : '' ?>"
                               href="<?= $arquivo ?>"<?= $chave === $ativo ? ' aria-current="page"' : '' ?>><?= $rotulo ?></a>
                        </li>
                    <?php endforeach; ?>
                </ul>
                <div class="ms-md-auto" data-visivel="logado" hidden>
                    <div class="d-flex align-items-center gap-2">
                        <span class="navbar-text" id="nomeUsuario"></span>
                        <button type="button" class="btn btn-sm btn-light" id="botaoSair">Sair</button>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div id="avisos" class="area-avisos" aria-live="polite"></div>

    <main class="container py-4 py-md-5">
