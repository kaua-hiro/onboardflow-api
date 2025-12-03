from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    is_completed: bool = False

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    employee_id: int

    model_config = ConfigDict(from_attributes=True)
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

    model_config = ConfigDict(from_attributes=True)
