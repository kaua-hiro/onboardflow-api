# 🚀 OnboardFlow API

> Sistema de gestão de onboarding para departamentos de TI, focado na automação de checklists de acesso e provisionamento

![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![Deploy](https://img.shields.io/badge/Deploy-Render-success)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌐 Demo Online

O projeto está rodando ao vivo no Render.

**🔗 Link:** [https://onboardflow-api-nqe1.onrender.com](https://onboardflow-api-nqe1.onrender.com)

**Credenciais de Acesso (Modo Visitante):**
- **Usuário:** `admin`
- **Senha:** `guess123`

> ⚠️ **Nota:** Como é um ambiente de demonstração gratuito, o banco de dados reseta automaticamente após períodos de inatividade.

## 📖 Sobre o Projeto

O **OnboardFlow** resolve a fragmentação e falta de padronização no processo de entrada de novos funcionários. O sistema centraliza o cadastro de colaboradores e gera automaticamente um checklist padronizado com 12 tarefas de infraestrutura (VPN, Active Directory, E-mail, etc.), permitindo que o time de TI acompanhe o progresso de cada onboarding em tempo real.

## ✨ Funcionalidades

- **CRUD Completo de Colaboradores:** Cadastro, edição e remoção com proteção lógica
- **Automação de Checklist:** Ao criar um funcionário, 12 tarefas de segurança são geradas automaticamente (VPN, AD, Email, etc.)
- **Gestão Visual de Tarefas:** Marque/desmarque itens com atualização de barra de progresso em tempo real
- **Layout Responsivo Inteligente:**
  - 🖥️ **Desktop:** 3 Colunas
  - 📱 **Tablet:** 2 Colunas
  - 📱 **Mobile:** 1 Coluna
  - **Lógica Masonry:** Os cards se organizam verticalmente preenchendo espaços vazios ("efeito Pinterest")
- **Segurança Básica:** Autenticação HTTP Basic Auth para operações de escrita (POST, PUT, DELETE)
- **Avatares Automáticos:** Geração dinâmica de avatares com iniciais dos colaboradores
- **Feedback Visual:** Toasts e alertas com SweetAlert2

## 💻 Tecnologias Utilizadas

### Backend
- **Python 3.11+** (Compatível com 3.14 Alpha)
- **FastAPI:** Framework moderno e de alta performance
- **SQLAlchemy:** ORM para manipulação de banco de dados
- **Pydantic V2:** Validação de dados robusta
- **SQLite:** Banco de dados local (preparado para migração p/ SQL Server/PostgreSQL)

### Frontend
- **Vanilla JavaScript:** Lógica pura, sem frameworks pesados, garantindo leveza
- **Bootstrap 5:** Sistema de Grid e Componentes (Modais, Toasts, Accordions)
- **SweetAlert2:** Alertas e confirmações visuais
- **UI Avatars:** Geração automática de avatares com as iniciais

### Infraestrutura & Deploy
- **Docker:** Containerização da aplicação completa
- **Render:** Hospedagem em nuvem (PaaS) via Docker
- **Uvicorn:** Servidor ASGI para produção

## 📂 Estrutura do Projeto
```
onboardflow-api/
├── app/
│   ├── main.py          # Entrypoint, Rotas e Config de Arquivos Estáticos
│   ├── models.py        # Tabelas do Banco (SQLAlchemy)
│   ├── schemas.py       # Validação de Dados (Pydantic)
│   └── database.py      # Conexão com Banco (SQLite/SQL Server)
├── frontend/
│   ├── index.html       # Interface Única (SPA)
│   └── script.js        # Lógica de Renderização, Fetch API e Masonry
├── tests/
│   └── test_main.py     # Testes de Integração (Pytest)
├── Dockerfile           # Receita da Imagem Docker
├── requirements.txt     # Dependências do Python
├── .gitignore
└── README.md
```

## 🚀 Como Rodar Localmente

### Opção 1: Com Docker (Recomendado)

Se tiver o Docker instalado, é o jeito mais fácil:
```bash
# Clone o repositório
git clone https://github.com/kaua-hiro/onboardflow-api.git
cd onboardflow-api

# Construa e execute o container
docker build -t onboardflow .
docker run -p 8000:8000 onboardflow
```

Acesse: `http://localhost:8000`

### Opção 2: Manualmente (Python)

**Pré-requisitos:**
- Python 3.11 ou superior
- pip (gerenciador de pacotes Python)

**Passos:**

1. **Crie um ambiente virtual:**
```bash
python -m venv venv

# Windows:
venv\Scripts\activate

# Linux/Mac:
source venv/bin/activate
```

2. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

3. **Rode o servidor:**
```bash
uvicorn app.main:app --reload
```

4. **Acesse:** `http://127.0.0.1:8000`

## 🔌 Endpoints da API

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/usuarios/` | Lista todos os colaboradores | Não |
| `POST` | `/usuarios/` | Cria novo colaborador (gera checklist automático) | Sim |
| `GET` | `/usuarios/{id}` | Detalhes de um colaborador específico | Não |
| `PUT` | `/usuarios/{id}` | Atualiza dados do colaborador | Sim |
| `DELETE` | `/usuarios/{id}` | Remove colaborador e suas tarefas | Sim |
| `GET` | `/tarefas/{usuario_id}` | Lista tarefas de um colaborador | Não |
| `PATCH` | `/tarefas/{id}/concluir` | Marca/desmarca tarefa como concluída | Não |

Acesse a documentação interativa completa em: `http://localhost:8000/docs`

## 🧪 Rodando Testes

O projeto possui testes automatizados para garantir que a regra de negócio (criação de checklist automático) funcione corretamente.
```bash
pytest
```

## 🔮 Roadmap (Próximos Passos)

- [ ] **Segurança Profissional:** Migrar senhas hardcoded para variáveis de ambiente (.env)
- [ ] **Autenticação JWT:** Substituir Basic Auth por Token JWT e tela de login real
- [ ] **Banco de Dados Persistente:** Conectar ao PostgreSQL ou SQL Server em produção
- [ ] **Logs Estruturados:** Implementar sistema de logs para auditoria
- [ ] **Notificações por E-mail:** Alertas sobre tarefas pendentes
- [ ] **Integração com Active Directory:** Provisionamento automático de contas
- [ ] **Dashboard de Métricas:** Relatórios de tempo médio de onboarding
- [ ] **Testes E2E:** Cobertura completa com Pytest

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido por **Kauã Hiro**  
Estagiário de TI & Desenvolvedor Python

---

⭐ **Projeto desenvolvido para fins de estudo e portfólio.**  
Se este projeto foi útil para você, considere dar uma estrela no repositório!
