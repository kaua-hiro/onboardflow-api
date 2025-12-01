# 🚀 OnboardFlow API

> Uma API REST eficiente para automatizar e gerenciar o processo de onboarding de novos colaboradores em ambientes corporativos.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy-red)

## 📖 Sobre o Projeto

O **OnboardFlow** resolve a fragmentação do processo de entrada de funcionários. Ao registrar um novo colaborador, o sistema gera automaticamente um **checklist de acesso padronizado** (E-mail, VPN, Teams), garantindo que nenhuma etapa crítica de TI seja esquecida.

Este projeto foi desenvolvido com foco em performance, escalabilidade e boas práticas de arquitetura de software.

## ✨ Funcionalidades (MVP)

- **Gestão de Colaboradores:** Cadastro contendo nome, cargo e data de início.
- **Automação de Checklist:** Geração automática de tarefas de infraestrutura (VPN, E-mail, etc.) no momento do cadastro.
- **Controle de Status:** Atualização dinâmica do status das tarefas (Pendente/Concluído).
- **Banco de Dados Agnóstico:** Configurado para SQLite (Dev) mas compatível com SQL Server (Prod) via variáveis de ambiente.

## 🛠 Tech Stack

- **Linguagem:** Python 3.10+
- **Framework Web:** FastAPI
- **ORM:** SQLAlchemy
- **Serialização:** Pydantic
- **Gerenciamento de Configuração:** python-dotenv

## 🚀 Como Rodar Localmente

### 1. Clone o repositório
```bash
git clone [https://github.com/seu-usuario/onboardflow-api.git](https://github.com/seu-usuario/onboardflow-api.git)
cd onboardflow-api