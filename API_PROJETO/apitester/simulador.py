import requests
import json
import time
import random

# --- CONFIGURAÇÕES ---
# Conectando diretamente à sua API local
API_URL = "http://localhost:5015/api/leituras"

# ID do sensor foi movido para dentro da função para que mude a cada envio
# SENSOR_ID = random.randint(1, 3) # <<< LINHA REMOVIDA DAQUI

# Intervalo entre os envios em segundos
INTERVALO_SEGUNDOS = .1

def enviar_leitura_simulada():
    """
    Gera dados de leitura aleatórios e os envia para a API.
    """
    try:
        # 1. Gerar dados simulados
        
        # V-- ALTERAÇÃO APLICADA AQUI --V
        # Gera um novo ID de sensor a cada chamada da função
        sensor_id = random.randint(1, 3)
        # A-- ALTERAÇÃO APLICADA AQUI --A
        
        voltagem_simulada = random.uniform(12.2, 12.8)
        temperatura_simulada = random.uniform(25.0, 40.0)
        resistencia_interna_simulada = random.uniform(0.010, 0.025)
        condutancia_simulada = 1.0 / resistencia_interna_simulada if resistencia_interna_simulada > 0 else 0
        desvio_simulado = 0.05

        # 2. Montar o payload (corpo da requisição)
        payload = {
            "sensorId": sensor_id, # <<< USA A VARIÁVEL LOCAL GERADA ACIMA
            "voltagem": round(voltagem_simulada, 2),
            "resistenciaInterna": round(resistencia_interna_simulada, 4),
            "temperatura": round(temperatura_simulada, 1),
            "condutancia": round(condutancia_simulada, 2),
            "desvio": desvio_simulado
        }

        headers = {"Content-Type": "application/json"}

        # 3. Enviar a requisição POST
        print(f"Enviando dados: {payload}")
        response = requests.post(API_URL, headers=headers, data=json.dumps(payload))

        # 4. Verificar a resposta
        if response.status_code == 201:
            print(">>> SUCESSO! Leitura registrada pela API.")
            print("Resposta:", response.json())
        else:
            print(f">>> ERRO! A API retornou o código de status {response.status_code}")
            print("Resposta:", response.text)

    except requests.exceptions.RequestException as e:
        print(f"\n>>> FALHA DE CONEXÃO: {e}")
        print(">>> Verifique se sua API C# está rodando em http://localhost:5015\n")

# --- LOOP PRINCIPAL ---
if __name__ == "__main__":
    print("==========================================")
    print("=== Simulador de Sensor Iniciado ===")
    print(f"Enviando dados para: {API_URL}")
    print("Pressione CTRL+C para parar.")
    print("==========================================")

    while True:
        enviar_leitura_simulada()
        print(f"\nAguardando {INTERVALO_SEGUNDOS} segundos...\n")
        print("------------------------------------------")
        time.sleep(INTERVALO_SEGUNDOS)