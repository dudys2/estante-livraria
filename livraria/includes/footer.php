<?php
declare(strict_types=1);

$script ??= '';
?>
    </main>

    <div class="modal fade" id="modalConfirmacao" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content">
                <div class="modal-body pt-4">
                    <p class="mb-0" id="textoConfirmacao"></p>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="botaoConfirmar">Excluir</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="assets/js/nucleo/app.js"></script>
    <?php if ($script !== ''): ?>
        <script type="module" src="assets/js/paginas/<?= htmlspecialchars($script) ?>.js"></script>
    <?php endif; ?>
</body>
</html>
