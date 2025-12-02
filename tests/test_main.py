from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_employee_generates_checklist():
    # 1. Simula o envio de dados (Payload)
    payload = {
        "full_name": "Funcionario Teste",
        "role": "QA Tester",
        "start_date": "2025-01-01"
    }

    # 2. Faz a requisição POST para a API
    response = client.post("/employees/", json=payload)

    # 3. Verifica se criou com sucesso (Status 201)
    assert response.status_code == 201
    
    data = response.json()
    
    # 4. Verifica se os dados voltaram corretos
    assert data["full_name"] == "Funcionario Teste"
    assert "id" in data
    
    # 5. O GRANDE TESTE: Verifica se o Checklist foi criado
    assert len(data["tasks"]) > 0
    
    # Verifica se um item específico do seu checklist novo está lá
    tasks_titles = [t["title"] for t in data["tasks"]]
    assert "Configurar Acesso à VPN" in tasks_titles
    assert "Gerar e Definir Senha Aleatória" in tasks_titles

def test_read_main():
    # Testa se a API está respondendo na raiz (opcional se tiver rota raiz)
    response = client.get("/employees/")
    assert response.status_code == 200