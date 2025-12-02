const API_URL = "http://127.0.0.1:8000";

// Credenciais (Hardcoded para Portfólio)
const USER = "admin";
const PASS = "guess123";
const AUTH_HEADER = { 
    "Authorization": "Basic " + btoa(USER + ":" + PASS) 
};

// Variável global para guardar quem está aberto
let openChecklistIds = new Set();

document.addEventListener("DOMContentLoaded", () => {
    loadEmployees();
});

// --- FUNÇÃO DE CONTROLE MANUAL DO CHECKLIST ---
// Substitui o comportamento automático do Bootstrap para evitar bugs visuais
window.toggleChecklistManual = function(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    // Usa a API oficial do Bootstrap para alternar (com animação)
    // O 'toggle: false' serve para pegarmos a instância sem disparar a ação imediatamente
    const bsCollapse = bootstrap.Collapse.getOrCreateInstance(el, { toggle: false });
    
    // Alterna manual
    bsCollapse.toggle();

    // Atualiza nossa memória global
    if (el.classList.contains('show')) {
        openChecklistIds.delete(elementId); // Vai fechar
    } else {
        openChecklistIds.add(elementId); // Vai abrir
    }

    // Atualiza visual do botão (seta para baixo/cima)
    updateButtonVisual(elementId, !el.classList.contains('show'));
};

function updateButtonVisual(targetId, isOpening) {
    // Acha o botão que controla este alvo
    const btn = document.querySelector(`button[onclick*="${targetId}"]`);
    if (btn) {
        if (isOpening) {
            btn.classList.remove('collapsed');
            btn.setAttribute('aria-expanded', 'true');
        } else {
            btn.classList.add('collapsed');
            btn.setAttribute('aria-expanded', 'false');
        }
    }
}

async function loadEmployees() {
    const listElement = document.getElementById("employeesList");
    
    // 1. MEMÓRIA: Atualiza a lista global com o que está visível no DOM agora
    // Isso garante que não perderemos o estado se o usuário abriu algo manualmente
    document.querySelectorAll('.collapse.show').forEach(el => openChecklistIds.add(el.id));

    if (!listElement.innerHTML.trim()) {
        listElement.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Carregando equipe...</p></div>';
    }

    try {
        const response = await fetch(`${API_URL}/employees/`);
        const employees = await response.json();
        
        listElement.innerHTML = "";

        if (employees.length === 0) {
            listElement.innerHTML = '<div class="col-12 text-center text-muted mt-5"><h4>Nenhum colaborador encontrado</h4><p>Cadastre o primeiro acima 🚀</p></div>';
            return;
        }

        employees.reverse().forEach(emp => {
            const card = document.createElement("div");
            card.className = "col-md-6 col-lg-4 mb-4";
            
            const totalTasks = emp.tasks.length;
            const completedTasks = emp.tasks.filter(t => t.is_completed).length;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
            
            let statusColorClass = "status-todo";
            let badgeHtml = '<span class="badge bg-secondary">A Iniciar</span>';
            let progressBarColor = "bg-secondary";

            if (progress === 100) {
                statusColorClass = "status-done";
                badgeHtml = '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Concluído</span>';
                progressBarColor = "bg-success";
            } else if (progress > 0) {
                statusColorClass = "status-progress";
                badgeHtml = '<span class="badge bg-primary">Em Andamento</span>';
                progressBarColor = "bg-primary";
            }
            
            const collapseId = `collapseChecklist-${emp.id}`;
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.full_name)}&background=random&color=fff&size=128`;

            // 2. ESTADO PRÉ-RENDERIZADO
            const isOpen = openChecklistIds.has(collapseId);
            const showClass = isOpen ? 'show' : '';
            const ariaExpanded = isOpen ? 'true' : 'false';
            const btnCollapsedClass = isOpen ? '' : 'collapsed';

            card.innerHTML = `
                <div class="card card-employee h-100 ${statusColorClass}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex align-items-center">
                                <img src="${avatarUrl}" alt="${emp.full_name}" class="avatar-circle me-3">
                                <div>
                                    <h5 class="card-title m-0 fw-bold text-dark" style="font-size: 1.1rem;">${emp.full_name}</h5>
                                    <div class="text-muted small">${emp.role}</div>
                                </div>
                            </div>
                            
                            <div class="dropdown">
                                <button class="btn btn-light btn-sm rounded-circle" type="button" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
                                    <li><a class="dropdown-item" href="#" onclick="prepareEdit(${emp.id}, '${emp.full_name}', '${emp.role}', '${emp.start_date}')"><i class="bi bi-pencil me-2 text-primary"></i>Editar</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="deleteEmployee(${emp.id})"><i class="bi bi-trash me-2"></i>Excluir</a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <small class="text-muted"><i class="bi bi-calendar4 me-1"></i>${new Date(emp.start_date).toLocaleDateString('pt-BR')}</small>
                            ${badgeHtml}
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between small text-muted mb-1">
                                <span>Progresso</span>
                                <span class="fw-bold">${progress}%</span>
                            </div>
                            <div class="progress" style="height: 6px; border-radius: 10px; background-color: #e9ecef;">
                                <div class="progress-bar ${progressBarColor}" role="progressbar" style="width: ${progress}%"></div>
                            </div>
                        </div>

                        <button class="btn btn-light border btn-sm w-100 d-flex justify-content-between align-items-center text-muted ${btnCollapsedClass}" 
                                type="button" 
                                onclick="toggleChecklistManual('${collapseId}')"
                                aria-expanded="${ariaExpanded}">
                            <span class="small fw-bold"><i class="bi bi-list-check me-2"></i>Checklist (${completedTasks}/${totalTasks})</span>
                            <i class="bi bi-chevron-down small"></i>
                        </button>

                        <div class="collapse mt-2 ${showClass}" id="${collapseId}">
                            <div class="card card-body bg-light border-0 p-2" style="max-height: 250px; overflow-y: auto;">
                                <ul class="list-group list-group-flush bg-transparent">
                                    ${emp.tasks.map(task => `
                                        <li class="list-group-item task-item d-flex justify-content-between align-items-center px-2 py-2 bg-transparent border-0">
                                            <span class="small ${task.is_completed ? 'task-done-text' : 'text-dark'} text-break pe-2" style="line-height: 1.3;">
                                                ${task.title}
                                            </span>
                                            <button onclick="toggleTask(${task.id})" 
                                                class="btn btn-check-toggle ${task.is_completed ? 'btn-success' : 'btn-white border'}"
                                                title="${task.is_completed ? 'Desmarcar' : 'Concluir'}">
                                                ${task.is_completed ? '<i class="bi bi-check" style="font-size: 1.2rem;"></i>' : ''}
                                            </button>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            listElement.appendChild(card);
        });

    } catch (error) {
        console.error("Erro:", error);
    }
}

// Toast Simples
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

document.getElementById("employeeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = document.getElementById("employeeId").value;
    const data = {
        full_name: document.getElementById("fullName").value,
        role: document.getElementById("role").value,
        start_date: document.getElementById("startDate").value
    };

    const btn = document.getElementById("submitBtn");
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    btn.disabled = true;

    try {
        const headers = { "Content-Type": "application/json", ...AUTH_HEADER };
        let response;

        if (id) {
            response = await fetch(`${API_URL}/employees/${id}`, {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(`${API_URL}/employees/`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
            resetForm();
            loadEmployees();
            Swal.fire({
                icon: 'success',
                title: id ? 'Atualizado!' : 'Cadastrado!',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            throw new Error('Falha na requisição');
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Erro ao salvar.',
        });
        console.error(error);
    } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
});

function prepareEdit(id, name, role, date) {
    document.getElementById("employeeId").value = id;
    document.getElementById("fullName").value = name;
    document.getElementById("role").value = role;
    document.getElementById("startDate").value = date;

    const btn = document.getElementById("submitBtn");
    btn.innerHTML = '<i class="bi bi-check-lg"></i> Salvar';
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-success");

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    document.getElementById("employeeForm").reset();
    document.getElementById("employeeId").value = "";
    
    const btn = document.getElementById("submitBtn");
    btn.innerHTML = '<i class="bi bi-plus-lg"></i>';
    btn.classList.remove("btn-success");
    btn.classList.add("btn-primary");
}

async function toggleTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/toggle`, { 
            method: "PATCH",
            headers: AUTH_HEADER
        });
        
        if (response.ok) {
            loadEmployees(); // Recarrega para atualizar barra
            Toast.fire({
                icon: 'success',
                title: 'Checklist atualizado'
            });
        }
    } catch (error) { console.error(error); }
}

async function deleteEmployee(id) {
    Swal.fire({
        title: 'Tem certeza?',
        text: "O histórico será apagado.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/employees/${id}`, { 
                    method: "DELETE",
                    headers: AUTH_HEADER
                });
                
                if (response.ok) {
                    loadEmployees();
                    Swal.fire('Excluído!', '', 'success');
                }
            } catch (error) { console.error(error); }
        }
    });
}