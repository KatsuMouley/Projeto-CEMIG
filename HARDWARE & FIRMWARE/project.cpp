#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// -------------------- CONFIGURAÇÃO --------------------
const char* ssid = "NOME_DA_REDE";          // Substitua pelo SSID da sua rede Wi-Fi
const char* password = "SENHA_DA_REDE";    // Substitua pela senha

const char* apiUrl = "http://localhost:5015/api/leituras"; // URL da sua API
const int sensorId = 1;  // ID do sensor criado na API

#define ONE_WIRE_BUS 4     // GPIO do DS18B20
#define MOSFET_PIN 5       // GPIO que controla a carga
#define BAT_ADC_PIN 34     // GPIO ADC para medição de tensão da bateria

// Divisor de tensão (R1 = 39kΩ, R2 = 10kΩ)
#define R1 39000.0
#define R2 10000.0

// Resistor de carga
#define R_LOAD 12.0  // Ohms

// Intervalo de medição (ms)
#define MEASURE_INTERVAL 60000  // 1 minuto (ajuste conforme necessário)

// -------------------- INICIALIZAÇÃO --------------------
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  pinMode(MOSFET_PIN, OUTPUT);
  digitalWrite(MOSFET_PIN, LOW);
  sensors.begin();
  analogReadResolution(12); // 12 bits ADC

  WiFi.begin(ssid, password);
  Serial.print("Conectando ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Conectado ao Wi-Fi!");
}

// -------------------- FUNÇÕES AUXILIARES --------------------
float readBatteryVoltage() {
  int adcValue = analogRead(BAT_ADC_PIN);
  float v_adc = (adcValue / 4095.0) * 3.3;
  float v_bat = v_adc * ((R1 + R2) / R2);
  return v_bat;
}

float readTemperature() {
  sensors.requestTemperatures();
  return sensors.getTempCByIndex(0);
}

float calculateInternalResistance(float V_noLoad, float V_load) {
  float I_load = V_load / R_LOAD;
  float R_int = (V_noLoad - V_load) / I_load;
  return R_int;
}

// -------------------- ENVIO PARA API --------------------
void sendDataToAPI(float voltage, float temp, float r_internal) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi não conectado!");
    return;
  }

  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");

  // Calculando condutância (opcional)
  float condutance = 1.0 / r_internal; 

  // Desvio fictício (pode ser calculado futuramente)
  float desvio = 0.05;

  // Criar JSON
  StaticJsonDocument<256> jsonDoc;
  jsonDoc["sensorId"] = sensorId;
  jsonDoc["voltagem"] = voltage;
  jsonDoc["resistenciaInterna"] = r_internal;
  jsonDoc["temperatura"] = temp;
  jsonDoc["condutancia"] = condutance;
  jsonDoc["desvio"] = desvio;

  String jsonString;
  serializeJson(jsonDoc, jsonString);

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Resposta API: ");
    Serial.println(response);
  } else {
    Serial.print("Erro no envio: ");
    Serial.println(httpResponseCode);
  }
  http.end();
}

// -------------------- LOOP PRINCIPAL --------------------
void loop() {
  float V_noLoad = readBatteryVoltage();
  float temperature = readTemperature();

  // Aplicar carga temporária
  digitalWrite(MOSFET_PIN, HIGH);
  delay(1000); // 1 segundo
  float V_load = readBatteryVoltage();
  digitalWrite(MOSFET_PIN, LOW);

  float R_internal = calculateInternalResistance(V_noLoad, V_load);

  Serial.print("V: "); Serial.print(V_noLoad, 2);
  Serial.print(" V, Temp: "); Serial.print(temperature, 1);
  Serial.print(" °C, Rint: "); Serial.print(R_internal * 1000, 2); Serial.println(" mOhm");

  // Enviar para API
  sendDataToAPI(V_noLoad, temperature, R_internal);

  delay(MEASURE_INTERVAL);
}
