document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('contact-modal');
    const contactLink = document.getElementById('contact-link');
    const closeBtn = document.getElementsByClassName('close')[0];
    const contactForm = document.getElementById('contact-form');
    const newsletterForm = document.getElementById('newsletter-form');

    // Open modal
    contactLink.onclick = function(e) {
        e.preventDefault();
        modal.style.display = 'block';
    }

    // Close modal
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Handle contact form submission
    if (contactForm) {
        contactForm.onsubmit = function(e) {
            e.preventDefault();
            // Simulate form submission
            alert('Thank you for your message. We will get back to you soon!');
            modal.style.display = 'none';
        }
    }

    // Handle newsletter form submission
    if (newsletterForm) {
        newsletterForm.onsubmit = function(e) {
            e.preventDefault();
            // Simulate form submission
            alert('Thank you for subscribing to our newsletter!');
        }
    }

    // Products page functionality
    const cart = [];
    const cartSummary = document.getElementById('cart-summary');

    window.addToCart = function(product) {
        cart.push(product);
        updateCartSummary();
    }

    function updateCartSummary() {
        if (cartSummary) {
            cartSummary.innerHTML = `Cart: ${cart.length} item(s)`;
        }
    }

    // Services page functionality
    const serviceInquiryForm = document.getElementById('service-inquiry');
    if (serviceInquiryForm) {
        serviceInquiryForm.onsubmit = function(e) {
            e.preventDefault();
            const service = document.getElementById('service-select').value;
            const email = document.getElementById('inquiry-email').value;
            // Intentional error: not validating email format
            alert(`Thank you for your inquiry about ${service}. We'll contact you at ${email} soon.`);
        }
    }

    // Blog page functionality
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');
    let currentPage = 1;

    if (prevPageBtn && nextPageBtn && currentPageSpan) {
        prevPageBtn.onclick = function() {
            if (currentPage > 1) {
                currentPage--;
                updatePagination();
            }
        }

        nextPageBtn.onclick = function() {
            // Intentional error: no upper limit on pagination
            currentPage++;
            updatePagination();
        }

        function updatePagination() {
            currentPageSpan.textContent = `Page ${currentPage}`;
            prevPageBtn.disabled = (currentPage === 1);
        }
    }

    // Movies section functionality (index page)
    const videoApiBaseUrlInput = document.getElementById('video-api-base-url');
    const loadMoviesBtn = document.getElementById('load-movies-btn');
    const loadActiveRentalsBtn = document.getElementById('load-active-rentals-btn');
    const moviesList = document.getElementById('movies-list');
    const moviesApiOutput = document.getElementById('movies-api-output');

    const movieByIdForm = document.getElementById('movie-by-id-form');
    const movieIdInput = document.getElementById('movie-id-input');
    const deleteMovieBtn = document.getElementById('delete-movie-btn');

    const createMovieForm = document.getElementById('create-movie-form');
    const createMovieBody = document.getElementById('create-movie-body');

    const updateMovieForm = document.getElementById('update-movie-form');
    const updateMovieId = document.getElementById('update-movie-id');
    const updateMovieBody = document.getElementById('update-movie-body');

    const createRentalForm = document.getElementById('create-rental-form');
    const createRentalBody = document.getElementById('create-rental-body');

    const returnRentalForm = document.getElementById('return-rental-form');
    const returnRentalId = document.getElementById('return-rental-id');

    const customerRentalsForm = document.getElementById('customer-rentals-form');
    const customerRentalsId = document.getElementById('customer-rentals-id');

    const loadCustomersBtn = document.getElementById('load-customers-btn');
    const customersTableBody = document.getElementById('customers-table-body');
    const customerByIdForm = document.getElementById('customer-by-id-form');
    const customerIdInput = document.getElementById('customer-id-input');
    const deleteCustomerBtn = document.getElementById('delete-customer-btn');
    const createCustomerForm = document.getElementById('create-customer-form');
    const createCustomerBody = document.getElementById('create-customer-body');
    const updateCustomerForm = document.getElementById('update-customer-form');
    const updateCustomerId = document.getElementById('update-customer-id');
    const updateCustomerBody = document.getElementById('update-customer-body');

    function baseUrl() {
        return videoApiBaseUrlInput ? videoApiBaseUrlInput.value.trim().replace(/\/$/, '') : '';
    }

    function writeOutput(payload) {
        if (moviesApiOutput) {
            moviesApiOutput.textContent = JSON.stringify(payload, null, 2);
        }
    }

    function tryParseJson(raw) {
        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    }

    async function requestApi(method, path, body) {
        const url = `${baseUrl()}${path}`;
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
        const json = tryParseJson(text);

        return {
            status: response.status,
            ok: response.ok,
            method,
            path,
            data: json !== null ? json : text
        };
    }

    function renderMovies(data) {
        if (!moviesList) {
            return;
        }

        const items = Array.isArray(data) ? data : [];
        if (items.length === 0) {
            moviesList.innerHTML = '<p>No hay peliculas para mostrar.</p>';
            return;
        }

        moviesList.innerHTML = items.map(function(movie) {
            const title = movie.title || movie.name || 'Sin titulo';
            const id = movie.id || movie.movie_id || 'N/A';
            const genre = movie.genre || 'Sin genero';
            const stock = movie.stock || movie.quantity || 'N/A';

            return `<article class="movie-item"><h4>${title}</h4><p>ID: ${id}</p><p>Genero: ${genre}</p><p>Stock: ${stock}</p></article>`;
        }).join('');
    }

    function renderCustomers(data) {
        if (!customersTableBody) {
            return;
        }

        const items = Array.isArray(data) ? data : [];
        if (items.length === 0) {
            customersTableBody.innerHTML = '<tr><td colspan="4">No hay clientes para mostrar.</td></tr>';
            return;
        }

        customersTableBody.innerHTML = items.map(function(customer) {
            const id = customer.id || customer.customer_id || 'N/A';
            const name = customer.name || customer.full_name || 'Sin nombre';
            const email = customer.email || 'Sin email';
            const phone = customer.phone || customer.phone_number || 'Sin telefono';

            return `<tr><td>${id}</td><td>${name}</td><td>${email}</td><td>${phone}</td></tr>`;
        }).join('');
    }

    if (videoApiBaseUrlInput && moviesApiOutput) {
        if (loadMoviesBtn) {
            loadMoviesBtn.addEventListener('click', async function() {
                writeOutput({ loading: 'GET /api/movies' });
                try {
                    const result = await requestApi('GET', '/api/movies');
                    writeOutput(result);
                    renderMovies(result.data);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (loadCustomersBtn) {
            loadCustomersBtn.addEventListener('click', async function() {
                writeOutput({ loading: 'GET /api/customers' });
                try {
                    const result = await requestApi('GET', '/api/customers');
                    writeOutput(result);
                    renderCustomers(result.data);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (loadActiveRentalsBtn) {
            loadActiveRentalsBtn.addEventListener('click', async function() {
                writeOutput({ loading: 'GET /api/rentals/active' });
                try {
                    const result = await requestApi('GET', '/api/rentals/active');
                    writeOutput(result);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (movieByIdForm && movieIdInput) {
            movieByIdForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const id = movieIdInput.value.trim();
                if (!id) {
                    writeOutput({ error: 'Debes indicar un Movie ID.' });
                    return;
                }

                writeOutput({ loading: `GET /api/movies/${id}` });
                try {
                    const result = await requestApi('GET', `/api/movies/${encodeURIComponent(id)}`);
                    writeOutput(result);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (deleteMovieBtn && movieIdInput) {
            deleteMovieBtn.addEventListener('click', async function() {
                const id = movieIdInput.value.trim();
                if (!id) {
                    writeOutput({ error: 'Debes indicar un Movie ID para eliminar.' });
                    return;
                }

                writeOutput({ loading: `DELETE /api/movies/${id}` });
                try {
                    const result = await requestApi('DELETE', `/api/movies/${encodeURIComponent(id)}`);
                    writeOutput(result);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (createMovieForm && createMovieBody) {
            createMovieForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const payload = tryParseJson(createMovieBody.value.trim());
                if (!payload) {
                    writeOutput({ error: 'JSON invalido para crear pelicula.' });
                    return;
                }

                writeOutput({ loading: 'POST /api/movies' });
                try {
                    const result = await requestApi('POST', '/api/movies', payload);
                    writeOutput(result);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (updateMovieForm && updateMovieId && updateMovieBody) {
            updateMovieForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const id = updateMovieId.value.trim();
                const payload = tryParseJson(updateMovieBody.value.trim());
                if (!id || !payload) {
                    writeOutput({ error: 'Completa Movie ID y JSON valido para actualizar.' });
                    return;
                }

                writeOutput({ loading: `PUT /api/movies/${id}` });
                try {
                    const result = await requestApi('PUT', `/api/movies/${encodeURIComponent(id)}`, payload);
                    writeOutput(result);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (createRentalForm && createRentalBody) {
            createRentalForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const payload = tryParseJson(createRentalBody.value.trim());
                if (!payload) {
                    writeOutput({ error: 'JSON invalido para crear alquiler.' });
                    return;
                }

                writeOutput({ loading: 'POST /api/rentals' });
                try {
                    const result = await requestApi('POST', '/api/rentals', payload);
                    writeOutput(result);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (returnRentalForm && returnRentalId) {
            returnRentalForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const id = returnRentalId.value.trim();
                if (!id) {
                    writeOutput({ error: 'Debes indicar un Rental ID.' });
                    return;
                }

                writeOutput({ loading: `PUT /api/rentals/${id}/return` });
                try {
                    const result = await requestApi('PUT', `/api/rentals/${encodeURIComponent(id)}/return`);
                    writeOutput(result);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (customerRentalsForm && customerRentalsId) {
            customerRentalsForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const customerId = customerRentalsId.value.trim();
                if (!customerId) {
                    writeOutput({ error: 'Debes indicar un Customer ID.' });
                    return;
                }

                writeOutput({ loading: `GET /api/customers/${customerId}/rentals` });
                try {
                    const result = await requestApi('GET', `/api/customers/${encodeURIComponent(customerId)}/rentals`);
                    writeOutput(result);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (customerByIdForm && customerIdInput) {
            customerByIdForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const id = customerIdInput.value.trim();
                if (!id) {
                    writeOutput({ error: 'Debes indicar un Customer ID.' });
                    return;
                }

                writeOutput({ loading: `GET /api/customers/${id}` });
                try {
                    const result = await requestApi('GET', `/api/customers/${encodeURIComponent(id)}`);
                    writeOutput(result);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (deleteCustomerBtn && customerIdInput) {
            deleteCustomerBtn.addEventListener('click', async function() {
                const id = customerIdInput.value.trim();
                if (!id) {
                    writeOutput({ error: 'Debes indicar un Customer ID para eliminar.' });
                    return;
                }

                writeOutput({ loading: `DELETE /api/customers/${id}` });
                try {
                    const result = await requestApi('DELETE', `/api/customers/${encodeURIComponent(id)}`);
                    writeOutput(result);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (createCustomerForm && createCustomerBody) {
            createCustomerForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const payload = tryParseJson(createCustomerBody.value.trim());
                if (!payload) {
                    writeOutput({ error: 'JSON invalido para crear cliente.' });
                    return;
                }

                writeOutput({ loading: 'POST /api/customers' });
                try {
                    const result = await requestApi('POST', '/api/customers', payload);
                    writeOutput(result);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }

        if (updateCustomerForm && updateCustomerId && updateCustomerBody) {
            updateCustomerForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const id = updateCustomerId.value.trim();
                const payload = tryParseJson(updateCustomerBody.value.trim());
                if (!id || !payload) {
                    writeOutput({ error: 'Completa Customer ID y JSON valido para actualizar.' });
                    return;
                }

                writeOutput({ loading: `PUT /api/customers/${id}` });
                try {
                    const result = await requestApi('PUT', `/api/customers/${encodeURIComponent(id)}`, payload);
                    writeOutput(result);
                } catch (error) {
                    writeOutput({ error: error.message });
                }
            });
        }
    }

    // Existing errors
    // Error 1: Missing image
    const missingImg = document.createElement('img');
    missingImg.src = 'non-existent-image.jpg';
    missingImg.alt = 'Missing Image';
    document.body.appendChild(missingImg);

    // Error 2: Console error
    console.error('This is an intentional error for testing purposes');

    // Error 3: Typo in class name
    const typoElement = document.querySelector('.non-existent-class');
    if (typoElement) {
        typoElement.style.color = 'red';
    }

    // Error 4: Incorrect event listener
    document.getElementById('non-existent-button').addEventListener('click', function() {
        console.log('This will never be called');
    });

    // Error 5: Undefined variable
    try {
        console.log(undefinedVariable);
    } catch (error) {
        console.error('Caught an error:', error);
    }

    // Error 6: Incorrect form validation
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.onsubmit = function(e) {
            e.preventDefault();
            const searchInput = document.querySelector('#search-form input');
            if (searchInput.value.length > 0) {
                alert('Búsqueda realizada');
            }
            // Missing else statement for empty input
        }
    }

    // Error 7: Inefficient event listener
    document.addEventListener('scroll', function() {
        console.log('Usuario desplazándose');
        // This will log on every scroll event, which is inefficient
    });

    // Error 8: Memory leak
    function createButton() {
        const button = document.createElement('button');
        button.textContent = 'Botón dinámico';
        button.addEventListener('click', function() {
            console.log('Botón clickeado');
        });
        document.body.appendChild(button);
    }
    setInterval(createButton, 5000); // Creates a new button every 5 seconds without removing old ones

    // Error 9: Race condition with API call
    function fetchData() {
        setTimeout(() => {
            console.log('Datos recibidos');
        }, Math.random() * 1000);
    }
    fetchData();
    console.log('Datos procesados'); // This might log before 'Datos recibidos'

    // Error 10: Incorrect use of async/await
    async function getData() {
        return Promise.resolve('datos');
    }
    getData();
    // Missing await, so the promise result is not used

    // New error: Incorrect array manipulation
    const numbers = [1, 2, 3, 4, 5];
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] % 2 === 0) {
            numbers.splice(i, 1);
            // This can skip elements when removing items from the array
        }
    }

    // New error: Infinite loop potential
    function processData(data) {
        while (data.length > 0) {
            console.log(data[0]);
            // Intentional error: not removing processed item from data
        }
    }
    // Uncomment the next line to test (caution: will cause an infinite loop)
    // processData([1, 2, 3]);

    // New error: Incorrect use of 'this' in arrow function
    const user = {
        name: 'John',
        greet: () => {
            console.log(`Hello, ${this.name}`);
            // 'this' will not refer to the user object in an arrow function
        }
    };
    user.greet();
});

