import secrets
import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session
from typing import List
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="OnboardFlow API",
    description="API para gestão de onboarding de colaboradores na Enterprise Corp.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBasic()

def get_current_username(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, "admin")
    correct_password = secrets.compare_digest(credentials.password, "guess123")
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais Incorretas",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# --- REGRA DE NEGÓCIO ---
# Lista padrão de tarefas baseada no checklist real da empresa
DEFAULT_TASKS = [
    "Configurar Acesso ao AD (Active Directory)",
    "Restringir Horário de Acesso",
    "Gerar e Definir Senha Aleatória",
    "Configurar Acesso à VPN",
    "Criar Conta de E-Mail",
    "Configurar Assinatura de E-Mail Padrão",
    "Incluir Usuário nos Grupos de E-Mail",
    "Liberar Acesso ao BPM",
    "Configurar Assinatura Linx",
    "Coletar Termo de Responsabilidade (Equipamento)",
    "Cadastrar Biometria (Porta Principal)",
    "Validar se Perfil foi Configurado e Liberado"
]

def seed_database():
    db = database.SessionLocal()
    
    try:
        if db.query(models.Employee).count() == 0:
            print("🌱 Banco vazio detectado. Criando dados de exemplo...")
            
            # Lista de 3 colaboradores fictícios para quem visitar o site
            demo_data = [
                {"full_name": "Pamela Oliveira", "role": "Gerente de Projetos", "start_date": "2024-11-20"},
                {"full_name": "João Guerra", "role": "Diretor TI", "start_date": "2025-01-15"},
                {"full_name": "Kauã Hiro", "role": "Estágiario TI", "start_date": "2025-02-10"},
            ]
            
            for data in demo_data:
                employee = models.Employee(**data)
                db.add(employee)
                db.commit()
                db.refresh(employee)
                
                for task_title in DEFAULT_TASKS:
                    task = models.OnboardingTask(
                        title=task_title,
                        employee_id=employee.id
                    )
                    db.add(task)
            
            db.commit()
            print("✅ 3 Colaboradores de teste criados com sucesso!")
        else:
            print("ℹ️ Banco de dados já contém registros. Seed pulado.")
            
    except Exception as e:
        print(f"⚠️ Erro ao popular banco: {e}")
    finally:
        db.close()

seed_database()

# --- ENDPOINTS ---

# Rota Protegida (Exige Login)
@app.post("/employees/", response_model=schemas.Employee, status_code=status.HTTP_201_CREATED)
def create_employee(
    employee: schemas.EmployeeCreate, 
    db: Session = Depends(database.get_db),
    username: str = Depends(get_current_username)
):
    db_employee = models.Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    for task_title in DEFAULT_TASKS:
        new_task = models.OnboardingTask(
            title=task_title,
            employee_id=db_employee.id
        )
        db.add(new_task)
    
    db.commit()
    db.refresh(db_employee)
    
    return db_employee

# Rota Pública (Leitura Livre)
@app.get("/employees/", response_model=List[schemas.Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    employees = db.query(models.Employee).offset(skip).limit(limit).all()
    return employees

# Rota Pública (Leitura Livre)
@app.get("/employees/{employee_id}", response_model=schemas.Employee)
def read_employee(employee_id: int, db: Session = Depends(database.get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if employee is None:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    return employee

# Rota Protegida (Exige Login)
@app.put("/employees/{employee_id}", response_model=schemas.Employee)
def update_employee(
    employee_id: int, 
    employee: schemas.EmployeeUpdate, 
    db: Session = Depends(database.get_db),
    username: str = Depends(get_current_username) # <--- CADEADO
):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    
    if not db_employee:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    
    db_employee.full_name = employee.full_name
    db_employee.role = employee.role
    db_employee.start_date = employee.start_date
    
    db.commit()
    db.refresh(db_employee)
    return db_employee

# Rota Protegida (Exige Login)
@app.delete("/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int, 
    db: Session = Depends(database.get_db),
    username: str = Depends(get_current_username) # <--- CADEADO
):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    
    db.delete(employee)
    db.commit()
    return None

# Rota Protegida (Exige Login para marcar tarefa)
@app.patch("/tasks/{task_id}/toggle", response_model=schemas.Task)
def toggle_task_status(
    task_id: int, 
    db: Session = Depends(database.get_db),
    username: str = Depends(get_current_username) # <--- CADEADO
):
    task = db.query(models.OnboardingTask).filter(models.OnboardingTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    task.is_completed = not task.is_completed
    db.commit()
    db.refresh(task)
    return task

if os.path.exists("frontend"):
    app.mount("/", StaticFiles(directory="frontend", html=True), name="static")