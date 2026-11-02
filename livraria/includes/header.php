<?php
declare(strict_types=1);

$titulo ??= 'Estante';
$ativo ??= '';

$menu = [
    'painel' => ['index.php', 'Painel'],
    'vendas' => ['vendas.php', 'Vendas'],
    'livros' => ['produtos.php', 'Livros'],
    'categorias' => ['categorias.php', 'Categorias'],
    'cadastro' => ['cadastro.php', 'Cadastro'],
    'login' => ['login.php', 'Login'],
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
            <a class="navbar-brand marca" href="index.php">Estante</a>
            <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal" aria-controls="menuPrincipal" aria-expanded="false" aria-label="Abrir menu">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="menuPrincipal">
                <ul class="navbar-nav ms-md-4 gap-md-1">
                    <?php foreach ($menu as $chave => [$arquivo, $rotulo]): ?>
                        <li class="nav-item">
                            <a class="nav-link<?= $chave === $ativo ? ' active' : '' ?>"
                               href="<?= $arquivo ?>"<?= $chave === $ativo ? ' aria-current="page"' : '' ?>><?= $rotulo ?></a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        </div>
    </nav>

    <div id="avisos" class="area-avisos" aria-live="polite"></div>

    <main class="container py-4 py-md-5">
