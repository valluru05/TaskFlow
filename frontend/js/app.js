
/* =========================================
   TASKFLOW - SHARED APPLICATION FUNCTIONS
========================================= */

const TaskFlow = {
    sampleTasks: [
        {id: 1, title: "Complete PHP assignment", description: "Finish the TaskFlow project", status: "In Progress", priority: "High", due_date: "2026-11-12"},
        {id: 2, title: "Prepare documentation", description: "Write project README", status: "Pending", priority: "Medium", due_date: "2026-11-14"},
        {id: 3, title: "Review database schema", description: "Check relationships and indexes", status: "Completed", priority: "Low", due_date: "2026-11-10"},
        {id: 4, title: "Build dashboard UI", description: "Complete responsive frontend", status: "In Progress", priority: "High", due_date: "2026-11-16"},
        {id: 5, title: "Test application", description: "Perform security and functionality tests", status: "Pending", priority: "Medium", due_date: "2026-11-18"}
    ],

    getTasks() {
        try {
            const saved = localStorage.getItem("taskflow_tasks");
            return saved ? JSON.parse(saved) : this.sampleTasks;
        } catch {
            return this.sampleTasks;
        }
    },

    saveTasks(tasks) {
        localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
    }
};

window.TaskFlow = TaskFlow;


/* =========================================
   TASKFLOW - THEMED NOTIFICATION SYSTEM
========================================= */

function showMessage(message, type = "success", duration = 3500) {
    const themes = {
        success: { icon: "✓", color: "#16A36A", background: "#EAF8F0", title: "Success" },
        error:   { icon: "✕", color: "#DC4C4C", background: "#FFF0F0", title: "Something went wrong" },
        warning: { icon: "!", color: "#D99422", background: "#FFF7E8", title: "Warning" },
        info:    { icon: "i", color: "#4385D7", background: "#EEF5FF", title: "Information" }
    };

    const theme = themes[type] || themes.success;

    let container = document.getElementById("taskflow-notifications");

    if (!container) {
        container = document.createElement("div");
        container.id = "taskflow-notifications";

        Object.assign(container.style, {
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: "10001",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "min(380px, calc(100vw - 32px))",
            pointerEvents: "none"
        });

        document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    Object.assign(toast.style, {
        display: "flex",
        alignItems: "center",
        gap: "13px",
        padding: "16px",
        background: "#FFFFFF",
        border: "1px solid #EEE8FA",
        borderLeft: `4px solid ${theme.color}`,
        borderRadius: "14px",
        boxShadow: "0 12px 35px rgba(45, 30, 85, .13)",
        fontFamily: "inherit",
        pointerEvents: "auto",
        opacity: "0",
        transform: "translateX(25px)",
        transition: "opacity .25s ease, transform .25s ease"
    });

    const icon = document.createElement("div");

    Object.assign(icon.style, {
        width: "38px",
        height: "38px",
        minWidth: "38px",
        display: "grid",
        placeItems: "center",
        borderRadius: "11px",
        background: theme.background,
        color: theme.color,
        fontSize: "19px",
        fontWeight: "800"
    });

    icon.textContent = theme.icon;

    const content = document.createElement("div");
    content.style.flex = "1";
    content.style.minWidth = "0";

    const heading = document.createElement("strong");
    heading.textContent = theme.title;
    Object.assign(heading.style, {
        display: "block",
        color: "#302849",
        fontSize: "13px",
        marginBottom: "4px"
    });

    const description = document.createElement("div");
    description.textContent = String(message);
    Object.assign(description.style, {
        color: "#77718B",
        fontSize: "12px",
        lineHeight: "1.5",
        overflowWrap: "anywhere"
    });

    content.append(heading, description);

    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "Close notification");

    Object.assign(close.style, {
        border: "none",
        background: "transparent",
        color: "#918AA4",
        fontSize: "21px",
        cursor: "pointer",
        padding: "0 3px"
    });

    const dismiss = () => {
        if (!toast.isConnected) return;
        toast.style.opacity = "0";
        toast.style.transform = "translateX(25px)";
        setTimeout(() => toast.remove(), 250);
    };

    close.addEventListener("click", dismiss);

    toast.append(icon, content, close);
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(0)";
    });

    if (duration > 0) {
        setTimeout(dismiss, duration);
    }
}

window.showMessage = showMessage;

/* Custom themed confirmation dialog */
function showConfirm(message, title = "Are you sure?", confirmText = "Continue") {
    return new Promise(resolve => {
        const overlay = document.createElement("div");

        Object.assign(overlay.style, {
            position: "fixed",
            inset: "0",
            zIndex: "10002",
            display: "grid",
            placeItems: "center",
            padding: "20px",
            background: "rgba(32, 24, 55, .48)",
            backdropFilter: "blur(4px)",
            opacity: "0",
            transition: "opacity .2s ease"
        });

        const dialog = document.createElement("div");

        Object.assign(dialog.style, {
            width: "min(420px, 100%)",
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "27px",
            boxShadow: "0 25px 80px rgba(20, 10, 50, .25)",
            fontFamily: "inherit",
            transform: "translateY(12px)",
            transition: "transform .2s ease"
        });

        const heading = document.createElement("h3");
        heading.textContent = title;
        Object.assign(heading.style, {
            color: "#302849",
            fontSize: "19px",
            margin: "0 0 10px"
        });

        const description = document.createElement("p");
        description.textContent = message;
        Object.assign(description.style, {
            color: "#77718B",
            fontSize: "14px",
            lineHeight: "1.7",
            margin: "0 0 24px"
        });

        const actions = document.createElement("div");

        Object.assign(actions.style, {
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px"
        });

        function makeButton(label, primary) {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;

            Object.assign(button.style, {
                padding: "11px 19px",
                borderRadius: "10px",
                border: primary ? "none" : "1px solid #E8E2F2",
                background: primary ? "#7044D8" : "#FFFFFF",
                color: primary ? "#FFFFFF" : "#625B78",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer"
            });

            return button;
        }

        const cancelButton = makeButton("Cancel", false);
        const confirmButton = makeButton(confirmText, true);

        let settled = false;

        function close(value) {
            if (settled) return;
            settled = true;
            document.removeEventListener("keydown", onKeyDown);
            overlay.style.opacity = "0";
            setTimeout(() => overlay.remove(), 200);
            resolve(value);
        }

        function onKeyDown(event) {
            if (event.key === "Escape") close(false);
            if (event.key === "Enter") close(true);
        }

        cancelButton.addEventListener("click", () => close(false));
        confirmButton.addEventListener("click", () => close(true));
        overlay.addEventListener("click", event => {
            if (event.target === overlay) close(false);
        });

        document.addEventListener("keydown", onKeyDown);

        actions.append(cancelButton, confirmButton);
        dialog.append(heading, description, actions);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = "1";
            dialog.style.transform = "translateY(0)";
        });

        confirmButton.focus();
    });
}

window.showConfirm = showConfirm;

/* Shared sidebar */
document.addEventListener("DOMContentLoaded", async () => {
    const currentPage = location.pathname.split("/").pop();
    const protectedPages = ["dashboard.html", "tasks.html", "profile.html"];

    if (protectedPages.includes(currentPage)) {
        try {
            const response = await fetch("/backend/api/auth/me.php", {
                credentials: "same-origin"
            });

            if (!response.ok) {
                sessionStorage.removeItem("taskflow_user");
                sessionStorage.removeItem("taskflow_csrf_token");
                window.location.replace("login.html");
                return;
            }

            const result = await response.json();

            if (!result.success) {
                window.location.replace("login.html");
                return;
            }

            sessionStorage.setItem("taskflow_user", JSON.stringify(result.data.user));
            sessionStorage.setItem("taskflow_csrf_token", result.data.csrf_token);

        } catch (error) {
            console.error("Session verification failed:", error);
            showMessage("Unable to verify your session. Please try again.");
            return;
        }
    }

    const sidebarContainer = document.getElementById("appSidebar");

    if (sidebarContainer) {
        const currentPage = location.pathname.split("/").pop();

        sidebarContainer.innerHTML = `
            <aside class="sidebar" id="sidebar">
                <a href="index.html" class="brand">
                    <span class="brand-icon">✦</span>
                    <span class="brand-name">TaskFlow.</span>
                </a>

                <div class="nav-label">Workspace</div>

                <a href="dashboard.html"
                   class="nav-link ${currentPage === "dashboard.html" ? "active" : ""}">
                    <span class="nav-icon">⌂</span> Dashboard
                </a>

                <a href="tasks.html"
                   class="nav-link ${currentPage === "tasks.html" ? "active" : ""}">
                    <span class="nav-icon">▤</span> All Tasks
                </a>

                <div class="nav-label">Task Status</div>

                <a href="tasks.html?status=Pending" class="nav-link">
                    <span class="nav-icon">◷</span> Pending
                </a>

                <a href="tasks.html?status=In%20Progress" class="nav-link">
                    <span class="nav-icon">◉</span> In Progress
                </a>

                <a href="tasks.html?status=Completed" class="nav-link">
                    <span class="nav-icon">✓</span> Completed
                </a>

                <div class="nav-label">Account</div>

                <a href="profile.html" class="nav-link">
                    <span class="nav-icon">◎</span> My Profile
                </a>

                <a href="login.html" class="nav-link" id="logoutLink">
                    <span class="nav-icon">↪</span> Logout
                </a>

                <div class="sidebar-bottom">
                    <div class="sidebar-promo">
                        <div class="promo-icon">✦</div>
                        <strong>Stay productive!</strong>
                        <p>Small steps lead to big achievements.</p>
                    </div>

                    <div class="sidebar-user">
                        <div class="avatar">U</div>
                        <div>
                            <strong>Guest User</strong>
                            <small>Personal Workspace</small>
                        </div>
                    </div>
                </div>
            </aside>
        `;

        const user = JSON.parse(sessionStorage.getItem("taskflow_user") || "null");
        const userName = user?.name || "User";
        const avatar = sidebarContainer.querySelector(".sidebar-user .avatar");
        const userNameElement = sidebarContainer.querySelector(".sidebar-user strong");

        if (avatar) avatar.textContent = userName.charAt(0).toUpperCase();
        if (userNameElement) userNameElement.textContent = userName;

        document.getElementById("logoutLink").addEventListener("click", async (event) => {
            event.preventDefault();

            try {
                const csrfResponse = await fetch("/backend/api/auth/csrf.php", {
                    credentials: "same-origin"
                });
                const csrfResult = await csrfResponse.json();

                if (!csrfResponse.ok || !csrfResult.success) {
                    throw new Error("Unable to initialize logout security.");
                }

                const response = await fetch("/backend/api/auth/logout.php", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": csrfResult.data.csrf_token
                    },
                    body: JSON.stringify({})
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Logout failed.");
                }

                sessionStorage.removeItem("taskflow_user");
                sessionStorage.removeItem("taskflow_csrf_token");
                localStorage.removeItem("taskflow_user");

                window.location.replace("login.html");

            } catch (error) {
                showMessage(error.message || "Unable to log out.");
            }
        });
    }

    // Mobile sidebar with backdrop and accessible controls
    const toggle = document.getElementById("mobileToggle");
    const sidebar = document.getElementById("sidebar");

    if (toggle && sidebar) {
        const backdrop = document.createElement("button");
        backdrop.type = "button";
        backdrop.className = "sidebar-backdrop";
        backdrop.setAttribute("aria-label", "Close navigation");
        backdrop.setAttribute("aria-hidden", "true");
        document.body.appendChild(backdrop);

        function openSidebar() {
            sidebar.classList.add("open");
            backdrop.classList.add("visible");
            backdrop.setAttribute("aria-hidden", "false");
            toggle.setAttribute("aria-expanded", "true");
        }

        function closeSidebar() {
            sidebar.classList.remove("open");
            backdrop.classList.remove("visible");
            backdrop.setAttribute("aria-hidden", "true");
            toggle.setAttribute("aria-expanded", "false");
        }

        toggle.setAttribute("aria-expanded", "false");
        toggle.addEventListener("click", () => {
            sidebar.classList.contains("open")
                ? closeSidebar()
                : openSidebar();
        });

        backdrop.addEventListener("click", closeSidebar);

        sidebar.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", closeSidebar);
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeSidebar();
        });
    }

    // Modal outside-click behavior
    const modal = document.getElementById("taskModal");

    if (modal) {
        modal.addEventListener("click", event => {
            if (event.target === modal) closeTaskModal();
        });
    }


});

function openTaskModal(task = null) {
    const modal = document.getElementById("taskModal");
    const form = document.getElementById("taskForm");

    if (!modal || !form) return;

    form.reset();
    form.elements.id.value = task?.id || "";
    form.elements.title.value = task?.title || "";
    form.elements.description.value = task?.description || "";
    form.elements.status.value = task?.status || "Pending";
    form.elements.priority.value = task?.priority || "Medium";
    form.elements.due_date.value = task?.due_date || "";

    const heading = document.getElementById("modalTitle");
    if (heading) heading.textContent = task ? "Edit Task" : "Create New Task";

    modal.classList.add("show");
}

function closeTaskModal() {
    document.getElementById("taskModal")?.classList.remove("show");
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeTaskModal();
});
