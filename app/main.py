from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, database

# Cria as tabelas no banco ao iniciar
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="OnboardFlow API",
    description="API para gestão de onboarding de colaboradores na Enterprise Corp.",
    version="1.0.0"
)

# Lista padrão de tarefas para todo novo funcionário (Regra de Negócio)
DEFAULT_TASKS = [
    "Criar conta de E-mail Corporativo",
    "Adicionar ao grupo do Teams",
    "Configurar acesso à VPN",
    "Solicitar crachá de acesso",
    "Agendar reunião de boas-vindas"
]

# --- Endpoints ---

@app.post("/employees/", response_model=schemas.Employee, status_code=status.HTTP_201_CREATED)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(database.get_db)):
    # 1. Cria o funcionário
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    # 2. Gera automaticamente o checklist padrão
    for task_title in DEFAULT_TASKS:
        new_task = models.OnboardingTask(
            title=task_title,
            employee_id=db_employee.id
        )
        db.add(new_task)
    
    db.commit()
    db.refresh(db_employee)
    
    return db_employee

@app.get("/employees/", response_model=List[schemas.Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    employees = db.query(models.Employee).offset(skip).limit(limit).all()
    return employees

@app.get("/employees/{employee_id}", response_model=schemas.Employee)
def read_employee(employee_id: int, db: Session = Depends(database.get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if employee is None:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    return employee

@app.patch("/tasks/{task_id}/toggle", response_model=schemas.Task)
def toggle_task_status(task_id: int, db: Session = Depends(database.get_db)):
    task = db.query(models.OnboardingTask).filter(models.OnboardingTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    # Inverte o status atual
    task.is_completed = not task.is_completed
    db.commit()
    db.refresh(task)
    return task