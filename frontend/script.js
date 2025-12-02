const API_URL = "http://127.0.0.1:8000";

// 1. Carregar funcionários ao abrir a tela
document.addEventListener("DOMContentLoaded", () => {
    loadEmployees();
});

// 2. Função para buscar dados da API
async function loadEmployees() {
    const listElement = document.getElementById("employeesList");
    listElement.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';

    try {
        const response = await fetch(`${API_URL}/employees/`);
        const employees = await response.json();
        
        listElement.innerHTML = ""; // Limpa o loading

        // Para cada funcionário, cria um Card HTML
        employees.reverse().forEach(emp => {
            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4 mb-4";
            
            // Lógica da barra de progresso
            const totalTasks = emp.tasks.length;
            const completedTasks = emp.tasks.filter(t => t.is_completed).length;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
            const progressColor = progress === 100 ? "bg-success" : "bg-primary";

            card.innerHTML = `
                <div class="card card-employee h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title m-0">${emp.full_name}</h5>
                            <span class="badge bg-secondary">${emp.role}</span>
                        </div>
                        <p class="text-muted small"><i class="bi bi-calendar-event"></i> Início: ${emp.start_date}</p>
                        
                        <div class="progress mb-3" style="height: 10px;">
                            <div class="progress-bar ${progressColor}" role="progressbar" style="width: ${progress}%"></div>
                        </div>

                        <ul class="list-group list-group-flush small">
                            ${emp.tasks.map(task => `
                                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span class="${task.is_completed ? 'task-done' : ''}">${task.title}</span>
                                    <button onclick="toggleTask(${task.id})" 
                                        class="btn btn-sm ${task.is_completed ? 'btn-outline-success' : 'btn-outline-secondary'} py-0" 
                                        style="font-size: 0.7rem;">
                                        ${task.is_completed ? '<i class="bi bi-check-lg"></i>' : 'Pendente'}
                                    </button>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
            listElement.appendChild(card);
        });

    } catch (error) {
        console.error("Erro:", error);
        listElement.innerHTML = `<div class="alert alert-danger">Erro ao carregar dados da API. O servidor está rodando?</div>`;
    }
}

// 3. Função para Cadastrar Funcionário
document.getElementById("employeeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const data = {
        full_name: document.getElementById("fullName").value,
        role: document.getElementById("role").value,
        start_date: document.getElementById("startDate").value
    };

    try {
        const response = await fetch(`${API_URL}/employees/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById("employeeForm").reset();
            loadEmployees(); // Recarrega a lista
        } else {
            alert("Erro ao criar funcionário");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
});

// 4. Função para Marcar/Desmarcar Tarefa
async function toggleTask(taskId) {
    try {
        await fetch(`${API_URL}/tasks/${taskId}/toggle`, { method: "PATCH" });
        loadEmployees(); // Recarrega para atualizar a barra de progresso
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
    }
}