document.addEventListener("DOMContentLoaded", () => {
    const taskName = document.getElementById("taskName");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const taskContainer = document.getElementById("taskContainer");

    // Edit Task Modal Elements
    const editTaskModal = document.getElementById("editTaskModal");
    const editTaskId = document.getElementById("editTaskId");
    const editTaskTitle = document.getElementById("editTaskTitle");
    const editTaskDescription = document.getElementById("editTaskDescription");
    const editTaskStatus = document.getElementById("editTaskStatus");
    const updateTaskBtn = document.getElementById("updateTaskBtn");

    // Load tasks from backend
    function loadTasks() {
        fetch("/api/tasks")
            .then(response => response.json())
            .then(tasks => {
                taskContainer.innerHTML = "";
                tasks.forEach(task => addTaskToDOM(task));
            })
            .catch(error => console.error("Error fetching tasks:", error));
    }

    // Add Task
    addTaskBtn?.addEventListener("click", () => {
        console.log("Add Task Button Clicked!"); // Debugging
        const taskText = taskName?.value.trim();
        if (!taskText) return;

        fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: taskText,
                description: "No description",
                status: "Pending"
            })
        })
        .then(response => response.json())
        .then(task => {
            console.log("Task added successfully:", task);
            addTaskToDOM(task);
            if (taskName) taskName.value = "";
        })
        .catch(error => console.error("Error adding task:", error));
    });

    // Add Task to DOM
    function addTaskToDOM(task) {
        const li = document.createElement("li");
        li.classList.add("task-item");
        li.setAttribute("data-id", task.id);

        li.innerHTML = `
            <strong>${task.title}</strong> - ${task.description}
            <span class="status ${task.status ? task.status.toLowerCase() : 'unknown'}">${task.status}</span>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        `;
        taskContainer?.appendChild(li);

        // Delete Task
        li.querySelector(".delete-btn")?.addEventListener("click", () => deleteTask(task.id, li));

        // Open Edit Modal
        li.querySelector(".edit-btn")?.addEventListener("click", () => openEditModal(task));
    }

    // Open Edit Modal
    function openEditModal(task) {
        if (!editTaskModal) return;
        editTaskId.value = task.id;
        editTaskTitle.value = task.title;
        editTaskDescription.value = task.description;
        editTaskStatus.value = task.status;

        editTaskModal.style.display = "block";
    }

    // Close Edit Modal
    function closeEditModal() {
        if (editTaskModal) editTaskModal.style.display = "none";
    }

    // Update Task
    updateTaskBtn?.addEventListener("click", () => {
        console.log("Update Task Button Clicked!");

        const taskId = editTaskId?.value;
        const updatedTitle = editTaskTitle?.value.trim();
        const updatedDescription = editTaskDescription?.value.trim();
        const updatedStatus = editTaskStatus?.value;

        if (!taskId || !updatedTitle) {
            alert("Task title cannot be empty!");
            return;
        }

        const isCompleted = updatedStatus.toLowerCase() === "completed" ? 1 : 0;

        fetch(`/api/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: updatedTitle,
                description: updatedDescription,
                status: updatedStatus,
                completed: isCompleted
            })
        })
        .then(response => response.json())
        .then(updatedTask => {
            console.log("Task updated successfully:", updatedTask);
            updateTaskInDOM(updatedTask);
            closeEditModal();
        })
        .catch(error => console.error("Error updating task:", error));
    });

    // Update Task in DOM
    function updateTaskInDOM(updatedTask) {
        const taskElement = document.querySelector(`[data-id="${updatedTask.id}"]`);
        if (!taskElement) return;

        taskElement.innerHTML = `
            <strong>${updatedTask.title}</strong> - ${updatedTask.description}
            <span class="status ${updatedTask.status ? updatedTask.status.toLowerCase() : 'unknown'}">${updatedTask.status}</span>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        `;

        taskElement.querySelector(".edit-btn")?.addEventListener("click", () => openEditModal(updatedTask));
        taskElement.querySelector(".delete-btn")?.addEventListener("click", () => deleteTask(updatedTask.id, taskElement));
    }

    // Delete Task
    function deleteTask(taskId, taskElement) {
        fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
            .then(() => taskElement?.remove())
            .catch(error => console.error("Error deleting task:", error));
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (editTaskModal && event.target === editTaskModal) {
            closeEditModal();
        }
    };

    // Initial Load
    loadTasks();
});