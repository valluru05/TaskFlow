/* =========================================
   TASKFLOW - DATABASE CONNECTED DASHBOARD
========================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const taskForm = document.getElementById("taskForm");

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

    function notify(message) {
        showMessage(message, "error");
    }

    async function apiRequest(url, options = {}) {
        const response = await fetch(url, {
            credentials: "same-origin",
            ...options
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            if (response.status === 401) {
                window.location.replace("login.html");
            }

            throw new Error(result.message || "Something went wrong.");
        }

        return result;
    }

    async function getCsrfToken() {
        const result = await apiRequest("/backend/api/auth/csrf.php");
        return result.data.csrf_token;
    }

    async function sendTaskRequest(endpoint, payload) {
        const token = await getCsrfToken();

        return apiRequest(`/backend/api/tasks/${endpoint}.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": token
            },
            body: JSON.stringify(payload)
        });
    }

    function renderSummary(summary) {
        document.getElementById("totalTasks").textContent = summary.total;
        document.getElementById("pendingTasks").textContent = summary.pending;
        document.getElementById("progressTasks").textContent = summary.in_progress;
        document.getElementById("completedTasks").textContent = summary.completed;

        const percentage = summary.completion_percentage;

        document.getElementById("completionPercent").textContent =
            percentage + "%";

        document.getElementById("completionText").textContent =
            `${summary.completed} out of ${summary.total} tasks completed`;

        document.getElementById("completionFill").style.width =
            percentage + "%";

        document.getElementById("completionCircle").style.background =
            `conic-gradient(#7044D8 0% ${percentage}%, #F0EDF6 ${percentage}% 100%)`;
    }

    function renderWeeklyChart(weeklyData) {
        const maxCount = Math.max(
            1,
            ...weeklyData.map(day => Number(day.completed))
        );

        document.getElementById("productivityChart").innerHTML =
            weeklyData.map(day => {
                const count = Number(day.completed);
                const height = count === 0
                    ? 4
                    : Math.max(8, (count / maxCount) * 100);

                return `
                    <div class="chart-column">
                        <div class="chart-bar"
                             style="height:${height}%"
                             title="${count} completed task(s)">
                        </div>
                        <span class="chart-day">${escapeHTML(day.day)}</span>
                    </div>
                `;
            }).join("");
    }

    function renderRecentTasks(tasks) {
        const container = document.getElementById("recentTasks");

        if (!tasks.length) {
            container.textContent = "No tasks available yet.";
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="task-row">
                <div>
                    <div class="task-row-title">
                        ${escapeHTML(task.title)}
                    </div>
                    <div class="task-row-description">
                        ${escapeHTML(task.description || "")}
                    </div>
                </div>
                <span class="status ${statusClass(task.status)}">
                    ${escapeHTML(task.status)}
                </span>
            </div>
        `).join("");
    }

    function renderUpcomingDeadlines(tasks) {
        const container = document.getElementById("upcomingDeadlines");

        if (!tasks.length) {
            container.innerHTML = "<p>No upcoming deadlines.</p>";
            return;
        }

        container.innerHTML = tasks.map(task => {
            const date = new Date(task.due_date + "T00:00:00");

            return `
                <div class="deadline-item">
                    <div class="deadline-date">${date.getDate()}</div>
                    <div>
                        <strong>${escapeHTML(task.title)}</strong>
                        <small>
                            ${date.toLocaleString("en", { month: "long" })}
                            · ${escapeHTML(task.priority)} priority
                        </small>
                    </div>
                </div>
            `;
        }).join("");
    }

    async function loadDashboard() {
        try {
            const result = await apiRequest(
                "/backend/api/dashboard/statistics.php"
            );

            const data = result.data;

            renderSummary(data.summary);
            renderWeeklyChart(data.weekly_productivity);
            renderRecentTasks(data.recent_tasks);
            renderUpcomingDeadlines(data.upcoming_deadlines);

        } catch (error) {
            console.error("Dashboard loading error:", error);
            notify(error.message);
        }
    }

    // Dashboard Add/Edit Task form
    if (taskForm) {
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
                notify("Please enter a task title.");
                return;
            }

            if (id) payload.id = Number(id);

            try {
                if (submitButton) submitButton.disabled = true;

                await sendTaskRequest(
                    id ? "update" : "create",
                    payload
                );

                closeTaskModal();
                taskForm.reset();

                notify(
                    id
                        ? "Task updated successfully."
                        : "Task created successfully."
                );

                await loadDashboard();

            } catch (error) {
                notify(error.message);
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    await loadDashboard();
});
