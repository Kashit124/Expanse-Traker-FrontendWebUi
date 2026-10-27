document.addEventListener("DOMContentLoaded", () => {
    // --- 1. HANDLE LOGIN FORM SUBMISSION ---
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const errorAlert = document.getElementById("error-alert");

            if (errorAlert) errorAlert.classList.add("hidden");

            try {
                const user = await apiRequest("/users/login", "POST", { email, password });

                if (user) {
                    localStorage.setItem("current_user", JSON.stringify(user));
                    window.location.href = "index.html";
                } else {
                    throw new Error("Invalid email or password.");
                }
            } catch (err) {
                localStorage.removeItem("current_user");
                if (errorAlert) {
                    errorAlert.textContent = "Invalid email or password. Please try again.";
                    errorAlert.classList.remove("hidden");
                }
            }
        });
    }

    // --- 2. HANDLE REGISTRATION / SIGN-UP FORM SUBMISSION ---
    // --- HANDLE REGISTRATION FORM ---
// --- 2. HANDLE REGISTRATION / SIGN-UP FORM SUBMISSION ---
const registerForm = document.getElementById("register-form");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Grab the value from input id="reg-name" and assign it to username
        const username = document.getElementById("reg-name")?.value.trim();
        const email = document.getElementById("reg-email")?.value.trim();
        const password = document.getElementById("reg-password")?.value.trim();
        const errorAlert = document.getElementById("error-alert");

        if (errorAlert) errorAlert.classList.add("hidden");

        try {
            // Send the JSON object matching your User entity fields
            const newUser = await apiRequest("/users/register", "POST", { username, email, password });

            if (newUser) {
                localStorage.setItem("current_user", JSON.stringify(newUser));
                window.location.href = "index.html";
            }
        } catch (err) {
            if (errorAlert) {
                errorAlert.textContent = err.message || "Registration failed. Please try again.";
                errorAlert.classList.remove("hidden");
            }
        }
    });
}
});