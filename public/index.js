function createRaindrop() {
    const raindrop = document.createElement('div');
    raindrop.classList.add('raindrop');
    raindrop.style.left = Math.random() * window.innerWidth + 'px';
    raindrop.style.top = '-20px';
    raindrop.style.animationDuration = Math.random() * 1 + 0.5 + 's';
    document.body.appendChild(raindrop);

    const animation = raindrop.animate([
        { transform: 'translateY(0vh)' },
        { transform: 'translateY(100vh)' }
    ], {
        duration: Math.random() * 1000 + 1000,
        easing: 'linear',
        iterations: 1
    });

    animation.onfinish = () => {
        raindrop.remove();
    };
}

function startRain() {
    setInterval(createRaindrop, 20);
}

startRain();

const nameInput = document.getElementById('playerName');
        const passwordInput = document.getElementById('playerPassword');
        const playButton = document.getElementById('playButton');
        const errorText = document.getElementById('errorText');
        const registerLink = document.getElementById('registerLink');
        const registerPopup = document.getElementById('registerPopup');
        const closePopup = document.querySelector('.close');
        const registerName = document.getElementById('registerName');
        const registerPassword = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const registerButton = document.getElementById('registerButton');
        const registerErrorText = document.getElementById('registerErrorText');

        function validateInputs() {
            const name = nameInput.value.trim();
            const password = passwordInput.value.trim();

            if (name.length < 3) {
                errorText.textContent = 'Name must be at least 3 characters';
                playButton.disabled = true;
                return false;
            }

            if (password.length < 3) {
                errorText.textContent = 'Password must be at least 3 characters';
                playButton.disabled = true;
                return false;
            }

            errorText.textContent = '';
            playButton.disabled = false;
            return true;
        }

        function validateRegisterInputs() {
            const name = registerName.value.trim();
            const password = registerPassword.value.trim();
            const confirm = confirmPassword.value.trim();

            if (name.length < 3) {
                registerErrorText.textContent = 'Name must be at least 3 characters';
                registerButton.disabled = true;
                return false;
            }

            if (password.length < 3) {
                registerErrorText.textContent = 'Password must be at least 3 characters';
                registerButton.disabled = true;
                return false;
            }

            if (password !== confirm) {
                registerErrorText.textContent = 'Passwords do not match';
                registerButton.disabled = true;
                return false;
            }

            registerErrorText.textContent = '';
            registerButton.disabled = false;
            return true;
        }

        nameInput.addEventListener('input', validateInputs);
        passwordInput.addEventListener('input', validateInputs);

        registerName.addEventListener('input', validateRegisterInputs);
        registerPassword.addEventListener('input', validateRegisterInputs);
        confirmPassword.addEventListener('input', validateRegisterInputs);

        playButton.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const password = passwordInput.value.trim();
    
            // Send login data to the server
            fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: name, password: password })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to login');
                }
                return response.json();
            })
            .then(data => {
                alert('Login successful!');
                localStorage.setItem('playerName', name);
                window.location.href = 'game.html';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Login failed. Please check your username and password.');
            });
        });

        registerLink.addEventListener('click', () => {
            registerPopup.style.display = 'flex';
        });

        closePopup.addEventListener('click', () => {
            registerPopup.style.display = 'none';
        });

        registerButton.addEventListener('click', () => {
            if (validateRegisterInputs()) {
                const name = registerName.value.trim();
                const password = registerPassword.value.trim();
    
                // Send registration data to the server
                fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: name, password: password })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to register');
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Registration successful! You can now log in.');
                    registerPopup.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Registration failed. Please try again.');
                });
            }
        });

        // Close the popup if the user clicks outside of it
        window.addEventListener('click', (event) => {
            if (event.target === registerPopup) {
                registerPopup.style.display = 'none';
            }
        });