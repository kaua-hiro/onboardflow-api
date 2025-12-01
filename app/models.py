from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    role = Column(String)
    start_date = Column(String)  # Pode ser Date, mas String simplifica MVP
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relacionamento: Um funcionário tem várias tarefas
    tasks = relationship("OnboardingTask", back_populates="employee")

class OnboardingTask(Base):
    __tablename__ = "onboarding_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    is_completed = Column(Boolean, default=False)
    employee_id = Column(Integer, ForeignKey("employees.id"))

    # Relacionamento reverso
    employee = relationship("Employee", back_populates="tasks")