Perfeito. Pra bateria estacionária (capacidade alta), você mede tensão e estima resistência interna com um arranjo robusto e barato: divisor resistivo + corrente conhecida por pulso de carga. Sem firula — aqui vai o que funciona, com valores e fios.

Arquitetura de medição (prática e segura)
1) Medir TENSÃO (12 V chumbo-ácido)

Meta: trazer até 0–3,3 V no ADC do ESP32 com proteção e pouco ruído.

Esquema:

Da bateria (+) → R1 = 100 kΩ → nó “Vmeas” → R2 = 10 kΩ → GND.

Capacitor 100 nF entre Vmeas e GND (filtro RC).

100 Ω em série entre Vmeas e o pino ADC (ex: GPIO34) para proteger o ADC.

TVS bidirecional (ex.: SMAJ18CA) entre (+) bateria e GND (protege de surtos).

Fusível 1–2 A no positivo da bateria (não economiza nisso).

Por quê esses valores?
Razão ≈ 100k/10k = 10:1 → 20 V vira ~2,0 V no ADC (folga). Carga do divisor é baixa (≈110 kΩ), poupa a bateria e esquenta zero.

Fórmula:

V_bat = V_adc * (R1 + R2) / R2

2) Medir CORRENTE (pra calcular R_interna direito)

Você tem duas rotas. Eu recomendo a A; a B é o “bom o bastante” do MVP.

A) Com sensor dedicado (melhor): INA219/INA226 (I²C)

Mede tensão do barramento (até ~26–36 V) e corrente via shunt de 0,1 Ω (típico na placa pronta).

Ligações:

Bateria (+) → SHUNT → resto do circuito (carga, etc.).

SDA/SCL → GPIO21/22 do ESP32 (ou pinos I²C que você preferir).

Vcc 3V3, GND comuns.

Vantagem: você mede I diretamente e recebe V_bus pronto, com boa precisão e menos ruído.

B) Sem sensor de corrente (mais barato):

Use resistor de carga conhecido (R_carga) e infira I pela própria tensão com carga:

I_carga ≈ V_carga / R_carga (se o R_carga estiver direto na bateria).

É menos preciso, mas serve pro MVP.

3) Medir RESISTÊNCIA INTERNA (estimativa DC por pulso)

Ideia: medir a queda de tensão quando você força uma corrente conhecida por poucos milissegundos.

Hardware:

MOSFET canal N “logic-level” (ex.: IRLZ44N, AOI518, IRLZ34N) no lado baixo (low-side).

R_carga: sugiro 12 Ω / 25 W (alumínio) para baterias 12 V.

Corrente nominal ≈ 1 A.

Potência em carga contínua seria ~12 W, mas como é pulso curto (100–300 ms), 25 W dá muita folga térmica.

Gate driver simples: resistor série 100 Ω no gate; 100 kΩ gate-GND (pull-down).

Dreno no lado do resistor; fonte no GND; outro lado do resistor vai ao +12 V.

Nada de diodo flyback (a carga é resistiva).

Aterramento comum entre tudo (bateria, ESP32, sensores).

Sequência de medição (firmware):

Meça V_aberta (sem carga) por ~50–100 ms, faça média de N amostras.

Ligue o MOSFET → aplica carga → espere 50 ms (assentamento).

Leia V_carga por 100–200 ms, faça média.

Desligue carga.

Calcule I_carga (do INA219 ou V_carga/R_carga).

R_int ≈ (V_aberta − V_carga) / I_carga.

Limite duty-cycle: máx. 1 pulso a cada 5–10 s (protege resistor e bateria). Para banco grande, pode usar 1–2 A; para MVP, 1 A é suficiente.

4) Ligações resumidas (pinos sugeridos)

Vbat → divisor (100k/10k) → ADC (GPIO34).

INA219 (opção A): SDA=GPIO21, SCL=GPIO22, 3V3, GND, shunt no positivo da bateria.

DS18B20 (temperatura): dados no GPIO4, resistor 4,7 kΩ pull-up para 3V3.

MOSFET gate: GPIO25 (saída digital).

R_carga 12 Ω/25 W entre +12 V e dreno do MOSFET; fonte no GND.

5) Código base (Arduino/ESP32) – sólido o suficiente pro MVP
Utilitários (média e leitura de ADC filtrada)
float readAdcAveraged(int pin, int samples = 32) {
  uint32_t acc = 0;
  for (int i = 0; i < samples; i++) {
    acc += analogRead(pin);
    delayMicroseconds(200);
  }
  return (float)acc / samples;
}

float adcToVoltage(float adcMean, float vref = 3.3f) {
  return (adcMean / 4095.0f) * vref;
}

Setup e constantes
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define PIN_ADC_VBAT   34
#define PIN_MOSFET_GATE 25
#define ONE_WIRE_BUS    4

// Divisor
const float R1 = 100000.0f;
const float R2 = 10000.0f;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);
Adafruit_INA219 ina; // opcional, comente se não usar

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);

  pinMode(PIN_MOSFET_GATE, OUTPUT);
  digitalWrite(PIN_MOSFET_GATE, LOW);

  Wire.begin();          // I2C
  ina.begin();           // comente se não usar INA219
  tempSensor.begin();    // DS18B20

  // Wi-Fi opcional depois. Para MVP: usar Serial primeiro.
}

Medição de tensão da bateria (via divisor)
float medirVbat() {
  float adc = readAdcAveraged(PIN_ADC_VBAT, 64);
  float vAdc = adcToVoltage(adc);
  float vBat = vAdc * (R1 + R2) / R2;
  return vBat;
}

Medição de corrente (duas opções)
// A) Com INA219
float medirCorrenteA() {
  return ina.getCurrent_mA() / 1000.0f; // Amperes
}

// B) Sem INA219, pelo R_carga (informe o valor exato!)
const float R_CARGA = 12.0f;
float estimarCorrenteB(float vCarga) {
  return vCarga / R_CARGA; // A
}

Medição de R_interna (pulso de carga)
float medirResistenciaInterna(bool usarINA = true) {
  // 1) V em aberto
  float vOpen = 0.0f;
  for (int i = 0; i < 16; i++) { vOpen += medirVbat(); delay(5); }
  vOpen /= 16.0f;

  // 2) Liga carga
  digitalWrite(PIN_MOSFET_GATE, HIGH);
  delay(50); // assentamento

  // 3) Mede com carga
  float vLoad = 0.0f;
  for (int i = 0; i < 32; i++) { vLoad += medirVbat(); delay(5); }
  vLoad /= 32.0f;

  float iLoad = 0.0f;
  if (usarINA) {
    // Média de corrente do INA219
    for (int i = 0; i < 8; i++) { iLoad += medirCorrenteA(); delay(5); }
    iLoad /= 8.0f;
  } else {
    iLoad = estimarCorrenteB(vLoad); // corrente estimada pela queda na carga
  }

  // 4) Desliga carga
  digitalWrite(PIN_MOSFET_GATE, LOW);

  if (iLoad <= 0.05f) return NAN; // protege contra divisão absurda

  float rInt = (vOpen - vLoad) / iLoad; // ohms
  return rInt;
}

Temperatura (DS18B20)
float medirTemperaturaC() {
  tempSensor.requestTemperatures();
  float t = tempSensor.getTempCByIndex(0);
  return t;
}

Loop (Serial primeiro; depois você pluga HTTP POST)
void loop() {
  float vbat = medirVbat();
  float tempC = medirTemperaturaC();
  float rint = medirResistenciaInterna(true); // true = usar INA219

  Serial.printf("Vbat=%.3f V, Temp=%.2f C, Rint=%.4f ohm\n", vbat, tempC, rint);

  // Respeite duty-cycle da carga
  delay(5000);
}


Quando quiser mandar pra API: monte seu JSON e faça HTTPClient http; http.POST(json). Você já tem esse padrão.

6) BOM (lista de peças direta ao ponto)

ESP32 DevKit V1 (WROOM)

R1 100 kΩ 1%, R2 10 kΩ 1%

C 100 nF (X7R)

Resistor série 100 Ω (ADC)

TVS SMAJ18CA (entre + e GND da bateria)

Fusível 1–2 A + porta-fusível

MOSFET N logic-level (IRLZ44N/IRLZ34N/AOI518)

R_gate 100 Ω, R_pull-down 100 kΩ

R_carga 12 Ω / 25 W (alumínio com furação) + dissipação (fixe num alumínio/chapa)

DS18B20 TO-92 + 4,7 kΩ pull-up

Opcional (recomendado): INA219 breakout (com shunt de 0,1 Ω)

7) Boas práticas (não ignore)

Aterramento estrela: leve o retorno da carga e do medidor ao mesmo nó de GND grosso perto do shunt/MOSFET.

Cabos curtos e grossos para a trilha da carga; sinal analógico separado dos cabos de corrente.

Calibração: capture pares (V_multímetro, V_ADC) para corrigir ganho/offset no firmware. Faça o mesmo para corrente.

Janelas e limites: descarte leituras quando a queda de tensão for ridícula (ex.: ΔV < 10 mV) — isso gera R_int fictícia.

Pulso curto: 100–300 ms é suficiente. A cada 5–10 s. Nada de “carga contínua” no MVP.

Proteção de polaridade: se houver risco de inversão, use MOSFET ideal-diodo ou ao menos um Schottky em série (com queda de ~0,3–0,4 V).

8) Integração com a API

Você já tem os endpoints. Do lado do ESP32, mande JSON com:

{
  "sensorId": 123,
  "voltagem": 12.68,
  "temperatura": 27.4,
  "resistenciaInterna": 0.0245,
  "timestamp": "2025-08-20T20:10:00Z"
}


E, se usar INA219, pode enviar corrente também para diagnósticos:

{ "corrente": 1.02 }