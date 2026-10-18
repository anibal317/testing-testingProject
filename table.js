/* Tabla simple con datos ya cargados y acciones por fila.
   Un unico modal con tres modos: ver (detalle), editar (formulario) y
   borrar (confirmacion). Sin API: todo sale del HTML. */
(function () {
    'use strict';

    var modal = document.getElementById('row-modal');
    var tableBody = document.querySelector('[data-testid="data-table-body"]');

    if (!modal || !tableBody) {
        return;
    }

    var modalTitle = document.getElementById('row-modal-title');
    var viewBlock = document.querySelector('[data-testid="row-modal-view"]');
    var editForm = document.getElementById('row-edit-form');
    var confirmBlock = document.querySelector('[data-testid="row-modal-confirm"]');
    var saveBtn = document.getElementById('row-modal-save');
    var deleteBtn = document.getElementById('row-modal-delete');
    var closeBtn = document.getElementById('row-modal-close');
    var editId = document.getElementById('row-edit-id');
    var editName = document.getElementById('row-edit-name');
    var editEmail = document.getElementById('row-edit-email');
    var editRole = document.getElementById('row-edit-role');

    var viewId = document.querySelector('[data-testid="row-modal-id"]');
    var viewName = document.querySelector('[data-testid="row-modal-name"]');
    var viewEmail = document.querySelector('[data-testid="row-modal-email"]');
    var viewRole = document.querySelector('[data-testid="row-modal-role"]');

    var activeRow = null;

    // Lee el valor de una celda por su data-field.
    function field(row, name) {
        var cell = row.querySelector('[data-field="' + name + '"]');
        return cell ? cell.textContent.trim() : '';
    }

    function setField(row, name, value) {
        var cell = row.querySelector('[data-field="' + name + '"]');
        if (cell) {
            cell.textContent = value;
        }
    }

    function openModal(mode, row) {
        activeRow = row;
        modal.setAttribute('data-mode', mode);
        modal.hidden = false;

        var isView = mode === 'view';
        var isEdit = mode === 'edit';
        var isDelete = mode === 'delete';

        viewBlock.hidden = !isView;
        editForm.hidden = !isEdit;
        confirmBlock.hidden = !isDelete;
        saveBtn.hidden = !isEdit;
        deleteBtn.hidden = !isDelete;

        modalTitle.textContent = isView
            ? 'Detalle del registro'
            : (isEdit ? 'Editar registro' : 'Borrar registro');

        if (isView) {
            viewId.textContent = field(row, 'id');
            viewName.textContent = field(row, 'name');
            viewEmail.textContent = field(row, 'email');
            viewRole.textContent = field(row, 'role');
        }

        if (isEdit) {
            editId.value = field(row, 'id');
            editName.value = field(row, 'name');
            editEmail.value = field(row, 'email');
            editRole.value = field(row, 'role');
        }

        if (isDelete) {
            confirmBlock.textContent = 'Se va a eliminar "' + field(row, 'name')
                + '". Esta accion no se puede deshacer.';
        }

        closeBtn.focus();
    }

    function closeModal() {
        modal.hidden = true;
        modal.setAttribute('data-mode', '');
        activeRow = null;
    }

    // Delegacion: cualquier boton con data-action dentro del tbody.
    tableBody.addEventListener('click', function (event) {
        var button = event.target.closest('[data-action]');

        if (!button) {
            return;
        }

        var row = button.closest('tr');

        if (!row) {
            return;
        }

        openModal(button.getAttribute('data-action'), row);
    });

    closeBtn.addEventListener('click', closeModal);

    saveBtn.addEventListener('click', function () {
        if (!activeRow || !editForm.reportValidity()) {
            return;
        }

        setField(activeRow, 'name', editName.value);
        setField(activeRow, 'email', editEmail.value);
        setField(activeRow, 'role', editRole.value);
        closeModal();
    });

    deleteBtn.addEventListener('click', function () {
        if (!activeRow) {
            return;
        }

        activeRow.remove();
        closeModal();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !modal.hidden) {
            closeModal();
        }
    });
})();
