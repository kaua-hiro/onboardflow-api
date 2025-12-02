const API_URL = "http://127.0.0.1:8000";

// Credenciais
const USER = "admin";
const PASS = "guess123";
const AUTH_HEADER = { 
    "Authorization": "Basic " + btoa(USER + ":" + PASS) 
};

// Variável para armazenar os dados e evitar refetch no resize
let allEmployees = [];

document.addEventListener("DOMContentLoaded", () => {
    loadEmployees();
});

// Listener de Resize com Debounce (para ajustar colunas se redimensionar a janela)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        renderColumns(); // Re-desenha as colunas mantendo os dados
    }, 200);
});

// Listener apenas para ícones (seta para cima/baixo)
document.addEventListener('shown.bs.collapse', e => updateIcon(e.target.id, true));
document.addEventListener('hidden.bs.collapse', e => updateIcon(e.target.id, false));

function updateIcon(collapseId, isOpen) {
    const btn = document.querySelector(`button[data-bs-target="#${collapseId}"]`);
    if (btn) {
        const icon = btn.querySelector('i.bi-chevron-down, i.bi-chevron-up');
        if (icon) {
            icon.className = isOpen ? 'bi bi-chevron-up small' : 'bi bi-chevron-down small';
        }
        if (isOpen) btn.classList.remove('text-muted');
        else btn.classList.add('text-muted');
    }
}

async function loadEmployees() {
    const listElement = document.getElementById("employeesList");
    
    if (!listElement.innerHTML.trim()) {
        listElement.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Carregando equipe...</p></div>';
    }

    try {
        const response = await fetch(`${API_URL}/employees/`);
        allEmployees = await response.json(); // Salva na memória global
        
        // Inverte para os mais recentes primeiro
        allEmployees.reverse();

        renderColumns(); // Chama a função que desenha as colunas

    } catch (error) {
        console.error("Erro:", error);
        listElement.innerHTML = '<div class="col-12 text-center text-danger mt-5">Erro ao carregar dados.</div>';
    }
}

function renderColumns() {
    const listElement = document.getElementById("employeesList");
    listElement.innerHTML = "";

    if (allEmployees.length === 0) {
        listElement.innerHTML = '<div class="col-12 text-center text-muted mt-5"><h4>Nenhum colaborador encontrado</h4><p>Cadastre o primeiro acima 🚀</p></div>';
        return;
    }

    // 1. Detecta quantas colunas cabem na tela
    const width = window.innerWidth;
    let numCols = 1;
    if (width >= 992) numCols = 3;      // PC Grande
    else if (width >= 768) numCols = 2; // Tablet

    // 2. Cria os "Baldes" (divs das colunas)
    const columnWrappers = [];
    for (let i = 0; i < numCols; i++) {
        const col = document.createElement("div");
        // Bootstrap: se são 3 colunas, cada uma ocupa 4 espaços (col-4). Se 2, col-6.
        const colClass = numCols === 3 ? "col-lg-4" : (numCols === 2 ? "col-md-6" : "col-12");
        col.className = `${colClass} d-flex flex-column gap-4`; // gap-4 dá o espaço vertical entre os cards
        listElement.appendChild(col);
        columnWrappers.push(col);
    }

    // 3. Snapshot do que está aberto (para manter estado)
    const currentlyOpenIds = new Set();
    document.querySelectorAll('.collapse.show').forEach(el => currentlyOpenIds.add(el.id));

    // 4. Distribui as cartas nos baldes (Estilo Baralho: 1 pra vc, 1 pra mim...)
    allEmployees.forEach((emp, index) => {
        const cardHTML = createCardHTML(emp, currentlyOpenIds);
        
        // Cria um wrapper temporário para converter string em elemento DOM
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHTML;
        const cardElement = tempDiv.firstElementChild;

        // Adiciona na coluna correta (Matemática: resto da divisão)
        // Card 0 -> Col 0, Card 1 -> Col 1, Card 2 -> Col 2, Card 3 -> Col 0...
        columnWrappers[index % numCols].appendChild(cardElement);
    });
}

function createCardHTML(emp, openIds) {
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

    const isOpen = openIds.has(collapseId);
    const showClass = isOpen ? 'show' : '';
    const ariaExpanded = isOpen ? 'true' : 'false';
    const btnCollapsedClass = isOpen ? '' : 'collapsed';
    const chevronIcon = isOpen ? 'bi-chevron-up' : 'bi-chevron-down';

    // Nota: Removi as classes de coluna (col-md-6) daqui porque agora quem define a largura é o "Balde" pai
    return `
        <div class="card card-employee ${statusColorClass}">
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
                        data-bs-toggle="collapse" 
                        data-bs-target="#${collapseId}"
                        aria-expanded="${ariaExpanded}"
                        aria-controls="${collapseId}">
                    <span class="small fw-bold"><i class="bi bi-list-check me-2"></i>Checklist (${completedTasks}/${totalTasks})</span>
                    <i class="bi ${chevronIcon} small"></i>
                </button>

                <div class="collapse ${showClass}" id="${collapseId}">
                    <div class="card card-body bg-light border-0 p-2 mt-3" style="max-height: 250px; overflow-y: auto;">
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
}

// Toast
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
});

// Submit Form
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
            response = await fetch(`${API_URL}/employees/${id}`, { method: "PUT", headers: headers, body: JSON.stringify(data) });
        } else {
            response = await fetch(`${API_URL}/employees/`, { method: "POST", headers: headers, body: JSON.stringify(data) });
        }

        if (response.ok) {
            resetForm();
            loadEmployees(); // Recarrega tudo
            Swal.fire({ icon: 'success', title: id ? 'Atualizado!' : 'Cadastrado!', timer: 2000, showConfirmButton: false });
        } else { throw new Error('Falha'); }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'Erro ao salvar.' });
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
            loadEmployees();
        }
    } catch (error) { console.error(error); }
}

async function deleteEmployee(id) {
    Swal.fire({
        title: 'Tem certeza?', text: "O histórico será apagado.", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sim, excluir!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/employees/${id}`, { method: "DELETE", headers: AUTH_HEADER });
                if (response.ok) {
                    loadEmployees();
                    Swal.fire('Excluído!', '', 'success');
                }
            } catch (error) { console.error(error); }
        }
    });
}