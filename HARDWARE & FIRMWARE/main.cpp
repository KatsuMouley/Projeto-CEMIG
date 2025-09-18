// ===========================================
// MVP Sistema de Monitoramento de Baterias
// Hardware: ESP32 + DS18B20/LM35 + MOSFET + Resistor de carga
// ===========================================

// Bibliotecas
#include <OneWire.h>
#include <DallasTemperature.h>

// -------------------- CONFIGURAÇÃO --------------------
#define ONE_WIRE_BUS 4     // GPIO do DS18B20
#define MOSFET_PIN 5       // GPIO que controla a carga
#define BAT_ADC_PIN 34     // GPIO ADC para medição de tensão da bateria

// Divisor de tensão (R1 = 39kΩ, R2 = 10kΩ)
#define R1 39000.0
#define R2 10000.0

// Resistor de carga
#define R_LOAD 12.0  // em Ohms

// Intervalo de medição
#define MEASURE_INTERVAL 5000  // 5 segundos (ajustar conforme necessidade)

// -------------------- INICIALIZAÇÃO --------------------
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  pinMode(MOSFET_PIN, OUTPUT);
  digitalWrite(MOSFET_PIN, LOW); // MOSFET desligado
  sensors.begin();
  analogReadResolution(12); // 12 bits (0-4095)
}

// -------------------- FUNÇÕES AUXILIARES --------------------

// Lê tensão da bateria pelo ADC e corrige pelo divisor de tensão
float readBatteryVoltage() {
  int adcValue = analogRead(BAT_ADC_PIN);
  float v_adc = (adcValue / 4095.0) * 3.3; // ESP32 ADC: 0-3.3V
  float v_bat = v_adc * ((R1 + R2) / R2);
  return v_bat;
}

// Mede temperatura usando DS18B20
float readTemperature() {
  sensors.requestTemperatures();
  return sensors.getTempCByIndex(0); // Celsius
}

// Calcula resistência interna aproximada
float calculateInternalResistance(float V_noLoad, float V_load) {
  float I_load = V_load / R_LOAD; // Corrente passando pelo resistor
  float R_int = (V_noLoad - V_load) / I_load; // Ohms
  return R_int;
}

// -------------------- LOOP PRINCIPAL --------------------
void loop() {
  // Leitura de tensão sem carga
  float V_noLoad = readBatteryVoltage();

  // Leitura de temperatura
  float temperature = readTemperature();

  // Aplicar carga temporária
  digitalWrite(MOSFET_PIN, HIGH);
  delay(1000); // aplicar carga por 1 segundo
  float V_load = readBatteryVoltage();
  digitalWrite(MOSFET_PIN, LOW);

  // Calcular resistência interna
  float R_internal = calculateInternalResistance(V_noLoad, V_load);

  // Enviar dados via Serial
  Serial.print("Tensao: "); Serial.print(V_noLoad, 2); Serial.print(" V, ");
  Serial.print("Temperatura: "); Serial.print(temperature, 1); Serial.print(" C, ");
  Serial.print("Resistencia Interna: "); Serial.print(R_internal * 1000, 2); Serial.println(" mOhm");

  delay(MEASURE_INTERVAL);
}
