const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");


const openLoginModal = () => {
  loginModal.classList.remove("hidden");
  signupModal.classList.add("hidden");
};

const openSignupModal = () => {
  signupModal.classList.remove("hidden");
  loginModal.classList.add("hidden");
};

const closeModals = () => {
  loginModal.classList.add("hidden");
  signupModal.classList.add("hidden");
};

document.getElementById("getStartedButton").addEventListener("click", openLoginModal);
document.getElementById("startTrackingButton").addEventListener("click", openLoginModal);

document.getElementById("goToSignup").addEventListener("click", openSignupModal);
document.getElementById("goToLogin").addEventListener("click", openLoginModal);

window.addEventListener("click", (e) => {
  if (e.target === loginModal || e.target === signupModal) {
    closeModals();
  }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
  
    // Validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNotification('Invalid email format.', 'error');
      return;
    }
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters.', 'error');
      return;
    }
  
    try {
      const response = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showNotification('Signup successful! Redirecting to login', 'success');
        openLoginModal(); // Open the login modal
      } else {
        showNotification(data.message || 'Sign-up failed.', 'error');
      }
    } catch (err) {
      console.error('Sign-up Error:', err);
      showNotification('An error occurred. Please try again.', 'error');
    }
  });
  
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
      // Validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNotification('Invalid email format.', 'error');
        return;
      }
  
      try {
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
  

        if (response.ok) {
            showNotification('Login successful! Redirecting to dashboard', 'success');
            window.location.href = '/views/dashboard.html';
          } else {
            showNotification(data.message || 'Login failed.', 'error');
          }
        } catch (err) {
          console.error('Login Error:', err);
          showNotification('An error occurred. Please try again.', 'error');
        }
    });
  
    const showNotification = (message, type = 'success') => {
        const notification = document.getElementById('notification');
        
        // Set the message text
        notification.textContent = message;
      
        // Set the background color based on the type (success or error)
        if (type === 'error') {
          notification.classList.remove('bg-green-500');
          notification.classList.add('bg-red-500');
        } else {
          notification.classList.remove('bg-red-500');
          notification.classList.add('bg-green-500');
        }
      
        // Show the notification with animation
        notification.classList.remove('opacity-0', 'translate-y-5');
        notification.classList.add('opacity-100', 'translate-y-0');
      
        // Hide the notification after 3 seconds
        setTimeout(() => {
          notification.classList.remove('opacity-100', 'translate-y-0');
          notification.classList.add('opacity-0', 'translate-y-5');
        }, 3000); // Hides the notification after 3 seconds
      };
      
