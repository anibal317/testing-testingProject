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

    // Intentional errors for bug reporting practice
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

    // New error-prone functionality
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
});

