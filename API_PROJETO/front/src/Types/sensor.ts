import { LeituraSensor } from "./leituraSensor";

export default interface Sensor{
   id: number; 
  codigoSensor: number;
  localizacao?: string;
  descricao?: string;
  leituras?: LeituraSensor[];
}