const API_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
    loadEmployees();
});

async function loadEmployees() {
    const listElement = document.getElementById("employeesList");
    listElement.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';

    try {
        const response = await fetch(`${API_URL}/employees/`);
        const employees = await response.json();
        
        listElement.innerHTML = "";

        employees.reverse().forEach(emp => {
            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4 mb-4";
            
            const totalTasks = emp.tasks.length;
            const completedTasks = emp.tasks.filter(t => t.is_completed).length;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
            const progressColor = progress === 100 ? "bg-success" : "bg-primary";

            // BOTÕES: Adicionei o botão de LÁPIS (Editar) ao lado da lixeira
            // Note que passo os dados como parâmetros para a função prepareEdit
            card.innerHTML = `
                <div class="card card-employee h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h5 class="card-title m-0">${emp.full_name}</h5>
                                <span class="badge bg-secondary">${emp.role}</span>
                            </div>
                            <div>
                                <button onclick="prepareEdit(${emp.id}, '${emp.full_name}', '${emp.role}', '${emp.start_date}')" 
                                    class="btn btn-outline-primary btn-sm border-0 me-1" title="Editar">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button onclick="deleteEmployee(${emp.id})" 
                                    class="btn btn-outline-danger btn-sm border-0" title="Excluir">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
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
    }
}

// Lógica Unificada: Criar ou Editar
document.getElementById("employeeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = document.getElementById("employeeId").value; // Pega o ID oculto
    const submitBtn = document.getElementById("submitBtn");

    const data = {
        full_name: document.getElementById("fullName").value,
        role: document.getElementById("role").value,
        start_date: document.getElementById("startDate").value
    };

    try {
        let response;
        
        if (id) {
            // SE TEM ID, É EDIÇÃO (PUT)
            response = await fetch(`${API_URL}/employees/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } else {
            // SE NÃO TEM ID, É CRIAÇÃO (POST)
            response = await fetch(`${API_URL}/employees/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
            resetForm(); // Limpa tudo
            loadEmployees();
        } else {
            alert("Erro ao salvar dados.");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
});

// Função para preencher o formulário com dados existentes
function prepareEdit(id, name, role, date) {
    document.getElementById("employeeId").value = id;
    document.getElementById("fullName").value = name;
    document.getElementById("role").value = role;
    document.getElementById("startDate").value = date;

    // Muda o visual do botão
    const btn = document.getElementById("submitBtn");
    btn.innerHTML = '<i class="bi bi-check-lg"></i>';
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-success");

    // Leva a tela para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Função para limpar e voltar ao modo "Criar"
function resetForm() {
    document.getElementById("employeeForm").reset();
    document.getElementById("employeeId").value = ""; // Limpa o ID oculto
    
    const btn = document.getElementById("submitBtn");
    btn.innerHTML = '<i class="bi bi-plus-lg"></i>';
    btn.classList.remove("btn-success");
    btn.classList.add("btn-primary");
}

async function toggleTask(taskId) {
    try {
        await fetch(`${API_URL}/tasks/${taskId}/toggle`, { method: "PATCH" });
        loadEmployees();
    } catch (error) { console.error(error); }
}

async function deleteEmployee(id) {
    if (confirm("Tem certeza que deseja excluir?")) {
        try {
            await fetch(`${API_URL}/employees/${id}`, { method: "DELETE" });
            loadEmployees();
        } catch (error) { console.error(error); }
    }
}