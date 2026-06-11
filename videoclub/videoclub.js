document.addEventListener('DOMContentLoaded', function() {
    const AUTH_STORAGE_KEY = 'vc_auth_session';

    const baseUrlInput = document.getElementById('vc-base-url');
    const output = document.getElementById('vc-output');
    const authForm = document.getElementById('vc-auth-form');
    const authEmailInput = document.getElementById('vc-auth-email');
    const authPasswordInput = document.getElementById('vc-auth-password');
    const registerBtn = document.getElementById('vc-register-btn');
    const logoutBtn = document.getElementById('vc-logout-btn');
    const authStatus = document.getElementById('vc-auth-status');
    const authRoleChip = document.getElementById('vc-auth-role');
    const selectedCustomerPill = document.getElementById('vc-selected-customer-pill');
    const statMovies = document.getElementById('vc-stat-movies');
    const statCustomers = document.getElementById('vc-stat-customers');
    const statRentals = document.getElementById('vc-stat-rentals');
    const statStock = document.getElementById('vc-stat-stock');

    const refreshAllBtn = document.getElementById('vc-refresh-all');
    const healthCheckBtn = document.getElementById('vc-health-check');
    const apiInfoBtn = document.getElementById('vc-api-info');
    const searchInput = document.getElementById('vc-search');
    const onlyAvailableBtn = document.getElementById('vc-only-available');
    const clearHistoryBtn = document.getElementById('vc-clear-history');

    const customerSelect = document.getElementById('vc-customer-select');
    const customerForm = document.getElementById('vc-customer-form') || document.getElementById('vc-create-customer-form');
    const customerFormMode = document.getElementById('vc-customer-form-mode');
    const customerResetBtn = document.getElementById('vc-customer-reset');
    const customerIdInput = document.getElementById('vc-customer-id');
    const customerNameInput = document.getElementById('vc-customer-name');
    const customerEmailInput = document.getElementById('vc-customer-email');
    const customerPhoneInput = document.getElementById('vc-customer-phone');
    const customerAddressInput = document.getElementById('vc-customer-address');
    const customersBody = document.getElementById('vc-customers-body');

    const userForm = document.getElementById('vc-user-form');
    const userFormMode = document.getElementById('vc-user-form-mode');
    const userResetBtn = document.getElementById('vc-user-reset');
    const userIdInput = document.getElementById('vc-user-id');
    const userEmailInput = document.getElementById('vc-user-email');
    const userRoleInput = document.getElementById('vc-user-role');
    const userPasswordInput = document.getElementById('vc-user-password');
    const usersBody = document.getElementById('vc-users-body');

    const candyForm = document.getElementById('vc-candy-form');
    const candyFormMode = document.getElementById('vc-candy-form-mode');
    const candyResetBtn = document.getElementById('vc-candy-reset');
    const candyIdInput = document.getElementById('vc-candy-id');
    const candyNameInput = document.getElementById('vc-candy-name');
    const candyCategoryInput = document.getElementById('vc-candy-category');
    const candyPriceInput = document.getElementById('vc-candy-price');
    const candyStockInput = document.getElementById('vc-candy-stock');
    const candyBody = document.getElementById('vc-candy-body');

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

    function bindEvent(element, eventName, handler) {
        if (element) {
            element.addEventListener(eventName, handler);
        }
    }

    const state = {
        movies: [],
        customers: [],
        users: [],
        candyProducts: [],
        rentals: [],
        onlyAvailable: false,
        selectedCustomerId: '',
        history: [],
        auth: {
            token: '',
            user: null
        }
    };

    function hasSession() {
        return Boolean(state.auth.token);
    }

    function isAdmin() {
        return Boolean(state.auth.user && state.auth.user.role === 'admin');
    }

    function setAuthStatus(message) {
        if (authStatus) {
            authStatus.textContent = message;
        }
    }

    function saveSession() {
        const payload = {
            token: state.auth.token,
            user: state.auth.user
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    }

    function clearSession() {
        state.auth.token = '';
        state.auth.user = null;
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    function loadSession() {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) {
            return;
        }

        const parsed = parseJsonSafe(raw);
        if (!parsed || !parsed.token || !parsed.user) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            return;
        }

        state.auth.token = parsed.token;
        state.auth.user = parsed.user;
    }

    function updateAuthUi() {
        const loggedIn = hasSession();
        const role = state.auth.user && state.auth.user.role ? state.auth.user.role : '';
        document.body.classList.toggle('vc-locked', !loggedIn);

        if (authRoleChip) {
            authRoleChip.textContent = loggedIn
                ? `${role.toUpperCase()} activo`
                : 'Sin sesion';
        }

        if (!loggedIn) {
            setAuthStatus('Debes iniciar sesion para consultar y operar el videoclub.');
            return;
        }

        const email = state.auth.user && state.auth.user.email ? state.auth.user.email : 'usuario';
        if (isAdmin()) {
            setAuthStatus(`Sesion iniciada como admin: ${email}. CRUD y alquileres habilitados.`);
        } else {
            setAuthStatus(`Sesion iniciada como client: ${email}. Acceso de solo lectura habilitado.`);
        }
    }

    function requireAdminAction() {
        if (isAdmin()) {
            return true;
        }
        showError('Accion permitida solo para usuarios con rol admin.');
        return false;
    }

    function getBaseUrl() {
        if (!baseUrlInput) {
            return 'https://be-testing-project.vercel.app';
        }
        return baseUrlInput.value.trim().replace(/\/$/, '');
    }

    function showOutput(payload) {
        if (output) {
            output.textContent = JSON.stringify(payload, null, 2);
        }
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

    function normalizeUser(user) {
        return {
            raw: user,
            id: getId(user, ['id', 'user_id']),
            email: user.email || '',
            role: user.role || 'client'
        };
    }

    function normalizeCandyProduct(product) {
        return {
            raw: product,
            id: getId(product, ['id', 'product_id']),
            name: product.name || 'Sin nombre',
            category: product.category || '',
            price: product.price !== undefined ? Number(product.price) : 0,
            stock: product.stock !== undefined ? Number(product.stock) : 0
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

        if (statMovies) {
            statMovies.textContent = String(state.movies.length);
        }
        if (statCustomers) {
            statCustomers.textContent = String(state.customers.length);
        }
        if (statRentals) {
            statRentals.textContent = String(state.rentals.length);
        }
        if (statStock) {
            statStock.textContent = String(totalStock);
        }
    }

    async function apiRequest(method, path, body) {
        const url = `${getBaseUrl()}${path}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (state.auth.token) {
            options.headers.Authorization = `Bearer ${state.auth.token}`;
        }

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

    function unwrapArrayPayload(data) {
        if (Array.isArray(data)) {
            return data;
        }

        if (data && Array.isArray(data.data)) {
            return data.data;
        }

        return null;
    }

    function selectedCustomer() {
        return state.customers.find(function(customer) {
            return getId(customer, ['id', 'customer_id']) === state.selectedCustomerId;
        });
    }

    function renderCustomerPill() {
        if (!selectedCustomerPill) {
            return;
        }

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
        if (!customerSelect || !rentalCustomerSelect) {
            renderCustomerPill();
            return;
        }

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

        const defaultSelected = !state.selectedCustomerId ? ' selected' : '';

        customerSelect.innerHTML = `<option value=""${defaultSelected}>Selecciona un cliente</option>${options}`;
        rentalCustomerSelect.innerHTML = `<option value=""${defaultSelected}>Selecciona un cliente</option>${options}`;

        customerSelect.value = state.selectedCustomerId || '';
        rentalCustomerSelect.value = state.selectedCustomerId || '';

        renderCustomerPill();
    }

    function movieMatchesFilter(movie) {
        const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const normalized = normalizeMovie(movie);
        const title = String(normalized.title).toLowerCase();
        const genre = String(normalized.genre).toLowerCase();
        const stock = normalized.availableCopies;

        const matchesText = !search || title.includes(search) || genre.includes(search);
        const matchesStock = !state.onlyAvailable || stock > 0;

        return matchesText && matchesStock;
    }

    function renderMovies() {
        if (!moviesGrid) {
            return;
        }

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
            const canOperate = isAdmin();
            const disabled = stock > 0 && canOperate ? '' : ' disabled';
            const director = normalized.director ? `Dir. ${escapeHtml(normalized.director)}` : 'Director no informado';
            const price = normalized.rentalPrice ? `USD ${escapeHtml(String(normalized.rentalPrice))}` : 'Precio pendiente';
            const actions = canOperate
                ? `<div class="vc-card-actions"><button type="button" class="vc-rent-button" data-movie-id="${id}"${disabled}>Alquilar</button><button type="button" class="ghost" data-edit-movie="${id}">Editar</button></div>`
                : '<p class="vc-movie-meta">Sesion client: solo lectura</p>';

            return `<article class="vc-movie-item"><h4>${title}</h4><p class="vc-movie-meta">${director}</p><p class="vc-movie-meta">Genero: ${genre} · ${price}</p><span class="${stockClass}">${stockLabel}</span>${actions}</article>`;
        }).join('');
    }

    function renderMoviesTable() {
        if (!moviesBody && !rentalMovieSelect) {
            return;
        }

        if (!state.movies.length) {
            if (moviesBody) {
                moviesBody.innerHTML = '<tr><td colspan="6">Sin peliculas cargadas.</td></tr>';
            }
            if (rentalMovieSelect) {
                rentalMovieSelect.innerHTML = '<option value="">Sin peliculas disponibles</option>';
            }
            return;
        }

        const sortedMovies = state.movies.slice().sort(function(a, b) {
            return normalizeMovie(a).title.localeCompare(normalizeMovie(b).title);
        });

        if (rentalMovieSelect) {
            rentalMovieSelect.innerHTML = '<option value="">Selecciona una pelicula</option>' + sortedMovies.map(function(movie) {
                const normalized = normalizeMovie(movie);
                const stockSuffix = normalized.availableCopies > 0 ? ` (${normalized.availableCopies})` : ' (sin stock)';
                return `<option value="${escapeHtml(normalized.id)}">${escapeHtml(normalized.title)}${stockSuffix}</option>`;
            }).join('');
        }

        if (!moviesBody) {
            return;
        }

        moviesBody.innerHTML = sortedMovies.map(function(movie) {
            const normalized = normalizeMovie(movie);
            const copiesLabel = `${normalized.availableCopies}/${normalized.totalCopies}`;
            const priceLabel = normalized.rentalPrice ? `USD ${normalized.rentalPrice}` : '-';
            const actionCol = isAdmin()
                ? `<div class="vc-card-actions"><button type="button" class="ghost" data-edit-movie="${escapeHtml(normalized.id)}">Editar</button><button type="button" class="danger" data-delete-movie="${escapeHtml(normalized.id)}">Eliminar</button></div>`
                : '<span>Solo lectura</span>';
            return `<tr><td>${escapeHtml(normalized.id)}</td><td>${escapeHtml(normalized.title)}</td><td>${escapeHtml(normalized.genre)}</td><td>${escapeHtml(copiesLabel)}</td><td>${escapeHtml(priceLabel)}</td><td>${actionCol}</td></tr>`;
        }).join('');
    }

    function renderCustomersTable() {
        if (!customersBody) {
            return;
        }

        if (!state.customers.length) {
            customersBody.innerHTML = '<tr><td colspan="5">Sin clientes cargados.</td></tr>';
            return;
        }

        const sortedCustomers = state.customers.slice().sort(function(a, b) {
            return normalizeCustomer(a).name.localeCompare(normalizeCustomer(b).name);
        });

        customersBody.innerHTML = sortedCustomers.map(function(customer) {
            const normalized = normalizeCustomer(customer);
            const actionCol = isAdmin()
                ? `<div class="vc-card-actions"><button type="button" class="ghost" data-edit-customer="${escapeHtml(normalized.id)}">Editar</button><button type="button" class="danger" data-delete-customer="${escapeHtml(normalized.id)}">Eliminar</button></div>`
                : '<span>Solo lectura</span>';
            return `<tr><td>${escapeHtml(normalized.id)}</td><td>${escapeHtml(normalized.name)}</td><td>${escapeHtml(normalized.email || 'Sin email')}</td><td>${escapeHtml(normalized.phone || normalized.address || 'Sin telefono')}</td><td>${actionCol}</td></tr>`;
        }).join('');
    }

    function renderUsersTable() {
        if (!usersBody) {
            return;
        }

        if (!state.users.length) {
            usersBody.innerHTML = '<tr><td colspan="4">Sin usuarios cargados.</td></tr>';
            return;
        }

        const sortedUsers = state.users.slice().sort(function(a, b) {
            return normalizeUser(a).email.localeCompare(normalizeUser(b).email);
        });

        usersBody.innerHTML = sortedUsers.map(function(user) {
            const normalized = normalizeUser(user);
            const actionCol = isAdmin()
                ? `<div class="vc-card-actions"><button type="button" class="ghost" data-edit-user="${escapeHtml(normalized.id)}">Editar</button><button type="button" class="danger" data-delete-user="${escapeHtml(normalized.id)}">Eliminar</button></div>`
                : '<span>Solo lectura</span>';
            return `<tr><td>${escapeHtml(normalized.id)}</td><td>${escapeHtml(normalized.email)}</td><td>${escapeHtml(normalized.role)}</td><td>${actionCol}</td></tr>`;
        }).join('');
    }

    function renderCandyTable() {
        if (!candyBody) {
            return;
        }

        if (!state.candyProducts.length) {
            candyBody.innerHTML = '<tr><td colspan="6">Sin productos cargados.</td></tr>';
            return;
        }

        const sortedProducts = state.candyProducts.slice().sort(function(a, b) {
            return normalizeCandyProduct(a).name.localeCompare(normalizeCandyProduct(b).name);
        });

        candyBody.innerHTML = sortedProducts.map(function(product) {
            const normalized = normalizeCandyProduct(product);
            const actionCol = isAdmin()
                ? `<div class="vc-card-actions"><button type="button" class="ghost" data-edit-candy="${escapeHtml(normalized.id)}">Editar</button><button type="button" class="danger" data-delete-candy="${escapeHtml(normalized.id)}">Eliminar</button></div>`
                : '<span>Solo lectura</span>';
            return `<tr><td>${escapeHtml(normalized.id)}</td><td>${escapeHtml(normalized.name)}</td><td>${escapeHtml(normalized.category || '-')}</td><td>${escapeHtml(String(normalized.price))}</td><td>${escapeHtml(String(normalized.stock))}</td><td>${actionCol}</td></tr>`;
        }).join('');
    }

    function renderRentals() {
        if (!rentalsBody) {
            return;
        }

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

            const action = isAdmin()
                ? `<button type="button" class="danger" data-return-id="${escapeHtml(id)}">Marcar devuelto</button>`
                : '<span>Solo lectura</span>';
            return `<tr><td>${escapeHtml(id)}</td><td>${escapeHtml(String(customerLabel))}</td><td>${escapeHtml(String(movieLabel))}</td><td>${escapeHtml(dueDate)}</td><td>${action}</td></tr>`;
        }).join('');
    }

    function renderHistoryRows(rentals) {
        if (!historyBody) {
            return;
        }

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
        if (historyBody) {
            historyBody.innerHTML = '<tr><td colspan="3">Sin historial cargado.</td></tr>';
        }
    }

    function resetMovieForm() {
        if (movieForm) {
            movieForm.reset();
        }
        if (movieIdInput) {
            movieIdInput.value = '';
        }
        if (movieFormMode) {
            movieFormMode.textContent = 'Alta';
        }
        if (movieRentalPriceInput) {
            movieRentalPriceInput.value = '';
        }
        if (movieTotalCopiesInput) {
            movieTotalCopiesInput.value = '1';
        }
        if (movieAvailableCopiesInput) {
            movieAvailableCopiesInput.value = '1';
        }
    }

    function resetCustomerForm() {
        if (customerForm) {
            customerForm.reset();
        }
        if (customerIdInput) {
            customerIdInput.value = '';
        }
        if (customerFormMode) {
            customerFormMode.textContent = 'Alta';
        }
    }

    function resetUserForm() {
        if (userForm) {
            userForm.reset();
        }
        if (userIdInput) {
            userIdInput.value = '';
        }
        if (userFormMode) {
            userFormMode.textContent = 'Alta';
        }
        if (userRoleInput) {
            userRoleInput.value = 'client';
        }
    }

    function resetCandyForm() {
        if (candyForm) {
            candyForm.reset();
        }
        if (candyIdInput) {
            candyIdInput.value = '';
        }
        if (candyFormMode) {
            candyFormMode.textContent = 'Alta';
        }
        if (candyStockInput) {
            candyStockInput.value = '0';
        }
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
        if (customerIdInput) {
            customerIdInput.value = normalized.id;
        }
        if (customerNameInput) {
            customerNameInput.value = normalized.name;
            customerNameInput.focus();
        }
        if (customerEmailInput) {
            customerEmailInput.value = normalized.email;
        }
        if (customerPhoneInput) {
            customerPhoneInput.value = normalized.phone;
        }
        if (customerAddressInput) {
            customerAddressInput.value = normalized.address;
        }
        if (customerFormMode) {
            customerFormMode.textContent = `Edicion #${normalized.id}`;
        }
    }

    function fillUserForm(userId) {
        const user = state.users.find(function(item) {
            return getId(item, ['id', 'user_id']) === String(userId);
        });

        if (!user) {
            showError('No se encontro el usuario seleccionado.');
            return;
        }

        const normalized = normalizeUser(user);
        if (userIdInput) {
            userIdInput.value = normalized.id;
        }
        if (userEmailInput) {
            userEmailInput.value = normalized.email;
            userEmailInput.focus();
        }
        if (userRoleInput) {
            userRoleInput.value = normalized.role;
        }
        if (userPasswordInput) {
            userPasswordInput.value = '';
        }
        if (userFormMode) {
            userFormMode.textContent = `Edicion #${normalized.id}`;
        }
    }

    function fillCandyForm(productId) {
        const product = state.candyProducts.find(function(item) {
            return getId(item, ['id', 'product_id']) === String(productId);
        });

        if (!product) {
            showError('No se encontro el producto seleccionado.');
            return;
        }

        const normalized = normalizeCandyProduct(product);
        if (candyIdInput) {
            candyIdInput.value = normalized.id;
        }
        if (candyNameInput) {
            candyNameInput.value = normalized.name;
            candyNameInput.focus();
        }
        if (candyCategoryInput) {
            candyCategoryInput.value = normalized.category;
        }
        if (candyPriceInput) {
            candyPriceInput.value = String(normalized.price);
        }
        if (candyStockInput) {
            candyStockInput.value = String(normalized.stock);
        }
        if (candyFormMode) {
            candyFormMode.textContent = `Edicion #${normalized.id}`;
        }
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
        const name = customerNameInput ? customerNameInput.value.trim() : '';
        const email = customerEmailInput ? customerEmailInput.value.trim() : '';
        const phone = customerPhoneInput ? customerPhoneInput.value.trim() : '';
        const address = customerAddressInput ? customerAddressInput.value.trim() : '';

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

    function buildUserPayload() {
        const email = userEmailInput ? userEmailInput.value.trim() : '';
        const role = userRoleInput ? userRoleInput.value : 'client';
        const password = userPasswordInput ? userPasswordInput.value.trim() : '';
        const userId = userIdInput ? userIdInput.value.trim() : '';

        if (!email) {
            return null;
        }

        const payload = {
            email,
            role
        };

        if (!userId && !password) {
            return null;
        }

        if (password) {
            payload.password = password;
        }

        return payload;
    }

    function buildCandyPayload() {
        const name = candyNameInput ? candyNameInput.value.trim() : '';
        const category = candyCategoryInput ? candyCategoryInput.value.trim() : '';
        const price = candyPriceInput ? candyPriceInput.value.trim() : '';
        const stock = candyStockInput ? candyStockInput.value.trim() : '0';

        if (!name || !price) {
            return null;
        }

        const payload = {
            name,
            price: Number(price),
            stock: stock === '' ? 0 : Number(stock)
        };

        if (category) {
            payload.category = category;
        }

        return payload;
    }

    async function refreshMovies() {
        if (!hasSession()) {
            return;
        }
        const result = await runRequest('Cargar catalogo', 'GET', '/api/movies');
        const movies = result && result.ok ? unwrapArrayPayload(result.data) : null;
        if (movies) {
            state.movies = movies;
            renderMovies();
            renderMoviesTable();
            updateStats();
        }
    }

    async function refreshCustomers() {
        if (!hasSession()) {
            return;
        }
        const result = await runRequest('Cargar clientes', 'GET', '/api/customers');
        const customers = result && result.ok ? unwrapArrayPayload(result.data) : null;
        if (customers) {
            state.customers = customers;

            renderCustomerSelect();
            renderCustomersTable();
            updateStats();
        }
    }

    async function refreshUsers() {
        if (!hasSession()) {
            return;
        }
        const result = await runRequest('Cargar usuarios', 'GET', '/api/users');
        const users = result && result.ok ? unwrapArrayPayload(result.data) : null;
        if (users) {
            state.users = users;
            renderUsersTable();
        }
    }

    async function refreshCandyBar() {
        if (!hasSession()) {
            return;
        }
        const result = await runRequest('Cargar candy bar', 'GET', '/api/candy-bar');
        const products = result && result.ok ? unwrapArrayPayload(result.data) : null;
        if (products) {
            state.candyProducts = products;
            renderCandyTable();
        }
    }

    async function refreshActiveRentals() {
        if (!hasSession()) {
            return;
        }
        const result = await runRequest('Cargar alquileres activos', 'GET', '/api/rentals/active');
        const rentals = result && result.ok ? unwrapArrayPayload(result.data) : null;
        if (rentals) {
            state.rentals = rentals;
            renderRentals();
            updateStats();
        }
    }

    async function refreshAll() {
        console.info('[VideoClub] Click en Actualizar datos');

        if (!hasSession()) {
            showOutput({ loading: 'GET /health + GET /api', info: 'Sin sesion: ejecutando checks publicos.' });

            const publicChecks = await Promise.allSettled([
                apiRequest('GET', '/health'),
                apiRequest('GET', '/api')
            ]);

            const healthResult = publicChecks[0].status === 'fulfilled'
                ? publicChecks[0].value
                : { ok: false, error: publicChecks[0].reason ? publicChecks[0].reason.message : 'Error en /health' };

            const apiResult = publicChecks[1].status === 'fulfilled'
                ? publicChecks[1].value
                : { ok: false, error: publicChecks[1].reason ? publicChecks[1].reason.message : 'Error en /api' };

            showOutput({
                info: 'Sin sesion: resultado de endpoints publicos.',
                checks: {
                    health: healthResult,
                    api: apiResult
                }
            });
            return;
        }

        const shouldLoadCustomers = Boolean(customerSelect || rentalCustomerSelect || customersBody || historyBody || selectedCustomerPill || statCustomers);
        const shouldLoadMovies = Boolean(moviesGrid || moviesBody || rentalMovieSelect || statMovies || statStock);
        const shouldLoadRentals = Boolean(rentalsBody || rentalForm || historyBody || statRentals);
        const shouldLoadUsers = Boolean(usersBody || userForm);
        const shouldLoadCandyBar = Boolean(candyBody || candyForm);

        const tasks = [];
        if (shouldLoadCustomers) {
            tasks.push(refreshCustomers());
        }
        if (shouldLoadMovies) {
            tasks.push(refreshMovies());
        }
        if (shouldLoadRentals) {
            tasks.push(refreshActiveRentals());
        }
        if (shouldLoadUsers) {
            tasks.push(refreshUsers());
        }
        if (shouldLoadCandyBar) {
            tasks.push(refreshCandyBar());
        }

        if (tasks.length) {
            try {
                await Promise.all(tasks);
                console.info('[VideoClub] Actualizacion completada');
            } catch (error) {
                showOutput({ error: error.message || 'Error durante la actualizacion.' });
            }
        } else {
            showOutput({ info: 'No hay modulos para actualizar en esta vista.' });
        }
    }

    async function runHealthCheck() {
        await runRequest('Health check', 'GET', '/health');
    }

    async function runApiInfo() {
        await runRequest('Info de la API', 'GET', '/api');
    }

    async function createRentalForMovie(movieId) {
        if (!requireAdminAction()) {
            return;
        }
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
        if (!requireAdminAction()) {
            return;
        }
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

        const rentals = result && result.ok ? unwrapArrayPayload(result.data) : null;
        if (rentals) {
            renderHistoryRows(rentals);
        }
    }

    async function submitMovieForm() {
        if (!requireAdminAction()) {
            return;
        }
        const payload = buildMoviePayload();
        const movieId = movieIdInput ? movieIdInput.value.trim() : '';

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
        if (!requireAdminAction()) {
            return;
        }
        const payload = buildCustomerPayload();
        const customerId = customerIdInput ? customerIdInput.value.trim() : '';

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

    async function submitUserForm() {
        if (!requireAdminAction()) {
            return;
        }

        const payload = buildUserPayload();
        const userId = userIdInput ? userIdInput.value.trim() : '';

        if (!payload) {
            showError('Para usuarios debes completar email y password al crear.');
            return;
        }

        const result = userId
            ? await runRequest('Actualizar usuario', 'PUT', `/api/users/${encodeURIComponent(userId)}`, payload)
            : await runRequest('Crear usuario', 'POST', '/api/users', payload);

        if (result && result.ok) {
            resetUserForm();
            await refreshUsers();
        }
    }

    async function submitCandyForm() {
        if (!requireAdminAction()) {
            return;
        }

        const payload = buildCandyPayload();
        const productId = candyIdInput ? candyIdInput.value.trim() : '';

        if (!payload) {
            showError('Completa nombre y precio para guardar el producto.');
            return;
        }

        const result = productId
            ? await runRequest('Actualizar producto', 'PUT', `/api/candy-bar/${encodeURIComponent(productId)}`, payload)
            : await runRequest('Crear producto', 'POST', '/api/candy-bar', payload);

        if (result && result.ok) {
            resetCandyForm();
            await refreshCandyBar();
        }
    }

    async function deleteMovie(movieId) {
        if (!requireAdminAction()) {
            return;
        }
        if (!window.confirm(`Eliminar la pelicula ${movieId}?`)) {
            return;
        }

        const result = await runRequest('Eliminar pelicula', 'DELETE', `/api/movies/${encodeURIComponent(movieId)}`);
        if (result && result.ok) {
            if (movieIdInput && movieIdInput.value === String(movieId)) {
                resetMovieForm();
            }
            await refreshMovies();
            await refreshActiveRentals();
        }
    }

    async function deleteCustomer(customerId) {
        if (!requireAdminAction()) {
            return;
        }
        if (!window.confirm(`Eliminar el cliente ${customerId}?`)) {
            return;
        }

        const result = await runRequest('Eliminar cliente', 'DELETE', `/api/customers/${encodeURIComponent(customerId)}`);
        if (result && result.ok) {
            if (customerIdInput && customerIdInput.value === String(customerId)) {
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

    async function deleteUser(userId) {
        if (!requireAdminAction()) {
            return;
        }
        if (!window.confirm(`Eliminar el usuario ${userId}?`)) {
            return;
        }

        const result = await runRequest('Eliminar usuario', 'DELETE', `/api/users/${encodeURIComponent(userId)}`);
        if (result && result.ok) {
            if (userIdInput && userIdInput.value === String(userId)) {
                resetUserForm();
            }
            await refreshUsers();
        }
    }

    async function deleteCandyProduct(productId) {
        if (!requireAdminAction()) {
            return;
        }
        if (!window.confirm(`Eliminar el producto ${productId}?`)) {
            return;
        }

        const result = await runRequest('Eliminar producto', 'DELETE', `/api/candy-bar/${encodeURIComponent(productId)}`);
        if (result && result.ok) {
            if (candyIdInput && candyIdInput.value === String(productId)) {
                resetCandyForm();
            }
            await refreshCandyBar();
        }
    }

    async function submitRentalForm() {
        if (!requireAdminAction()) {
            return;
        }
        if (!rentalCustomerSelect || !rentalMovieSelect || !rentalDueDateInput) {
            showError('Esta vista no incluye el formulario de alquileres.');
            return;
        }
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
            if (customerSelect) {
                customerSelect.value = state.selectedCustomerId;
            }
            renderCustomerPill();
            await refreshMovies();
            await refreshActiveRentals();
            await loadCustomerHistory();
        }
    }

    async function loginWithCredentials(email, password) {
        const result = await runRequest('Iniciar sesion', 'POST', '/api/auth/login', {
            email,
            password
        });

        if (!result || !result.ok || !result.data || !result.data.token || !result.data.user) {
            return false;
        }

        state.auth.token = result.data.token;
        state.auth.user = result.data.user;
        saveSession();
        updateAuthUi();
        await refreshAll();
        return true;
    }

    async function registerAndLogin() {
        const email = authEmailInput ? authEmailInput.value.trim() : '';
        const password = authPasswordInput ? authPasswordInput.value : '';

        if (!email || !password) {
            showError('Completa correo y contrasena para registrarte.');
            return;
        }

        const registerResult = await runRequest('Registrar usuario', 'POST', '/api/auth/register', {
            email,
            password,
            role: 'client'
        });

        if (!registerResult || !registerResult.ok) {
            return;
        }

        await loginWithCredentials(email, password);
    }

    async function submitLogin(event) {
        event.preventDefault();

        const email = authEmailInput ? authEmailInput.value.trim() : '';
        const password = authPasswordInput ? authPasswordInput.value : '';

        if (!email || !password) {
            showError('Completa correo y contrasena para iniciar sesion.');
            return;
        }

        await loginWithCredentials(email, password);
    }

    function logout() {
        clearSession();
        state.movies = [];
        state.customers = [];
        state.users = [];
        state.candyProducts = [];
        state.rentals = [];
        state.selectedCustomerId = '';
        clearHistory();
        renderMovies();
        renderMoviesTable();
        renderCustomersTable();
        renderUsersTable();
        renderCandyTable();
        renderRentals();
        updateStats();
        updateAuthUi();
        showOutput({ info: 'Sesion cerrada.' });
    }

    bindEvent(refreshAllBtn, 'click', refreshAll);
    bindEvent(healthCheckBtn, 'click', runHealthCheck);
    bindEvent(apiInfoBtn, 'click', runApiInfo);

    bindEvent(customerSelect, 'change', function() {
        state.selectedCustomerId = customerSelect.value;
        if (rentalCustomerSelect) {
            rentalCustomerSelect.value = state.selectedCustomerId;
        }
        renderCustomerPill();
    });

    bindEvent(customerForm, 'submit', async function(e) {
        e.preventDefault();
        await submitCustomerForm();
    });

    bindEvent(customerResetBtn, 'click', resetCustomerForm);

    bindEvent(userForm, 'submit', async function(event) {
        event.preventDefault();
        await submitUserForm();
    });

    bindEvent(userResetBtn, 'click', resetUserForm);

    bindEvent(candyForm, 'submit', async function(event) {
        event.preventDefault();
        await submitCandyForm();
    });

    bindEvent(candyResetBtn, 'click', resetCandyForm);

    bindEvent(movieForm, 'submit', async function(event) {
        event.preventDefault();
        await submitMovieForm();
    });

    bindEvent(movieResetBtn, 'click', resetMovieForm);

    bindEvent(rentalForm, 'submit', async function(event) {
        event.preventDefault();
        await submitRentalForm();
    });

    bindEvent(rentalFillActiveBtn, 'click', function() {
        if (rentalCustomerSelect) {
            rentalCustomerSelect.value = state.selectedCustomerId;
        }
    });

    bindEvent(searchInput, 'input', renderMovies);

    bindEvent(onlyAvailableBtn, 'click', function() {
        state.onlyAvailable = !state.onlyAvailable;
        onlyAvailableBtn.textContent = state.onlyAvailable ? 'Mostrando disponibles' : 'Solo disponibles';
        renderMovies();
    });

    bindEvent(moviesGrid, 'click', function(event) {
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

    bindEvent(moviesBody, 'click', function(event) {
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

    bindEvent(customersBody, 'click', function(event) {
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

    bindEvent(usersBody, 'click', function(event) {
        const editButton = event.target.closest('[data-edit-user]');
        if (editButton) {
            const userId = editButton.getAttribute('data-edit-user');
            if (userId) {
                fillUserForm(userId);
            }
            return;
        }

        const deleteButton = event.target.closest('[data-delete-user]');
        if (deleteButton) {
            const userId = deleteButton.getAttribute('data-delete-user');
            if (userId) {
                deleteUser(userId);
            }
        }
    });

    bindEvent(candyBody, 'click', function(event) {
        const editButton = event.target.closest('[data-edit-candy]');
        if (editButton) {
            const productId = editButton.getAttribute('data-edit-candy');
            if (productId) {
                fillCandyForm(productId);
            }
            return;
        }

        const deleteButton = event.target.closest('[data-delete-candy]');
        if (deleteButton) {
            const productId = deleteButton.getAttribute('data-delete-candy');
            if (productId) {
                deleteCandyProduct(productId);
            }
        }
    });

    bindEvent(rentalsBody, 'click', function(event) {
        const button = event.target.closest('[data-return-id]');
        if (!button) {
            return;
        }

        const rentalId = button.getAttribute('data-return-id');
        if (rentalId) {
            returnRental(rentalId);
        }
    });

    bindEvent(loadHistoryBtn, 'click', loadCustomerHistory);
    bindEvent(clearHistoryBtn, 'click', clearHistory);
    bindEvent(authForm, 'submit', submitLogin);
    bindEvent(registerBtn, 'click', registerAndLogin);
    bindEvent(logoutBtn, 'click', logout);

    resetMovieForm();
    resetCustomerForm();
    resetUserForm();
    resetCandyForm();
    if (rentalDueDateInput) {
        rentalDueDateInput.value = getDefaultDueDate();
    }
    clearHistory();
    renderUsersTable();
    renderCandyTable();
    loadSession();
    updateAuthUi();
    if (hasSession()) {
        refreshAll();
    } else {
        showOutput({ info: 'Inicia sesion para cargar datos de la API.' });
    }
});
