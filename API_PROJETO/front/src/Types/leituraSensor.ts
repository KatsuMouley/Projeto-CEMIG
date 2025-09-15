export type LeituraSensor = {
  id: number;
  sensorId: number;
  voltagem: number;
  resistenciaInterna: number;
  temperatura: number;
  condutancia: number;
  desvio: number;
  timestamp: string; // ou Date, dependendo do formato que a API retorna
};
