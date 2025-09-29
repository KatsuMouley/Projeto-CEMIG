import { LeituraSensor } from "./leituraSensor";

// Define a estrutura de um sensor, que pode conter múltiplas leituras
export default interface Sensor {
   id: number;
   codigoSensor: number;
   localizacao?: string;
   descricao?: string;
   leituras?: LeituraSensor[];
}
