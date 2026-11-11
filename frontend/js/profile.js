/* =========================================
   TASKFLOW - DATABASE CONNECTED PROFILE
========================================= */

document.addEventListener("DOMContentLoaded", async () => {
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    try {
        const response = await fetch("/backend/api/auth/profile.php", {
            method: "GET",
            credentials: "same-origin"
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            if (response.status === 401) {
                window.location.replace("login.html");
                return;
            }

            throw new Error(result.message || "Unable to load profile.");
        }

        const user = result.data.user;
        const stats = result.data.statistics;

        document.getElementById("profileAvatar").textContent =
            user.name.charAt(0).toUpperCase();

        document.getElementById("profileName").textContent = user.name;
        document.getElementById("profileEmail").textContent = user.email;
        document.getElementById("profileRole").textContent = user.role;

        document.getElementById("profileId").textContent = user.id;
        document.getElementById("profileAccountType").textContent = user.role;

        const joinedDate = new Date(user.created_at.replace(" ", "T"));

        document.getElementById("profileJoined").textContent =
            joinedDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });

        document.getElementById("profileTotal").textContent = stats.total;
        document.getElementById("profileCompleted").textContent = stats.completed;
        document.getElementById("profilePending").textContent = stats.pending;
        document.getElementById("profileProgress").textContent = stats.in_progress;

    } catch (error) {
        console.error("Profile loading error:", error);
        document.getElementById("profileName").textContent =
            "Unable to load profile";

        if (typeof showMessage === "function") {
            showMessage(error.message);
        }
    }
});
