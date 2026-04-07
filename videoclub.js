document.addEventListener('DOMContentLoaded', function() {
    const baseUrlInput = document.getElementById('vc-base-url');
    const output = document.getElementById('vc-output');
    const selectedCustomerPill = document.getElementById('vc-selected-customer-pill');

    const refreshAllBtn = document.getElementById('vc-refresh-all');
    const searchInput = document.getElementById('vc-search');
    const onlyAvailableBtn = document.getElementById('vc-only-available');

    const customerSelect = document.getElementById('vc-customer-select');
    const createCustomerForm = document.getElementById('vc-create-customer-form');
    const customerNameInput = document.getElementById('vc-customer-name');
    const customerEmailInput = document.getElementById('vc-customer-email');

    const loadHistoryBtn = document.getElementById('vc-load-history');

    const moviesGrid = document.getElementById('vc-movies-grid');
    const rentalsBody = document.getElementById('vc-rentals-body');
    const historyBody = document.getElementById('vc-history-body');

    const state = {
        movies: [],
        customers: [],
        rentals: [],
        onlyAvailable: false,
        selectedCustomerId: ''
    };

    function getBaseUrl() {
        return baseUrlInput.value.trim().replace(/\/$/, '');
    }

    function showOutput(payload) {
        output.textContent = JSON.stringify(payload, null, 2);
    }

    function parseJsonSafe(raw) {
        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    }

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getId(item, keys) {
        for (let i = 0; i < keys.length; i++) {
            const value = item[keys[i]];
            if (value !== undefined && value !== null && value !== '') {
                return String(value);
            }
        }
        return '';
    }

    async function apiRequest(method, path, body) {
        const url = `${getBaseUrl()}${path}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const text = await response.text();
        const parsed = parseJsonSafe(text);

        return {
            method,
            path,
            status: response.status,
            ok: response.ok,
            data: parsed !== null ? parsed : text
        };
    }

    async function runRequest(label, method, path, body) {
        showOutput({ loading: `${method} ${path}`, label });
        try {
            const result = await apiRequest(method, path, body);
            showOutput(result);
            return result;
        } catch (error) {
            showOutput({ label, error: error.message });
            return null;
        }
    }

    function selectedCustomer() {
        return state.customers.find(function(customer) {
            return getId(customer, ['id', 'customer_id']) === state.selectedCustomerId;
        });
    }

    function renderCustomerPill() {
        const current = selectedCustomer();
        if (!current) {
            selectedCustomerPill.textContent = 'Cliente no seleccionado';
            return;
        }

        const name = current.name || current.full_name || 'Cliente';
        const id = getId(current, ['id', 'customer_id']);
        selectedCustomerPill.textContent = `${name} (ID ${id})`;
    }

    function renderCustomerSelect() {
        if (!state.customers.length) {
            customerSelect.innerHTML = '<option value="">Sin clientes disponibles</option>';
            state.selectedCustomerId = '';
            renderCustomerPill();
            return;
        }

        customerSelect.innerHTML = state.customers.map(function(customer) {
            const id = getId(customer, ['id', 'customer_id']);
            const name = escapeHtml(customer.name || customer.full_name || 'Sin nombre');
            const email = escapeHtml(customer.email || 'Sin email');
            const selected = state.selectedCustomerId === id ? ' selected' : '';
            return `<option value="${id}"${selected}>${name} - ${email}</option>`;
        }).join('');

        if (!state.selectedCustomerId) {
            state.selectedCustomerId = getId(state.customers[0], ['id', 'customer_id']);
            customerSelect.value = state.selectedCustomerId;
        }

        renderCustomerPill();
    }

    function movieMatchesFilter(movie) {
        const search = searchInput.value.trim().toLowerCase();
        const title = String(movie.title || movie.name || '').toLowerCase();
        const genre = String(movie.genre || '').toLowerCase();
        const stock = Number(movie.stock || movie.quantity || 0);

        const matchesText = !search || title.includes(search) || genre.includes(search);
        const matchesStock = !state.onlyAvailable || stock > 0;

        return matchesText && matchesStock;
    }

    function renderMovies() {
        const visibleMovies = state.movies.filter(movieMatchesFilter);

        if (!visibleMovies.length) {
            moviesGrid.innerHTML = '<p class="vc-placeholder">No hay resultados para ese filtro.</p>';
            return;
        }

        moviesGrid.innerHTML = visibleMovies.map(function(movie) {
            const id = getId(movie, ['id', 'movie_id']);
            const title = escapeHtml(movie.title || movie.name || 'Sin titulo');
            const genre = escapeHtml(movie.genre || 'Sin genero');
            const stock = Number(movie.stock || movie.quantity || 0);
            const stockLabel = stock > 0 ? `${stock} disponibles` : 'Sin stock';
            const stockClass = stock > 0 ? 'vc-stock-badge' : 'vc-stock-badge out';
            const disabled = stock > 0 ? '' : ' disabled';

            return `<article class="vc-movie-item"><h4>${title}</h4><p class="vc-movie-meta">Genero: ${genre}</p><span class="${stockClass}">${stockLabel}</span><button type="button" class="vc-rent-button" data-movie-id="${id}"${disabled}>Alquilar</button></article>`;
        }).join('');
    }

    function renderRentals() {
        if (!state.rentals.length) {
            rentalsBody.innerHTML = '<tr><td colspan="4">Sin alquileres activos.</td></tr>';
            return;
        }

        rentalsBody.innerHTML = state.rentals.map(function(rental) {
            const id = getId(rental, ['id', 'rental_id']);
            const customerId = escapeHtml(getId(rental, ['customer_id', 'customer']));
            const movieId = escapeHtml(getId(rental, ['movie_id', 'movie']));

            return `<tr><td>${escapeHtml(id)}</td><td>${customerId}</td><td>${movieId}</td><td><button type="button" class="danger" data-return-id="${escapeHtml(id)}">Marcar devuelto</button></td></tr>`;
        }).join('');
    }

    function renderHistoryRows(rentals) {
        if (!rentals.length) {
            historyBody.innerHTML = '<tr><td colspan="3">Este cliente aun no tiene historial.</td></tr>';
            return;
        }

        historyBody.innerHTML = rentals.map(function(rental) {
            const id = escapeHtml(getId(rental, ['id', 'rental_id']));
            const movieId = escapeHtml(getId(rental, ['movie_id', 'movie']));
            const status = rental.returned || rental.return_date ? 'Devuelto' : 'Activo';
            return `<tr><td>${id}</td><td>${movieId}</td><td>${status}</td></tr>`;
        }).join('');
    }

    async function refreshMovies() {
        const result = await runRequest('Cargar catalogo', 'GET', '/api/movies');
        if (result && result.ok && Array.isArray(result.data)) {
            state.movies = result.data;
            renderMovies();
        }
    }

    async function refreshCustomers() {
        const result = await runRequest('Cargar clientes', 'GET', '/api/customers');
        if (result && result.ok && Array.isArray(result.data)) {
            state.customers = result.data;

            if (!state.selectedCustomerId) {
                state.selectedCustomerId = getId(result.data[0] || {}, ['id', 'customer_id']);
            }

            renderCustomerSelect();
        }
    }

    async function refreshActiveRentals() {
        const result = await runRequest('Cargar alquileres activos', 'GET', '/api/rentals/active');
        if (result && result.ok && Array.isArray(result.data)) {
            state.rentals = result.data;
            renderRentals();
        }
    }

    async function refreshAll() {
        await Promise.all([refreshCustomers(), refreshMovies(), refreshActiveRentals()]);
    }

    async function createRentalForMovie(movieId) {
        if (!state.selectedCustomerId) {
            showOutput({ error: 'Selecciona un cliente antes de alquilar.' });
            return;
        }

        const payload = {
            customer_id: Number(state.selectedCustomerId),
            movie_id: Number(movieId)
        };

        const result = await runRequest('Crear alquiler', 'POST', '/api/rentals', payload);
        if (result && result.ok) {
            await refreshMovies();
            await refreshActiveRentals();
        }
    }

    async function returnRental(rentalId) {
        const result = await runRequest('Registrar devolucion', 'PUT', `/api/rentals/${encodeURIComponent(rentalId)}/return`);
        if (result && result.ok) {
            await refreshMovies();
            await refreshActiveRentals();
        }
    }

    async function loadCustomerHistory() {
        if (!state.selectedCustomerId) {
            showOutput({ error: 'Selecciona un cliente para ver historial.' });
            return;
        }

        const result = await runRequest(
            'Cargar historial por cliente',
            'GET',
            `/api/customers/${encodeURIComponent(state.selectedCustomerId)}/rentals`
        );

        if (result && result.ok && Array.isArray(result.data)) {
            renderHistoryRows(result.data);
        }
    }

    refreshAllBtn.addEventListener('click', refreshAll);

    customerSelect.addEventListener('change', function() {
        state.selectedCustomerId = customerSelect.value;
        renderCustomerPill();
    });

    createCustomerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const payload = {
            name: customerNameInput.value.trim(),
            email: customerEmailInput.value.trim()
        };

        if (!payload.name || !payload.email) {
            showOutput({ error: 'Completa nombre y correo para crear cliente.' });
            return;
        }

        const result = await runRequest('Crear cliente', 'POST', '/api/customers', payload);
        if (result && result.ok) {
            customerNameInput.value = '';
            customerEmailInput.value = '';
            await refreshCustomers();
        }
    });

    searchInput.addEventListener('input', renderMovies);

    onlyAvailableBtn.addEventListener('click', function() {
        state.onlyAvailable = !state.onlyAvailable;
        onlyAvailableBtn.textContent = state.onlyAvailable ? 'Mostrando disponibles' : 'Solo disponibles';
        renderMovies();
    });

    moviesGrid.addEventListener('click', function(event) {
        const button = event.target.closest('[data-movie-id]');
        if (!button) {
            return;
        }

        const movieId = button.getAttribute('data-movie-id');
        if (movieId) {
            createRentalForMovie(movieId);
        }
    });

    rentalsBody.addEventListener('click', function(event) {
        const button = event.target.closest('[data-return-id]');
        if (!button) {
            return;
        }

        const rentalId = button.getAttribute('data-return-id');
        if (rentalId) {
            returnRental(rentalId);
        }
    });

    loadHistoryBtn.addEventListener('click', loadCustomerHistory);

    refreshAll();
});
