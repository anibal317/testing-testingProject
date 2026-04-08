document.addEventListener('DOMContentLoaded', function() {
    const baseUrlInput = document.getElementById('vc-base-url');
    const output = document.getElementById('vc-output');
    const selectedCustomerPill = document.getElementById('vc-selected-customer-pill');
    const statMovies = document.getElementById('vc-stat-movies');
    const statCustomers = document.getElementById('vc-stat-customers');
    const statRentals = document.getElementById('vc-stat-rentals');
    const statStock = document.getElementById('vc-stat-stock');

    const refreshAllBtn = document.getElementById('vc-refresh-all');
    const searchInput = document.getElementById('vc-search');
    const onlyAvailableBtn = document.getElementById('vc-only-available');
    const clearHistoryBtn = document.getElementById('vc-clear-history');

    const customerSelect = document.getElementById('vc-customer-select');
    const customerForm = document.getElementById('vc-customer-form');
    const customerFormMode = document.getElementById('vc-customer-form-mode');
    const customerResetBtn = document.getElementById('vc-customer-reset');
    const customerIdInput = document.getElementById('vc-customer-id');
    const customerNameInput = document.getElementById('vc-customer-name');
    const customerEmailInput = document.getElementById('vc-customer-email');
    const customerPhoneInput = document.getElementById('vc-customer-phone');
    const customerAddressInput = document.getElementById('vc-customer-address');
    const customersBody = document.getElementById('vc-customers-body');

    const loadHistoryBtn = document.getElementById('vc-load-history');
    const rentalForm = document.getElementById('vc-rental-form');
    const rentalCustomerSelect = document.getElementById('vc-rental-customer');
    const rentalMovieSelect = document.getElementById('vc-rental-movie');
    const rentalDueDateInput = document.getElementById('vc-rental-due-date');
    const rentalFillActiveBtn = document.getElementById('vc-rental-fill-active');

    const moviesGrid = document.getElementById('vc-movies-grid');
    const moviesBody = document.getElementById('vc-movies-body');
    const rentalsBody = document.getElementById('vc-rentals-body');
    const historyBody = document.getElementById('vc-history-body');
    const movieForm = document.getElementById('vc-movie-form');
    const movieFormMode = document.getElementById('vc-movie-form-mode');
    const movieResetBtn = document.getElementById('vc-movie-reset');
    const movieIdInput = document.getElementById('vc-movie-id');
    const movieTitleInput = document.getElementById('vc-movie-title');
    const movieDirectorInput = document.getElementById('vc-movie-director');
    const movieGenreInput = document.getElementById('vc-movie-genre');
    const movieReleaseYearInput = document.getElementById('vc-movie-release-year');
    const movieRentalPriceInput = document.getElementById('vc-movie-rental-price');
    const movieDurationInput = document.getElementById('vc-movie-duration');
    const movieTotalCopiesInput = document.getElementById('vc-movie-total-copies');
    const movieAvailableCopiesInput = document.getElementById('vc-movie-available-copies');
    const movieDescriptionInput = document.getElementById('vc-movie-description');

    const state = {
        movies: [],
        customers: [],
        rentals: [],
        onlyAvailable: false,
        selectedCustomerId: '',
        history: []
    };

    function getBaseUrl() {
        return baseUrlInput.value.trim().replace(/\/$/, '');
    }

    function showOutput(payload) {
        output.textContent = JSON.stringify(payload, null, 2);
    }

    function showError(message) {
        showOutput({ error: message });
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

    function normalizeMovie(movie) {
        const availableCopies = movie.available_copies !== undefined
            ? movie.available_copies
            : (movie.stock !== undefined ? movie.stock : movie.quantity);
        const totalCopies = movie.total_copies !== undefined ? movie.total_copies : availableCopies;
        return {
            raw: movie,
            id: getId(movie, ['id', 'movie_id']),
            title: movie.title || movie.name || 'Sin titulo',
            director: movie.director || '',
            genre: movie.genre || 'Sin genero',
            releaseYear: movie.release_year || '',
            availableCopies: Number(availableCopies || 0),
            totalCopies: Number(totalCopies || 0),
            rentalPrice: movie.rental_price || '',
            durationMinutes: movie.duration_minutes || '',
            description: movie.description || movie.notes || movie.format || ''
        };
    }

    function normalizeCustomer(customer) {
        return {
            raw: customer,
            id: getId(customer, ['id', 'customer_id']),
            name: customer.name || customer.full_name || 'Sin nombre',
            email: customer.email || '',
            phone: customer.phone || customer.phone_number || '',
            address: customer.address || ''
        };
    }

    function formatDateInputValue(date) {
        return date.toISOString().slice(0, 10);
    }

    function getDefaultDueDate() {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);
        return formatDateInputValue(dueDate);
    }

    function formatDisplayDate(rawDate) {
        if (!rawDate) {
            return '-';
        }

        const parsedDate = new Date(rawDate);
        if (Number.isNaN(parsedDate.getTime())) {
            return String(rawDate);
        }

        return parsedDate.toLocaleDateString('es-ES');
    }

    function updateStats() {
        const totalStock = state.movies.reduce(function(sum, movie) {
            const normalized = normalizeMovie(movie);
            return sum + normalized.availableCopies;
        }, 0);

        statMovies.textContent = String(state.movies.length);
        statCustomers.textContent = String(state.customers.length);
        statRentals.textContent = String(state.rentals.length);
        statStock.textContent = String(totalStock);
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
            rentalCustomerSelect.innerHTML = '<option value="">Sin clientes disponibles</option>';
            state.selectedCustomerId = '';
            renderCustomerPill();
            return;
        }

        const options = state.customers.map(function(customer) {
            const normalized = normalizeCustomer(customer);
            const id = normalized.id;
            const name = escapeHtml(normalized.name);
            const email = escapeHtml(normalized.email || 'Sin email');
            const selected = state.selectedCustomerId === id ? ' selected' : '';
            return `<option value="${id}"${selected}>${name} - ${email}</option>`;
        }).join('');

        customerSelect.innerHTML = options;
        rentalCustomerSelect.innerHTML = `<option value="">Selecciona un cliente</option>${options}`;

        if (!state.selectedCustomerId) {
            state.selectedCustomerId = getId(state.customers[0], ['id', 'customer_id']);
            customerSelect.value = state.selectedCustomerId;
        }

        rentalCustomerSelect.value = state.selectedCustomerId || '';

        renderCustomerPill();
    }

    function movieMatchesFilter(movie) {
        const search = searchInput.value.trim().toLowerCase();
        const normalized = normalizeMovie(movie);
        const title = String(normalized.title).toLowerCase();
        const genre = String(normalized.genre).toLowerCase();
        const stock = normalized.availableCopies;

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
            const normalized = normalizeMovie(movie);
            const id = normalized.id;
            const title = escapeHtml(normalized.title);
            const genre = escapeHtml(normalized.genre);
            const stock = normalized.availableCopies;
            const stockLabel = stock > 0 ? `${stock} disponibles` : 'Sin stock';
            const stockClass = stock > 0 ? 'vc-stock-badge' : 'vc-stock-badge out';
            const disabled = stock > 0 ? '' : ' disabled';
            const director = normalized.director ? `Dir. ${escapeHtml(normalized.director)}` : 'Director no informado';
            const price = normalized.rentalPrice ? `USD ${escapeHtml(String(normalized.rentalPrice))}` : 'Precio pendiente';

            return `<article class="vc-movie-item"><h4>${title}</h4><p class="vc-movie-meta">${director}</p><p class="vc-movie-meta">Genero: ${genre} · ${price}</p><span class="${stockClass}">${stockLabel}</span><div class="vc-card-actions"><button type="button" class="vc-rent-button" data-movie-id="${id}"${disabled}>Alquilar</button><button type="button" class="ghost" data-edit-movie="${id}">Editar</button></div></article>`;
        }).join('');
    }

    function renderMoviesTable() {
        if (!state.movies.length) {
            moviesBody.innerHTML = '<tr><td colspan="6">Sin peliculas cargadas.</td></tr>';
            rentalMovieSelect.innerHTML = '<option value="">Sin peliculas disponibles</option>';
            return;
        }

        const sortedMovies = state.movies.slice().sort(function(a, b) {
            return normalizeMovie(a).title.localeCompare(normalizeMovie(b).title);
        });

        rentalMovieSelect.innerHTML = '<option value="">Selecciona una pelicula</option>' + sortedMovies.map(function(movie) {
            const normalized = normalizeMovie(movie);
            const stockSuffix = normalized.availableCopies > 0 ? ` (${normalized.availableCopies})` : ' (sin stock)';
            return `<option value="${escapeHtml(normalized.id)}">${escapeHtml(normalized.title)}${stockSuffix}</option>`;
        }).join('');

        moviesBody.innerHTML = sortedMovies.map(function(movie) {
            const normalized = normalizeMovie(movie);
            const copiesLabel = `${normalized.availableCopies}/${normalized.totalCopies}`;
            const priceLabel = normalized.rentalPrice ? `USD ${normalized.rentalPrice}` : '-';
            return `<tr><td>${escapeHtml(normalized.id)}</td><td>${escapeHtml(normalized.title)}</td><td>${escapeHtml(normalized.genre)}</td><td>${escapeHtml(copiesLabel)}</td><td>${escapeHtml(priceLabel)}</td><td><div class="vc-card-actions"><button type="button" class="ghost" data-edit-movie="${escapeHtml(normalized.id)}">Editar</button><button type="button" class="danger" data-delete-movie="${escapeHtml(normalized.id)}">Eliminar</button></div></td></tr>`;
        }).join('');
    }

    function renderCustomersTable() {
        if (!state.customers.length) {
            customersBody.innerHTML = '<tr><td colspan="5">Sin clientes cargados.</td></tr>';
            return;
        }

        const sortedCustomers = state.customers.slice().sort(function(a, b) {
            return normalizeCustomer(a).name.localeCompare(normalizeCustomer(b).name);
        });

        customersBody.innerHTML = sortedCustomers.map(function(customer) {
            const normalized = normalizeCustomer(customer);
            return `<tr><td>${escapeHtml(normalized.id)}</td><td>${escapeHtml(normalized.name)}</td><td>${escapeHtml(normalized.email || 'Sin email')}</td><td>${escapeHtml(normalized.phone || normalized.address || 'Sin telefono')}</td><td><div class="vc-card-actions"><button type="button" class="ghost" data-edit-customer="${escapeHtml(normalized.id)}">Editar</button><button type="button" class="danger" data-delete-customer="${escapeHtml(normalized.id)}">Eliminar</button></div></td></tr>`;
        }).join('');
    }

    function renderRentals() {
        if (!state.rentals.length) {
            rentalsBody.innerHTML = '<tr><td colspan="5">Sin alquileres activos.</td></tr>';
            return;
        }

        rentalsBody.innerHTML = state.rentals.map(function(rental) {
            const id = getId(rental, ['id', 'rental_id']);
            const customerId = getId(rental, ['customer_id', 'customer']);
            const movieId = getId(rental, ['movie_id', 'movie']);
            const customer = state.customers.find(function(item) {
                return getId(item, ['id', 'customer_id']) === String(customerId);
            });
            const movie = state.movies.find(function(item) {
                return getId(item, ['id', 'movie_id']) === String(movieId);
            });
            const customerLabel = customer ? normalizeCustomer(customer).name : customerId;
            const movieLabel = movie ? normalizeMovie(movie).title : movieId;
            const dueDate = formatDisplayDate(rental.due_date);

            return `<tr><td>${escapeHtml(id)}</td><td>${escapeHtml(String(customerLabel))}</td><td>${escapeHtml(String(movieLabel))}</td><td>${escapeHtml(dueDate)}</td><td><button type="button" class="danger" data-return-id="${escapeHtml(id)}">Marcar devuelto</button></td></tr>`;
        }).join('');
    }

    function renderHistoryRows(rentals) {
        state.history = rentals.slice();
        if (!rentals.length) {
            historyBody.innerHTML = '<tr><td colspan="3">Este cliente aun no tiene historial.</td></tr>';
            return;
        }

        historyBody.innerHTML = rentals.map(function(rental) {
            const id = escapeHtml(getId(rental, ['id', 'rental_id']));
            const movieId = getId(rental, ['movie_id', 'movie']);
            const movie = state.movies.find(function(item) {
                return getId(item, ['id', 'movie_id']) === String(movieId);
            });
            const status = rental.status || (rental.returned || rental.return_date ? 'returned' : 'active');
            const movieLabel = movie ? normalizeMovie(movie).title : movieId;
            return `<tr><td>${id}</td><td>${escapeHtml(String(movieLabel))}</td><td>${escapeHtml(String(status))}</td></tr>`;
        }).join('');
    }

    function clearHistory() {
        state.history = [];
        historyBody.innerHTML = '<tr><td colspan="3">Sin historial cargado.</td></tr>';
    }

    function resetMovieForm() {
        movieForm.reset();
        movieIdInput.value = '';
        movieFormMode.textContent = 'Alta';
        movieRentalPriceInput.value = '';
        movieTotalCopiesInput.value = '1';
        movieAvailableCopiesInput.value = '1';
    }

    function resetCustomerForm() {
        customerForm.reset();
        customerIdInput.value = '';
        customerFormMode.textContent = 'Alta';
    }

    function fillMovieForm(movieId) {
        const movie = state.movies.find(function(item) {
            return getId(item, ['id', 'movie_id']) === String(movieId);
        });

        if (!movie) {
            showError('No se encontro la pelicula seleccionada.');
            return;
        }

        const normalized = normalizeMovie(movie);
        movieIdInput.value = normalized.id;
        movieTitleInput.value = normalized.title;
        movieDirectorInput.value = normalized.director;
        movieGenreInput.value = normalized.genre;
        movieReleaseYearInput.value = normalized.releaseYear;
        movieRentalPriceInput.value = normalized.rentalPrice;
        movieDurationInput.value = normalized.durationMinutes;
        movieTotalCopiesInput.value = String(normalized.totalCopies);
        movieAvailableCopiesInput.value = String(normalized.availableCopies);
        movieDescriptionInput.value = normalized.description;
        movieFormMode.textContent = `Edicion #${normalized.id}`;
        movieTitleInput.focus();
    }

    function fillCustomerForm(customerId) {
        const customer = state.customers.find(function(item) {
            return getId(item, ['id', 'customer_id']) === String(customerId);
        });

        if (!customer) {
            showError('No se encontro el cliente seleccionado.');
            return;
        }

        const normalized = normalizeCustomer(customer);
        customerIdInput.value = normalized.id;
        customerNameInput.value = normalized.name;
        customerEmailInput.value = normalized.email;
        customerPhoneInput.value = normalized.phone;
        customerAddressInput.value = normalized.address;
        customerFormMode.textContent = `Edicion #${normalized.id}`;
        customerNameInput.focus();
    }

    function buildMoviePayload() {
        const title = movieTitleInput.value.trim();
        const director = movieDirectorInput.value.trim();
        const genre = movieGenreInput.value.trim();
        const releaseYear = movieReleaseYearInput.value.trim();
        const rentalPrice = movieRentalPriceInput.value.trim();
        const durationMinutes = movieDurationInput.value.trim();
        const totalCopies = movieTotalCopiesInput.value.trim();
        const availableCopies = movieAvailableCopiesInput.value.trim();
        const description = movieDescriptionInput.value.trim();

        if (!title || !rentalPrice || !totalCopies || availableCopies === '') {
            return null;
        }

        if (Number(availableCopies) > Number(totalCopies)) {
            showError('Las copias disponibles no pueden superar las copias totales.');
            return null;
        }

        const payload = {
            title,
            rental_price: Number(rentalPrice),
            total_copies: Number(totalCopies),
            available_copies: Number(availableCopies)
        };

        if (director) {
            payload.director = director;
        }

        if (genre) {
            payload.genre = genre;
        }

        if (releaseYear) {
            payload.release_year = Number(releaseYear);
        }

        if (durationMinutes) {
            payload.duration_minutes = Number(durationMinutes);
        }

        if (description) {
            payload.description = description;
        }

        return payload;
    }

    function buildCustomerPayload() {
        const name = customerNameInput.value.trim();
        const email = customerEmailInput.value.trim();
        const phone = customerPhoneInput.value.trim();
        const address = customerAddressInput.value.trim();

        if (!name || !email) {
            return null;
        }

        const payload = {
            name,
            email
        };

        if (phone) {
            payload.phone = phone;
        }

        if (address) {
            payload.address = address;
        }

        return payload;
    }

    async function refreshMovies() {
        const result = await runRequest('Cargar catalogo', 'GET', '/api/movies');
        if (result && result.ok && Array.isArray(result.data)) {
            state.movies = result.data;
            renderMovies();
            renderMoviesTable();
            updateStats();
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
            renderCustomersTable();
            updateStats();
        }
    }

    async function refreshActiveRentals() {
        const result = await runRequest('Cargar alquileres activos', 'GET', '/api/rentals/active');
        if (result && result.ok && Array.isArray(result.data)) {
            state.rentals = result.data;
            renderRentals();
            updateStats();
        }
    }

    async function refreshAll() {
        await Promise.all([refreshCustomers(), refreshMovies(), refreshActiveRentals()]);
    }

    async function createRentalForMovie(movieId) {
        if (!state.selectedCustomerId) {
            showError('Selecciona un cliente antes de alquilar.');
            return;
        }

        const dueDate = rentalDueDateInput.value || getDefaultDueDate();

        const payload = {
            customer_id: Number(state.selectedCustomerId),
            movie_id: Number(movieId),
            due_date: dueDate
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
            showError('Selecciona un cliente para ver historial.');
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

    async function submitMovieForm() {
        const payload = buildMoviePayload();
        const movieId = movieIdInput.value.trim();

        if (!payload) {
            showError('Completa titulo, precio de alquiler y copias para guardar la pelicula.');
            return;
        }

        const result = movieId
            ? await runRequest('Actualizar pelicula', 'PUT', `/api/movies/${encodeURIComponent(movieId)}`, payload)
            : await runRequest('Crear pelicula', 'POST', '/api/movies', payload);

        if (result && result.ok) {
            resetMovieForm();
            await refreshMovies();
        }
    }

    async function submitCustomerForm() {
        const payload = buildCustomerPayload();
        const customerId = customerIdInput.value.trim();

        if (!payload) {
            showError('Completa nombre y correo para guardar el cliente.');
            return;
        }

        const result = customerId
            ? await runRequest('Actualizar cliente', 'PUT', `/api/customers/${encodeURIComponent(customerId)}`, payload)
            : await runRequest('Crear cliente', 'POST', '/api/customers', payload);

        if (result && result.ok) {
            resetCustomerForm();
            await refreshCustomers();
        }
    }

    async function deleteMovie(movieId) {
        if (!window.confirm(`Eliminar la pelicula ${movieId}?`)) {
            return;
        }

        const result = await runRequest('Eliminar pelicula', 'DELETE', `/api/movies/${encodeURIComponent(movieId)}`);
        if (result && result.ok) {
            if (movieIdInput.value === String(movieId)) {
                resetMovieForm();
            }
            await refreshMovies();
            await refreshActiveRentals();
        }
    }

    async function deleteCustomer(customerId) {
        if (!window.confirm(`Eliminar el cliente ${customerId}?`)) {
            return;
        }

        const result = await runRequest('Eliminar cliente', 'DELETE', `/api/customers/${encodeURIComponent(customerId)}`);
        if (result && result.ok) {
            if (customerIdInput.value === String(customerId)) {
                resetCustomerForm();
            }
            if (state.selectedCustomerId === String(customerId)) {
                state.selectedCustomerId = '';
                clearHistory();
            }
            await refreshCustomers();
            await refreshActiveRentals();
        }
    }

    async function submitRentalForm() {
        const customerId = rentalCustomerSelect.value || state.selectedCustomerId;
        const movieId = rentalMovieSelect.value;
        const dueDate = rentalDueDateInput.value;

        if (!customerId || !movieId || !dueDate) {
            showError('Selecciona cliente, pelicula y fecha de devolucion para crear el alquiler.');
            return;
        }

        const payload = {
            customer_id: Number(customerId),
            movie_id: Number(movieId),
            due_date: dueDate
        };

        const result = await runRequest('Crear alquiler', 'POST', '/api/rentals', payload);
        if (result && result.ok) {
            rentalMovieSelect.value = '';
            rentalDueDateInput.value = getDefaultDueDate();
            state.selectedCustomerId = String(customerId);
            customerSelect.value = state.selectedCustomerId;
            renderCustomerPill();
            await refreshMovies();
            await refreshActiveRentals();
            await loadCustomerHistory();
        }
    }

    refreshAllBtn.addEventListener('click', refreshAll);

    customerSelect.addEventListener('change', function() {
        state.selectedCustomerId = customerSelect.value;
        rentalCustomerSelect.value = state.selectedCustomerId;
        renderCustomerPill();
    });

    customerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitCustomerForm();
    });

    customerResetBtn.addEventListener('click', resetCustomerForm);

    movieForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        await submitMovieForm();
    });

    movieResetBtn.addEventListener('click', resetMovieForm);

    rentalForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        await submitRentalForm();
    });

    rentalFillActiveBtn.addEventListener('click', function() {
        rentalCustomerSelect.value = state.selectedCustomerId;
    });

    searchInput.addEventListener('input', renderMovies);

    onlyAvailableBtn.addEventListener('click', function() {
        state.onlyAvailable = !state.onlyAvailable;
        onlyAvailableBtn.textContent = state.onlyAvailable ? 'Mostrando disponibles' : 'Solo disponibles';
        renderMovies();
    });

    moviesGrid.addEventListener('click', function(event) {
        const rentButton = event.target.closest('[data-movie-id]');
        if (rentButton) {
            const movieId = rentButton.getAttribute('data-movie-id');
            if (movieId) {
                createRentalForMovie(movieId);
            }
            return;
        }

        const editButton = event.target.closest('[data-edit-movie]');
        if (editButton) {
            const movieId = editButton.getAttribute('data-edit-movie');
            if (movieId) {
                fillMovieForm(movieId);
            }
        }
    });

    moviesBody.addEventListener('click', function(event) {
        const editButton = event.target.closest('[data-edit-movie]');
        if (editButton) {
            const movieId = editButton.getAttribute('data-edit-movie');
            if (movieId) {
                fillMovieForm(movieId);
            }
            return;
        }

        const deleteButton = event.target.closest('[data-delete-movie]');
        if (deleteButton) {
            const movieId = deleteButton.getAttribute('data-delete-movie');
            if (movieId) {
                deleteMovie(movieId);
            }
        }
    });

    customersBody.addEventListener('click', function(event) {
        const editButton = event.target.closest('[data-edit-customer]');
        if (editButton) {
            const customerId = editButton.getAttribute('data-edit-customer');
            if (customerId) {
                fillCustomerForm(customerId);
            }
            return;
        }

        const deleteButton = event.target.closest('[data-delete-customer]');
        if (deleteButton) {
            const customerId = deleteButton.getAttribute('data-delete-customer');
            if (customerId) {
                deleteCustomer(customerId);
            }
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
    clearHistoryBtn.addEventListener('click', clearHistory);

    resetMovieForm();
    resetCustomerForm();
    rentalDueDateInput.value = getDefaultDueDate();
    clearHistory();
    refreshAll();
});
