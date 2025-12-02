# 🚀 OnboardFlow

> Sistema fullstack para gestão automatizada de onboarding de colaboradores e provisionamento de acessos de TI

![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![JavaScript](https://img.shields.io/badge/Frontend-VanillaJS%20%2B%20Bootstrap-yellow)
![Docker](https://img.shields.io/badge/Infra-Docker-blue)

## 📖 Sobre o Projeto

O **OnboardFlow** resolve a fragmentação e falta de padronização no processo de entrada de novos funcionários. Diferente de planilhas soltas e processos manuais, o sistema centraliza o cadastro de colaboradores e gera automaticamente um **checklist padronizado de tarefas de infraestrutura** (configuração de VPN, criação de e-mail, provisionamento no Active Directory, etc.), permitindo que o time de TI acompanhe o progresso de cada onboarding em tempo real.

### Principais Benefícios

- **Centralização:** Todas as informações de onboarding em um único lugar
- **Padronização:** Garante que nenhuma etapa crítica seja esquecida
- **Visibilidade:** Acompanhamento em tempo real do status de cada colaborador
- **Eficiência:** Reduz o tempo de provisionamento e elimina retrabalho

## ✨ Funcionalidades

- **Gestão de Colaboradores:** CRUD completo com cadastro, edição, visualização e remoção
- **Automação de Checklist:** Geração automática de tarefas padrão ao criar um novo usuário
- **Dashboard Interativo:** Interface SPA com barras de progresso e indicadores visuais dinâmicos
- **Gestão de Tarefas:** Marque tarefas como concluídas e acompanhe o progresso percentual
- **Integridade de Dados:** Cascade delete garante que ao remover um colaborador, suas tarefas associadas sejam limpas automaticamente
- **API RESTful:** Documentação automática com Swagger/OpenAPI

## 🛠 Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy (ORM), Pydantic |
| **Frontend** | HTML5, JavaScript (ES6+), Bootstrap 5, Fetch API |
| **Banco de Dados** | SQLite (Desenvolvimento) / SQL Server (Produção) |
| **Infraestrutura** | Docker, Docker Compose |
| **Documentação** | Swagger UI (automática via FastAPI) |

## 🚀 Como Rodar o Projeto

### Opção 1: Via Docker (Recomendado)

Se você tem Docker e Docker Compose instalados:
```bash
# Clone o repositório
git clone https://github.com/kaua-hiro/onboardflow-api.git
cd onboardflow-api

# Execute o ambiente completo
docker compose up --build
```

O sistema estará disponível em: `http://localhost:8000`

Para parar os containers:
```bash
docker compose down
```

### Opção 2: Instalação Manual (Python)

**Pré-requisitos:**
- Python 3.11 ou superior
- pip (gerenciador de pacotes Python)

**Passos:**

1. **Clone o repositório:**
```bash
git clone https://github.com/kaua-hiro/onboardflow-api.git
cd onboardflow-api
```

2. **Crie e ative o ambiente virtual:**
```bash
# Criar ambiente virtual
python -m venv venv

# Ativar no Windows:
.\venv\Scripts\activate

# Ativar no Linux/Mac:
source venv/bin/activate
```

3. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

4. **Execute a API:**
```bash
uvicorn app.main:app --reload
```

5. **Acesse o sistema:**
- Interface principal: Abra `frontend/index.html` no navegador
- Documentação da API: `http://localhost:8000/docs`

## 📂 Estrutura do Projeto
```
onboardflow-api/
├── app/                      # Núcleo da aplicação backend
│   ├── __init__.py
│   ├── main.py              # Rotas da API e lógica principal
│   ├── models.py            # Modelos do banco de dados (SQLAlchemy)
│   ├── schemas.py           # Schemas de validação (Pydantic)
│   └── database.py          # Configuração da conexão com banco
├── frontend/                 # Interface do usuário
│   ├── index.html           # SPA principal com Bootstrap
│   └── script.js            # Lógica de integração com a API
├── requirements.txt         # Dependências Python
├── Dockerfile               # Imagem Docker da aplicação
├── docker-compose.yml       # Orquestração dos serviços
├── .gitignore
└── README.md
```

## 🔌 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/usuarios/` | Lista todos os colaboradores |
| `POST` | `/usuarios/` | Cria novo colaborador (gera checklist automático) |
| `GET` | `/usuarios/{id}` | Detalhes de um colaborador específico |
| `PUT` | `/usuarios/{id}` | Atualiza dados do colaborador |
| `DELETE` | `/usuarios/{id}` | Remove colaborador e suas tarefas |
| `GET` | `/tarefas/{usuario_id}` | Lista tarefas de um colaborador |
| `PATCH` | `/tarefas/{id}/concluir` | Marca tarefa como concluída |

Acesse a documentação interativa completa em: `http://localhost:8000/docs`

## 🎯 Roadmap de Melhorias

- [ ] Autenticação e controle de acesso (JWT)
- [ ] Notificações por e-mail sobre tarefas pendentes
- [ ] Integração com Active Directory para provisionamento automático
- [ ] Dashboard de métricas e relatórios
- [ ] Logs de auditoria de ações
- [ ] Testes automatizados (pytest)
- [ ] Deploy em nuvem (AWS/Azure)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👤 Autor

Desenvolvido por **Kauã Hiro**

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!