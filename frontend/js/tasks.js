/* =========================================
   TASKFLOW - DATABASE TASKS WITH PAGINATION
========================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const search = document.getElementById("taskSearch");
    const statusFilter = document.getElementById("statusFilter");
    const priorityFilter = document.getElementById("priorityFilter");
    const tableBody = document.getElementById("taskTableBody");
    const taskForm = document.getElementById("taskForm");
    const pageSizeSelect = document.getElementById("pageSize");
    const prevButton = document.getElementById("prevPage");
    const nextButton = document.getElementById("nextPage");
    const pageNumbers = document.getElementById("pageNumbers");

    let tasks = [];
    let currentPage = 1;
    let pageSize = 5;

    if (!tableBody || !taskForm) {
        console.error("Task page elements are missing.");
        return;
    }

    const params = new URLSearchParams(location.search);
    const requestedStatus = params.get("status");

    if (
        statusFilter &&
        ["Pending", "In Progress", "Completed"].includes(requestedStatus)
    ) {
        statusFilter.value = requestedStatus;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function statusClass(status) {
        return status === "Completed"
            ? "completed"
            : status === "In Progress"
                ? "progress"
                : "pending";
    }

    function showError(message) {
        showMessage(message, "error");
    }

    async function apiRequest(endpoint, options = {}) {
        const response = await fetch(`/backend/api/tasks/${endpoint}.php`, {
            credentials: "same-origin",
            ...options
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            if (response.status === 401) {
                window.location.replace("login.html");
                throw new Error("Your session has expired. Please log in again.");
            }

            throw new Error(result.message || "Task operation failed.");
        }

        return result;
    }

    async function getCsrfToken() {
        const response = await fetch("/backend/api/auth/csrf.php", {
            credentials: "same-origin"
        });

        const result = await response.json();

        if (!response.ok || !result.success || !result.data?.csrf_token) {
            throw new Error("Unable to obtain security token.");
        }

        return result.data.csrf_token;
    }

    async function sendTaskRequest(endpoint, payload) {
        const csrfToken = await getCsrfToken();

        return apiRequest(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken
            },
            body: JSON.stringify(payload)
        });
    }

    function getFilteredTasks() {
        const searchValue = search?.value.toLowerCase().trim() || "";
        const selectedStatus = statusFilter?.value || "";
        const selectedPriority = priorityFilter?.value || "";

        return tasks.filter(task =>
            String(task.title).toLowerCase().includes(searchValue) &&
            (!selectedStatus || task.status === selectedStatus) &&
            (!selectedPriority || task.priority === selectedPriority)
        );
    }

    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / pageSize);
        const safeTotalPages = Math.max(1, totalPages);

        if (currentPage > safeTotalPages) {
            currentPage = safeTotalPages;
        }

        if (prevButton) {
            prevButton.disabled = currentPage <= 1 || totalPages === 0;
        }

        if (nextButton) {
            nextButton.disabled =
                currentPage >= totalPages || totalPages === 0;
        }

        if (pageNumbers) {
            pageNumbers.innerHTML = "";

            for (let page = 1; page <= totalPages; page++) {
                const button = document.createElement("button");

                button.type = "button";
                button.className =
                    `pagination-btn page-number ${page === currentPage ? "active" : ""}`;
                button.textContent = page;
                button.setAttribute("aria-label", `Go to page ${page}`);

                button.addEventListener("click", () => {
                    currentPage = page;
                    renderTasks();
                });

                pageNumbers.appendChild(button);
            }
        }
    }

    function renderTasks() {
        const filtered = getFilteredTasks();
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / pageSize);

        if (totalPages === 0) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const visibleTasks = filtered.slice(
            startIndex,
            startIndex + pageSize
        );

        tableBody.innerHTML = visibleTasks.length
            ? visibleTasks.map(task => `
                <tr data-id="${Number(task.id)}">
                    <td>
                        <div class="task-title">${escapeHTML(task.title)}</div>
                        <div class="task-description">
                            ${escapeHTML(task.description || "")}
                        </div>
                    </td>
                    <td>
                        <span class="status ${statusClass(task.status)}">
                            ${escapeHTML(task.status)}
                        </span>
                    </td>
                    <td>
                        <span class="priority ${escapeHTML(String(task.priority).toLowerCase())}">
                            ${escapeHTML(task.priority)}
                        </span>
                    </td>
                    <td>${escapeHTML(task.due_date || "—")}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit-task"
                                    type="button" title="Edit task"
                                    aria-label="Edit ${escapeHTML(task.title)}">✎</button>
                            <button class="action-btn delete-task"
                                    type="button" title="Delete task"
                                    aria-label="Delete ${escapeHTML(task.title)}">×</button>
                        </div>
                    </td>
                </tr>
            `).join("")
            : "";

        const emptyState = document.getElementById("emptyState");

        if (emptyState) {
            emptyState.style.display = totalItems ? "none" : "block";
        }

        const taskCount = document.getElementById("taskCount");
        if (taskCount) {
            taskCount.textContent = `${tasks.length} Tasks`;
        }

        const showingTasks = document.getElementById("showingTasks");

        if (showingTasks) {
            const first = totalItems === 0 ? 0 : startIndex + 1;
            const last = Math.min(startIndex + pageSize, totalItems);

            showingTasks.textContent =
                `Showing ${first}-${last} of ${totalItems} filtered tasks (${tasks.length} total)`;
        }

        const counts = {
            totalTasks: tasks.length,
            pendingTasks: tasks.filter(t => t.status === "Pending").length,
            progressTasks: tasks.filter(t => t.status === "In Progress").length,
            completedTasks: tasks.filter(t => t.status === "Completed").length
        };

        Object.entries(counts).forEach(([id, count]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = count;
        });

        renderPagination(totalItems);
    }

    async function loadTasks() {
        tableBody.innerHTML =
            '<tr><td colspan="5">Loading tasks...</td></tr>';

        try {
            const result = await apiRequest("read");
            tasks = result.data.tasks || [];
            currentPage = 1;
            renderTasks();
        } catch (error) {
            tableBody.innerHTML = `
                <tr><td colspan="5">${escapeHTML(error.message)}</td></tr>
            `;
            showError(error.message);
        }
    }

    search?.addEventListener("input", () => {
        currentPage = 1;
        renderTasks();
    });

    statusFilter?.addEventListener("change", () => {
        currentPage = 1;
        renderTasks();
    });

    priorityFilter?.addEventListener("change", () => {
        currentPage = 1;
        renderTasks();
    });

    pageSizeSelect?.addEventListener("change", () => {
        pageSize = Number(pageSizeSelect.value) || 5;
        currentPage = 1;
        renderTasks();
    });

    prevButton?.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderTasks();
        }
    });

    nextButton?.addEventListener("click", () => {
        const totalPages = Math.ceil(getFilteredTasks().length / pageSize);

        if (currentPage < totalPages) {
            currentPage++;
            renderTasks();
        }
    });

    // Edit and delete actions
    tableBody.addEventListener("click", async event => {
        const row = event.target.closest("tr");
        if (!row) return;

        const id = Number(row.dataset.id);
        const task = tasks.find(item => Number(item.id) === id);

        if (!task) return;

        if (event.target.closest(".edit-task")) {
            openTaskModal(task);
            return;
        }

        if (event.target.closest(".delete-task")) {
            const confirmed = await showConfirm(
                "Are you sure you want to delete this task? This action cannot be undone.",
                "Delete task?",
                "Delete"
            );

            if (!confirmed) return;

            try {
                await sendTaskRequest("delete", { id });

                tasks = tasks.filter(item => Number(item.id) !== id);
                renderTasks();

                showMessage("Task deleted successfully.");
            } catch (error) {
                showError(error.message);
            }
        }
    });

    // Create or update tasks
    taskForm.addEventListener("submit", async event => {
        event.preventDefault();

        const submitButton = taskForm.querySelector('[type="submit"]');
        if (submitButton?.disabled) return;

        const formData = new FormData(taskForm);
        const id = formData.get("id");

        const payload = {
            title: String(formData.get("title") || "").trim(),
            description: String(formData.get("description") || "").trim(),
            status: formData.get("status"),
            priority: formData.get("priority"),
            due_date: formData.get("due_date") || ""
        };

        if (!payload.title) {
            showError("Please enter a task title.");
            return;
        }

        if (id) payload.id = Number(id);

        try {
            if (submitButton) submitButton.disabled = true;

            await sendTaskRequest(id ? "update" : "create", payload);

            closeTaskModal();
            taskForm.reset();

            showMessage(
                id ? "Task updated successfully." : "Task created successfully."
            );

            await loadTasks();

        } catch (error) {
            showError(error.message);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    await loadTasks();
});
