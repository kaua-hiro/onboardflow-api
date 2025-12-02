from pydantic import BaseModel, ConfigDict # <--- Import novo
from typing import List, Optional
from datetime import datetime

# --- Schemas de Tarefas ---
class TaskBase(BaseModel):
    title: str
    is_completed: bool = False

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    employee_id: int

    # Nova sintaxe do Pydantic V2 (Substitui a class Config)
    model_config = ConfigDict(from_attributes=True)

# --- Schemas de Funcionários ---
class EmployeeBase(BaseModel):
    full_name: str
    role: str
    start_date: str

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    full_name: str
    role: str
    start_date: str

class Employee(EmployeeBase):
    id: int
    created_at: datetime | None = None
    tasks: List[Task] = []

    # Nova sintaxe do Pydantic V2
    model_config = ConfigDict(from_attributes=True)