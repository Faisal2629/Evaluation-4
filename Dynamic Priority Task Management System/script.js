document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/tasks';
    const taskForm = document.getElementById('task-form');
    const tasksContainer = document.getElementById('tasks-container');
    const paginationContainer = document.getElementById('pagination-container');
    const filterStatus = document.getElementById('filter-status');
    const filterPriority = document.getElementById('filter-priority');
    let currentPage = 1;
    const tasksPerPage = 5;

    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const status = document.getElementById('status').value;
        const dueDate = document.getElementById('dueDate').value;
        await addTask({ title, description, status, dueDate });
        fetchAndDisplayTasks();
    });

    filterStatus.addEventListener('change', () => {
        currentPage = 1;
        fetchAndDisplayTasks();
    });

    filterPriority.addEventListener('change', () => {
        currentPage = 1;
        fetchAndDisplayTasks();
    });

    async function addTask(task) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            });
            if (!response.ok) throw new Error('Failed to add task');
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function fetchAndDisplayTasks() {
        try {
            let url = `${API_URL}?_page=${currentPage}&_limit=${tasksPerPage}`;
            const status = filterStatus.value;
            const priority = filterPriority.value;
            if (status) url += `&status=${status}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const tasks = await response.json();
            displayTasks(tasks);
            updatePagination();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function displayTasks(tasks) {
        tasksContainer.innerHTML = '';
        tasks.forEach(task => {
            const priority = getPriority(task.dueDate);
            if (filterPriority.value && filterPriority.value !== priority) return;
            const taskCard = document.createElement('div');
            taskCard.classList.add('task-card');
            taskCard.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <p>Status: ${task.status}</p>
                <p>Due Date: ${new Date(task.dueDate).toLocaleString()}</p>
                <p>Priority: ${priority}</p>
                <button onclick="editTask(${task.id})">Edit</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            `;
            tasksContainer.appendChild(taskCard);
        });
    }

    function getPriority(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const diffInMinutes = (due - now) / (1000 * 60);
        if (diffInMinutes <= 2) return 'High';
        if (diffInMinutes <= 3) return 'Medium';
        return 'Low';
    }

    async function editTask(taskId) {
        const newTitle = prompt('Enter new title:');
        const newDescription = prompt('Enter new description:');
        const newStatus = prompt('Enter new status (Open, In Progress, Closed):');
        const newDueDate = prompt('Enter new due date (YYYY-MM-DDTHH:MM:SS):');
        try {
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: newTitle, description: newDescription, status: newStatus, dueDate: newDueDate })
            });
            if (!response.ok) throw new Error('Failed to edit task');
            fetchAndDisplayTasks();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function deleteTask(taskId) {
        try {
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete task');
            fetchAndDisplayTasks();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function updatePagination() {
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) { // Assuming there are 5 pages for simplicity
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.disabled = i === currentPage;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                fetchAndDisplayTasks();
            });
            paginationContainer.appendChild(pageButton);
        }
    }

    fetchAndDisplayTasks();
});
