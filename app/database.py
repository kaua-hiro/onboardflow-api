import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env
load_dotenv()

# Pega a URL do banco ou usa SQLite como fallback padrão
# Para SQL Server use: mssql+pyodbc://user:pass@server/db?driver=ODBC+Driver+17+for+SQL+Server
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///C:/Temp/onboardflow.db")

check_same_thread = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=check_same_thread
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependência para injetar a sessão do banco nas rotas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    