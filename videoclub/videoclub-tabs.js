/* Tabs accesibles (patron WAI-ARIA Tabs) para videoclub-tabs.html.
   - Un solo panel visible por vez: los inactivos llevan el atributo `hidden`.
   - Roving tabindex: solo el tab activo es tabbable (tabindex=0), el resto -1.
   - Teclado: ArrowLeft/ArrowRight (y ArrowUp/ArrowDown, Home, End) mueven foco y seleccion.
   - Deep-link: ?tab=<clave> o #<clave> seleccionan el tab inicial. */
(function () {
    'use strict';

    var tablist = document.querySelector('[data-testid="tabs-nav"]');

    if (!tablist) {
        return;
    }

    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    if (!tabs.length) {
        return;
    }

    function keyOf(tab) {
        return String(tab.id || '').replace(/^tab-/, '');
    }

    function panelOf(tab) {
        var id = tab.getAttribute('aria-controls');
        return id ? document.getElementById(id) : null;
    }

    // Marca un tab como activo: aria-selected, tabindex y visibilidad de paneles.
    function activate(tab, options) {
        var opts = options || {};

        tabs.forEach(function (item) {
            var selected = item === tab;
            item.setAttribute('aria-selected', String(selected));
            item.setAttribute('tabindex', selected ? '0' : '-1');

            var panel = panelOf(item);

            if (panel) {
                panel.hidden = !selected;
            }
        });

        if (opts.focus) {
            tab.focus();
        }

        if (opts.syncUrl) {
            var key = keyOf(tab);

            if (key && window.location.hash !== '#' + key) {
                window.history.replaceState(null, '', '#' + key);
            }
        }
    }

    // Resuelve el tab pedido por la URL: primero ?tab=, despues #hash.
    function tabFromUrl() {
        var wanted = '';

        try {
            wanted = (new URLSearchParams(window.location.search).get('tab') || '').trim();
        } catch (error) {
            wanted = '';
        }

        if (!wanted) {
            wanted = String(window.location.hash || '').replace(/^#/, '').trim();
        }

        wanted = wanted.toLowerCase();

        if (!wanted) {
            return null;
        }

        for (var i = 0; i < tabs.length; i += 1) {
            if (keyOf(tabs[i]).toLowerCase() === wanted) {
                return tabs[i];
            }
        }

        return null;
    }

    tablist.addEventListener('click', function (event) {
        var tab = event.target.closest('[role="tab"]');

        if (!tab || !tablist.contains(tab)) {
            return;
        }

        activate(tab, { focus: true, syncUrl: true });
    });

    tablist.addEventListener('keydown', function (event) {
        var current = event.target.closest('[role="tab"]');

        if (!current) {
            return;
        }

        var index = tabs.indexOf(current);
        var next = null;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            next = tabs[(index + 1) % tabs.length];
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            next = tabs[(index - 1 + tabs.length) % tabs.length];
        } else if (event.key === 'Home') {
            next = tabs[0];
        } else if (event.key === 'End') {
            next = tabs[tabs.length - 1];
        } else if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
            activate(current, { focus: true, syncUrl: true });
            event.preventDefault();
            return;
        } else {
            return;
        }

        event.preventDefault();
        activate(next, { focus: true, syncUrl: true });
    });

    window.addEventListener('hashchange', function () {
        var tab = tabFromUrl();

        if (tab && tab.getAttribute('aria-selected') !== 'true') {
            activate(tab, { focus: false, syncUrl: false });
        }
    });

    // ---- Tabla de alquileres con formulario embebido (tab Alquileres) ----
    var rentalsForm = document.getElementById('rental-add-form');
    var rentalsBody = document.querySelector('[data-testid="rentals-body"]');
    var rentalsCount = document.querySelector('[data-testid="rentals-count"]');

    if (rentalsForm && rentalsBody) {
        rentalsForm.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!rentalsForm.reportValidity()) {
                return;
            }

            var customer = document.getElementById('rental-add-customer').value.trim();
            var movie = document.getElementById('rental-add-movie').value.trim();
            var due = document.getElementById('rental-add-due').value;
            var id = String(rentalsBody.querySelectorAll('tr').length + 1);

            var row = document.createElement('tr');
            row.setAttribute('data-testid', 'rental-row-' + id);
            row.innerHTML = '<td data-field="id"></td>'
                + '<td data-field="customer"></td>'
                + '<td data-field="movie"></td>'
                + '<td data-field="due"></td>';
            // textContent y no innerHTML: los valores vienen del usuario.
            row.querySelector('[data-field="id"]').textContent = id;
            row.querySelector('[data-field="customer"]').textContent = customer;
            row.querySelector('[data-field="movie"]').textContent = movie;
            row.querySelector('[data-field="due"]').textContent = due;
            row.querySelectorAll('td').forEach(function (cell) {
                cell.setAttribute('data-testid', 'rental-row-' + id + '-' + cell.getAttribute('data-field'));
            });
            rentalsBody.appendChild(row);

            if (rentalsCount) {
                rentalsCount.textContent = String(rentalsBody.querySelectorAll('tr').length);
            }

            rentalsForm.reset();
        });
    }

    // Estado inicial: el tab de la URL o, por defecto, el primero.
    activate(tabFromUrl() || tabs[0], { focus: false, syncUrl: false });
})();
