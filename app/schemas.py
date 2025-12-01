from pydantic import BaseModel
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

    class Config:
        from_attributes = True # Antigo orm_mode

# --- Schemas de Funcionários ---
class EmployeeBase(BaseModel):
    full_name: str
    role: str
    start_date: str

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    created_at: datetime | None = None
    tasks: List[Task] = []

    class Config:
        from_attributes = True