// Define a estrutura de uma única leitura
export type LeituraSensor = {
  id: number;
  sensorId: number;
  voltagem: number;
  resistenciaInterna: number;
  temperatura: number;
  condutancia: number;
  desvio: number;
  timestamp: string;
};
