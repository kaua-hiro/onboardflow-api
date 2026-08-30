const API_URL = "";

// Credenciais
const USER = "admin";
const PASS = "guess123";
const AUTH_HEADER = { 
    "Authorization": "Basic " + btoa(USER + ":" + PASS) 
};

let allEmployees = [];
let searchTerm = "";
let statusFilter = "all";

const AVATAR_PALETTE = [
    { bg: "#232752", fg: "#F4E3C2" },
    { bg: "#C08A2E", fg: "#14172E" },
    { bg: "#2F7A4F", fg: "#DCEEE1" },
    { bg: "#8A5A3A", fg: "#F6F5F1" },
    { bg: "#565873", fg: "#F6F5F1" },
];

function getInitials(fullName) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColors(fullName) {
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
        hash = (hash + fullName.charCodeAt(i)) % AVATAR_PALETTE.length;
    }
    return AVATAR_PALETTE[hash];
}

function announce(message) {
    const liveRegion = document.getElementById("liveRegion");
    if (liveRegion) liveRegion.textContent = message;
}

document.addEventListener("DOMContentLoaded", () => {
    loadEmployees();

    const searchInput = document.getElementById("searchInput");
    const statusFilterSelect = document.getElementById("statusFilter");
    const exportBtn = document.getElementById("exportCsvBtn");

    let searchDebounce;
    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            searchTerm = e.target.value;
            renderColumns();
        }, 200);
    });

    statusFilterSelect.addEventListener("change", (e) => {
        statusFilter = e.target.value;
        renderColumns();
    });

    exportBtn.addEventListener("click", exportEmployeesCsv);
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        renderColumns();
    }, 200);
});

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

function formatDate(dateString) {
    if (!dateString) return "";
    const parts = dateString.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getEmployeeStatus(emp) {
    const total = emp.tasks.length;
    const done = emp.tasks.filter(t => t.is_completed).length;
    if (total > 0 && done === total) return "done";
    if (done > 0) return "progress";
    return "todo";
}

function getEmployeeProgress(emp) {
    const total = emp.tasks.length;
    if (total === 0) return 0;
    const done = emp.tasks.filter(t => t.is_completed).length;
    return Math.round((done / total) * 100);
}

function renderStats() {
    const statsBar = document.getElementById("statsBar");
    if (!statsBar) return;

    if (allEmployees.length === 0) {
        statsBar.innerHTML = "";
        return;
    }

    const total = allEmployees.length;
    const todo = allEmployees.filter(e => getEmployeeStatus(e) === "todo").length;
    const progress = allEmployees.filter(e => getEmployeeStatus(e) === "progress").length;
    const done = allEmployees.filter(e => getEmployeeStatus(e) === "done").length;
    const avgProgress = Math.round(
        allEmployees.reduce((sum, e) => sum + getEmployeeProgress(e), 0) / total
    );

    statsBar.innerHTML = `
        <div class="stat-tile">
            <div class="stat-tile__icon is-total"><i class="bi bi-people-fill"></i></div>
            <div><div class="stat-tile__label">Colaboradores</div><div class="stat-tile__value">${total}</div></div>
        </div>
        <div class="stat-tile">
            <div class="stat-tile__icon is-wait"><i class="bi bi-hourglass-split"></i></div>
            <div><div class="stat-tile__label">A Iniciar</div><div class="stat-tile__value">${todo}</div></div>
        </div>
        <div class="stat-tile">
            <div class="stat-tile__icon is-progress"><i class="bi bi-arrow-repeat"></i></div>
            <div><div class="stat-tile__label">Em Andamento</div><div class="stat-tile__value">${progress}</div></div>
        </div>
        <div class="stat-tile">
            <div class="stat-tile__icon is-done"><i class="bi bi-check-circle-fill"></i></div>
            <div><div class="stat-tile__label">Progresso Médio</div><div class="stat-tile__value">${avgProgress}%</div></div>
        </div>
    `;
}

function getFilteredEmployees() {
    const term = searchTerm.trim().toLowerCase();
    return allEmployees.filter(emp => {
        const matchesTerm = !term
            || emp.full_name.toLowerCase().includes(term)
            || emp.role.toLowerCase().includes(term);
        const matchesStatus = statusFilter === "all" || getEmployeeStatus(emp) === statusFilter;
        return matchesTerm && matchesStatus;
    });
}

function exportEmployeesCsv() {
    const rows = getFilteredEmployees();
    if (rows.length === 0) {
        Swal.fire({ icon: 'info', title: 'Nada para exportar', text: 'Ajuste os filtros ou cadastre colaboradores.', customClass: SWAL_CLASSES });
        return;
    }
    const statusLabel = { todo: "A Iniciar", progress: "Em Andamento", done: "Concluído" };
    const header = ["Nome", "Cargo", "Início", "Status", "Progresso"];
    const csvRows = rows.map(emp => [
        emp.full_name,
        emp.role,
        formatDate(emp.start_date),
        statusLabel[getEmployeeStatus(emp)],
        `${getEmployeeProgress(emp)}%`,
    ]);
    const csvContent = [header, ...csvRows]
        .map(row => row.map(field => `"${String(field ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `onboardflow-colaboradores-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    announce("Exportação concluída.");
}

async function loadEmployees() {
    const listElement = document.getElementById("employeesList");
    
    if (!listElement.innerHTML.trim()) {
        listElement.innerHTML = Array.from({ length: 3 }).map(() => `
            <div class="col-lg-4 col-md-6 col-12">
                <div class="skeleton-card">
                    <div class="skeleton-line" style="width: 60%; margin-bottom: .75rem;"></div>
                    <div class="skeleton-line" style="width: 40%; margin-bottom: 1.5rem;"></div>
                    <div class="skeleton-line" style="width: 100%; margin-bottom: .5rem;"></div>
                    <div class="skeleton-line" style="width: 100%;"></div>
                </div>
            </div>
        `).join("");
    }

    try {
        const response = await fetch(`${API_URL}/employees/`);
        allEmployees = await response.json();
        allEmployees.reverse();

        renderStats();
        renderColumns();
        announce("Lista de colaboradores atualizada.");

    } catch (error) {
        console.error("Erro:", error);
        listElement.innerHTML = '<div class="col-12"><div class="empty-state"><h4>Não foi possível carregar a equipe</h4><p>Verifique sua conexão e tente novamente.</p></div></div>';
    }
}

function renderColumns() {
    const currentlyOpenIds = new Set();
    const scrollPositions = new Map(); // Mapa para guardar onde o scroll estava

    document.querySelectorAll('.collapse.show').forEach(el => {
        currentlyOpenIds.add(el.id);
        const scrollableDiv = el.querySelector('div[style*="overflow-y: auto"]');
        if (scrollableDiv) {
            scrollPositions.set(el.id, scrollableDiv.scrollTop); 
        }
    });

    const listElement = document.getElementById("employeesList");
    listElement.innerHTML = "";

    if (allEmployees.length === 0) {
        listElement.innerHTML = '<div class="col-12"><div class="empty-state"><h4>Nenhum dossiê aberto ainda</h4><p>Cadastre o primeiro colaborador no formulário acima para começar o provisionamento.</p></div></div>';
        return;
    }

    const filteredEmployees = getFilteredEmployees();

    if (filteredEmployees.length === 0) {
        listElement.innerHTML = '<div class="col-12"><div class="empty-state"><h4>Nenhum colaborador encontrado</h4><p>Ajuste a busca ou o filtro de status.</p></div></div>';
        return;
    }

    const width = window.innerWidth;
    let numCols = 1;
    if (width >= 992) numCols = 3;
    else if (width >= 768) numCols = 2;

    const columnWrappers = [];
    for (let i = 0; i < numCols; i++) {
        const col = document.createElement("div");
        const colClass = numCols === 3 ? "col-lg-4" : (numCols === 2 ? "col-md-6" : "col-12");
        col.className = `${colClass} d-flex flex-column gap-4`;
        listElement.appendChild(col);
        columnWrappers.push(col);
    }

    filteredEmployees.forEach((emp, index) => {
        const cardHTML = createCardHTML(emp, currentlyOpenIds);
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHTML;
        const cardElement = tempDiv.firstElementChild;

        columnWrappers[index % numCols].appendChild(cardElement);
    });

    setTimeout(() => {
        scrollPositions.forEach((scrollTop, id) => {
            const el = document.getElementById(id);
            if (el) {
                const scrollableDiv = el.querySelector('div[style*="overflow-y: auto"]');
                if (scrollableDiv) {
                    scrollableDiv.scrollTop = scrollTop;
                }
            }
        });
    }, 0);
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
    const avatarColors = getAvatarColors(emp.full_name);
    const avatarInitials = getInitials(emp.full_name);

    const isOpen = openIds.has(collapseId);
    const showClass = isOpen ? 'show' : '';
    const ariaExpanded = isOpen ? 'true' : 'false';
    const btnCollapsedClass = isOpen ? '' : 'collapsed';
    const chevronIcon = isOpen ? 'bi-chevron-up' : 'bi-chevron-down';

    const formattedDate = formatDate(emp.start_date);

    return `
        <div class="card card-employee ${statusColorClass}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="d-flex align-items-center">
                        <div class="avatar-badge me-3" style="background: ${avatarColors.bg}; color: ${avatarColors.fg};" aria-hidden="true">${avatarInitials}</div>
                        <div>
                            <h5 class="card-title m-0 fw-bold text-dark" style="font-size: 1.1rem;">${emp.full_name}</h5>
                            <div class="text-muted small">${emp.role}</div>
                        </div>
                    </div>

                    <div class="dropdown">
                        <button class="btn btn-light btn-sm rounded-circle" type="button" data-bs-toggle="dropdown" aria-label="Mais ações para ${emp.full_name}">
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
                    <small class="text-muted"><i class="bi bi-calendar4 me-1"></i>${formattedDate}</small>
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

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: { popup: 'onboard-toast' }
});

const SWAL_CLASSES = {
    popup: 'onboard-swal',
    confirmButton: 'onboard-swal-confirm',
    denyButton: 'onboard-swal-deny',
    cancelButton: 'onboard-swal-cancel'
};

function validateForm() {
    const fields = [
        document.getElementById("fullName"),
        document.getElementById("role"),
        document.getElementById("startDate"),
    ];
    let firstInvalid = null;
    fields.forEach((field) => {
        const valid = field.value.trim() !== "";
        field.classList.toggle("is-invalid", !valid);
        if (!valid && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
}

[document.getElementById("fullName"), document.getElementById("role"), document.getElementById("startDate")].forEach((field) => {
    field.addEventListener("input", () => {
        if (field.value.trim() !== "") field.classList.remove("is-invalid");
    });
});

document.getElementById("employeeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
            loadEmployees();
            announce(id ? "Colaborador atualizado." : "Colaborador cadastrado.");
            Swal.fire({ icon: 'success', title: id ? 'Atualizado!' : 'Cadastrado!', timer: 2000, showConfirmButton: false, customClass: SWAL_CLASSES });
        } else { throw new Error('Falha'); }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Não foi possível salvar', text: 'Confira os dados e tente novamente.', customClass: SWAL_CLASSES });
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
    ["fullName", "role", "startDate"].forEach((id) => document.getElementById(id).classList.remove("is-invalid"));
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
            announce("Progresso atualizado.");
        }
    } catch (error) { console.error(error); }
}

async function deleteEmployee(id) {
    Swal.fire({
        title: 'Excluir este colaborador?', text: "O histórico de provisionamento será apagado.", icon: 'warning',
        showCancelButton: true, confirmButtonText: 'Excluir', cancelButtonText: 'Cancelar',
        customClass: { ...SWAL_CLASSES, confirmButton: 'onboard-swal-deny' }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/employees/${id}`, { method: "DELETE", headers: AUTH_HEADER });
                if (response.ok) {
                    loadEmployees();
                    announce("Colaborador excluído.");
                    Swal.fire({ title: 'Excluído', icon: 'success', timer: 1800, showConfirmButton: false, customClass: SWAL_CLASSES });
                }
            } catch (error) { console.error(error); }
        }
    });
}