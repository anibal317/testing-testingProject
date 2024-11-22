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

