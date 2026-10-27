const API_BASE_URL = "http://localhost:8080/api";

async function apiRequest(endpoint, method = "GET", body = null) {
    const headers = {
        "Content-Type": "application/json"
    };

    // Make sure this part is present in your api.js:
    const currentUserStr = localStorage.getItem("current_user");
    if (currentUserStr) {
        try {
            const currentUser = JSON.parse(currentUserStr);
            const userEmail = currentUser.email || currentUser.Email;
            if (userEmail) {
                headers["X-User-Email"] = userEmail;
            }
        } catch (e) {
            console.error("Error parsing current_user", e);
        }
    }

    const options = { method, headers };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "An error occurred" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}
