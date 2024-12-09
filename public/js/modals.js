const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");


const openLoginModal = () => {
  clearModalForm(loginModal);
  loginModal.classList.remove("hidden");
  signupModal.classList.add("hidden");
};

const openSignupModal = () => {
  clearModalForm(loginModal);
  signupModal.classList.remove("hidden");
  loginModal.classList.add("hidden");
};

const closeModals = () => {
  loginModal.classList.add("hidden");
  signupModal.classList.add("hidden");
};

const clearModalForm = (modal) => {
  const form = modal.querySelector("form");
  if (form) form.reset(); // Clear input fields
  const statusDiv = modal.querySelector("#" + (modal.id === "loginModal" ? "loginStatus" : "signupStatus"));
  if (statusDiv) statusDiv.classList.add("hidden"); // Hide status messages
};

//document.getElementById("getStartedButton").addEventListener("click", openLoginModal);
document.getElementById("startTrackingButton").addEventListener("click", openLoginModal);

document.getElementById("goToSignup").addEventListener("click", openSignupModal);
document.getElementById("goToLogin").addEventListener("click", openLoginModal);

window.addEventListener("click", (e) => {
  if (e.target === loginModal || e.target === signupModal) {
    closeModals();
  }
});
// Helper function to show status messages
const showModalStatus = (modal, message, type) => {
  const statusDiv = modal.querySelector("#" + (modal.id === "loginModal" ? "loginStatus" : "signupStatus"));
  statusDiv.textContent = message;

  // Update styling based on type
  if (type === "success") {
    statusDiv.classList.remove("hidden", "text-red-500");
    statusDiv.classList.add("text-green-light");
  } else {
    statusDiv.classList.remove("hidden", "text-green-light");
    statusDiv.classList.add("text-red-error");
  }
   // Automatically hide the status message after 3 seconds
   setTimeout(() => {
    statusDiv.classList.add('hidden');
  }, 3000);
};



// Handle signup form submission
// Signup Form Submission Handler
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showModalStatus(signupModal, "Invalid email format.", "error");
    return;
  }

  if (password.length < 8) {
    showModalStatus(signupModal, "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.", "error");
    return;
  }

  try {
    const response = await fetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showModalStatus(signupModal, "Signup successful! Redirecting...", "success");
      setTimeout(() => {
        openLoginModal();
        showModalStatus(loginModal, "You can now log in with your credentials.", "success");
      }, 1000);
    }
    else {
      showModalStatus(signupModal, data.message || "Signup failed.", "error");
    }
  } catch (err) {
    console.error("Signup Error:", err);
    showModalStatus(signupModal, "An error occurred. Please try again.", "error");
  }
});

// Login Form Submission Handler
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showModalStatus(loginModal, "Invalid email format.", "error");
    return;
  }

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showModalStatus(loginModal, "Login successful! Redirecting to dashboard.", "success");
      setTimeout(() => {
        window.location.href = "/views/dashboard.html";
      }, 1000);
    } else {
      showModalStatus(loginModal, data.message || "Login failed.", "error");
    }
  } catch (err) {
    console.error("Login Error:", err);
    showModalStatus(loginModal, "An error occurred. Please try again.", "error");
  }
});


