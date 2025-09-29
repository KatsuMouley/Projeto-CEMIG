#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// -------------------- CONFIGURAÇÃO --------------------
const char* ssid = "NOME_DA_REDE";          // Substitua pelo SSID da sua rede Wi-Fi
const char* password = "SENHA_DA_REDE";    // Substitua pela senha

const char* apiUrl = "http://localhost:5015/api/leituras"; // URL da sua API
const int sensorId = 1;                    // ID do sensor que você criou na API

#define ONE_WIRE_BUS 4      // GPIO do sensor de temperatura DS18B20
#define MOSFET_PIN 5        // GPIO que controla a carga da bateria
#define BAT_ADC_PIN 34      // GPIO ADC para medição de tensão da bateria

// Configurações do circuito
#define R1 39000.0          // Resistor 1 do divisor de tensão
#define R2 10000.0          // Resistor 2 do divisor de tensão
#define R_LOAD 12.0         // Resistor de carga em Ohms

// --- ALTERAÇÃO AQUI ---
// Intervalo de medição em milissegundos
#define MEASURE_INTERVAL 28800000  // Alterado para 28.800.000 milisegundos que é o equivalente a 8 horas

// -------------------- INICIALIZAÇÃO --------------------
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  pinMode(MOSFET_PIN, OUTPUT);
  digitalWrite(MOSFET_PIN, LOW); // Garante que a carga comece desligada
  sensors.begin();
  analogReadResolution(12); // Define a resolução do ADC para 12 bits

  // Conexão com a rede Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Conectando ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado ao Wi-Fi com sucesso!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

// -------------------- FUNÇÕES AUXILIARES --------------------

// Lê a tensão da bateria através do divisor de tensão
float readBatteryVoltage() {
  int adcValue = analogRead(BAT_ADC_PIN);
  float v_adc = (adcValue / 4095.0) * 3.3; // Converte o valor do ADC para tensão
  float v_bat = v_adc * ((R1 + R2) / R2);   // Calcula a tensão real da bateria
  return v_bat;
}

// Lê a temperatura do sensor DS18B20
float readTemperature() {
  sensors.requestTemperatures();
  return sensors.getTempCByIndex(0);
}

// Calcula a resistência interna da bateria
float calculateInternalResistance(float V_noLoad, float V_load) {
  if (V_load <= 0) return 0; // Evita divisão por zero
  float I_load = V_load / R_LOAD;
  if (I_load <= 0) return 0; // Evita divisão por zero
  float R_int = (V_noLoad - V_load) / I_load;
  return R_int;
}

// -------------------- ENVIO PARA API --------------------

// Monta o JSON e envia os dados para a API via HTTP POST
void sendDataToAPI(float voltage, float temp, float r_internal) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi não conectado! Tentando reconectar...");
    WiFi.reconnect();
    return;
  }

  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");

  // Calcula a condutância (o inverso da resistência)
  float condutance = (r_internal > 0) ? (1.0 / r_internal) : 0;

  // Valor de desvio (pode ser aprimorado futuramente)
  float desvio = 0.05;

  // Cria o documento JSON para enviar
  StaticJsonDocument<256> jsonDoc;
  jsonDoc["sensorId"] = sensorId;
  jsonDoc["voltagem"] = voltage;
  jsonDoc["resistenciaInterna"] = r_internal;
  jsonDoc["temperatura"] = temp;
  jsonDoc["condutancia"] = condutance;
  jsonDoc["desvio"] = desvio;

  String jsonString;
  serializeJson(jsonDoc, jsonString);

  // Envia a requisição POST
  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Código de Resposta HTTP: ");
    Serial.println(httpResponseCode);
    Serial.print("Resposta da API: ");
    Serial.println(response);
  } else {
    Serial.print("Erro no envio para a API. Código de erro: ");
    Serial.println(httpResponseCode);
  }
  http.end();
}

// -------------------- LOOP PRINCIPAL --------------------
void loop() {
  // 1. Mede a tensão sem carga e a temperatura
  float V_noLoad = readBatteryVoltage();
  float temperature = readTemperature();

  // 2. Aplica a carga na bateria por um breve momento
  digitalWrite(MOSFET_PIN, HIGH);
  delay(1000); // Mantém a carga por 1 segundo

  // 3. Mede a tensão com a carga aplicada
  float V_load = readBatteryVoltage();
  digitalWrite(MOSFET_PIN, LOW); // Desliga a carga

  // 4. Calcula a resistência interna
  float R_internal = calculateInternalResistance(V_noLoad, V_load);

  // Exibe os valores no Monitor Serial
  Serial.println("-------------------------");
  Serial.print("Tensão sem Carga: "); Serial.print(V_noLoad, 2); Serial.println(" V");
  Serial.print("Temperatura: "); Serial.print(temperature, 1); Serial.println(" °C");
  Serial.print("Resistência Interna: "); Serial.print(R_internal * 1000, 2); Serial.println(" mOhm");

  // 5. Envia os dados para a API
  sendDataToAPI(V_noLoad, temperature, R_internal);

  // 6. Aguarda 30 segundos antes da próxima medição
  Serial.println("Aguardando 30 segundos para a próxima leitura...");
  delay(MEASURE_INTERVAL);
}
