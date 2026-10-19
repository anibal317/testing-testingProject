/* Tabla simple con datos ya cargados y acciones por fila.
   Un unico modal con cuatro modos: ver (detalle), editar (formulario),
   borrar (confirmacion) y nuevo (alta desde el boton Add New).
   Sin API: todo sale del HTML. */
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
        // Mismo formulario que editar, pero en blanco y sin fila activa.
        var isAdd = mode === 'add';

        viewBlock.hidden = !isView;
        editForm.hidden = !(isEdit || isAdd);
        confirmBlock.hidden = !isDelete;
        saveBtn.hidden = !(isEdit || isAdd);
        deleteBtn.hidden = !isDelete;

        modalTitle.textContent = isView
            ? 'Detalle del registro'
            : (isEdit ? 'Editar registro'
            : (isAdd ? 'Nuevo registro' : 'Borrar registro'));

        if (isView) {
            viewId.textContent = field(row, 'id');
            viewName.textContent = field(row, 'name');
            viewEmail.textContent = field(row, 'email');
            viewRole.textContent = field(row, 'role');
        }

        if (isEdit || isAdd) {
            editId.value = isEdit ? field(row, 'id') : '';
            editName.value = isEdit ? field(row, 'name') : '';
            editEmail.value = isEdit ? field(row, 'email') : '';
            editRole.value = isEdit ? field(row, 'role') : '';
        }

        if (isDelete) {
            confirmBlock.textContent = 'Se va a eliminar "' + field(row, 'name')
                + '". Esta accion no se puede deshacer.';
        }

        // preventScroll evita que el navegador salte al boton cuando el
        // dialogo es mas alto que la pantalla.
        closeBtn.focus({ preventScroll: true });
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

    // "Add New" abre el mismo modal en modo alta.
    var addBtn = document.getElementById('btn-add-new');
    if (addBtn) {
        addBtn.addEventListener('click', function () {
            openModal('add', null);
        });
    }

    saveBtn.addEventListener('click', function () {
        if (!editForm.reportValidity()) {
            return;
        }

        var name = editName.value;
        var email = editEmail.value;
        var role = editRole.value;

        if (modal.getAttribute('data-mode') === 'add') {
            // Siguiente ID libre: contar filas no sirve, porque las bajas
            // dejan huecos.
            var maxId = 0;
            tableBody.querySelectorAll('tr').forEach(function (r) {
                var n = parseInt(r.getAttribute('data-testid').replace(/^row-/, ''), 10);
                if (n > maxId) {
                    maxId = n;
                }
            });

            var id = String(maxId + 1);
            var row = document.createElement('tr');
            row.setAttribute('data-testid', 'row-' + id);
            row.innerHTML = '<td data-field="id"></td><td data-field="name"></td>'
                + '<td data-field="email"></td><td data-field="role"></td>';
            // textContent y no innerHTML: los valores vienen del usuario.
            row.querySelector('[data-field="id"]').textContent = id;
            row.querySelector('[data-field="name"]').textContent = name;
            row.querySelector('[data-field="email"]').textContent = email;
            row.querySelector('[data-field="role"]').textContent = role;
            row.querySelectorAll('td').forEach(function (cell) {
                cell.setAttribute('data-testid', 'row-' + id + '-' + cell.getAttribute('data-field'));
            });
            tableBody.appendChild(row);
        } else if (activeRow) {
            setField(activeRow, 'name', name);
            setField(activeRow, 'email', email);
            setField(activeRow, 'role', role);
        }

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
