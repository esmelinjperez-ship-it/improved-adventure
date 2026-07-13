// To-Do List Application with Local Storage
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Add task
        document.getElementById('addBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Action buttons
        document.getElementById('clearCompletedBtn').addEventListener('click', () => this.clearCompleted());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportTasks());
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all tasks?')) {
                this.clearAll();
            }
        });
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const taskText = input.value.trim();

        if (!taskText) {
            alert('Please enter a task');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.render();
        input.value = '';
        input.focus();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
    }

    clearCompleted() {
        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.render();
    }

    clearAll() {
        this.tasks = [];
        this.saveTasks();
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    getStats() {
        return {
            total: this.tasks.length,
            active: this.tasks.filter(t => !t.completed).length,
            completed: this.tasks.filter(t => t.completed).length
        };
    }

    render() {
        this.updateStats();
        this.renderTasks();
    }

    updateStats() {
        const stats = this.getStats();
        document.getElementById('totalCount').textContent = stats.total;
        document.getElementById('activeCount').textContent = stats.active;
        document.getElementById('completedCount').textContent = stats.completed;
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="app.toggleTask(${task.id})"
                >
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-date">${task.createdAt}</div>
                <button class="delete-btn" onclick="app.deleteTask(${task.id})">Delete</button>
            `;
            taskList.appendChild(li);
        });
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        this.tasks = saved ? JSON.parse(saved) : [];
    }

    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
const app = new TodoApp();
