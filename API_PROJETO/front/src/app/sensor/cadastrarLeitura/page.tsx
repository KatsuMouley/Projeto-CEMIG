'use client';

import { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
} from '@mui/material';

import api from '@/Service/api';
import { LeituraSensor } from '@/Types/leituraSensor';

export default function CadastrarLeitura() {
  const [sensorId, setSensorId] = useState<number | ''>('');
  const [voltagem, setVoltagem] = useState<number | ''>('');
  const [resistenciaInterna, setResistenciaInterna] = useState<number | ''>('');
  const [temperatura, setTemperatura] = useState<number | ''>('');
  const [condutancia, setCondutancia] = useState<number | ''>('');
  const [desvio, setDesvio] = useState<number | ''>('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (
      sensorId === '' ||
      voltagem === '' ||
      resistenciaInterna === '' ||
      temperatura === '' ||
      condutancia === '' ||
      desvio === ''
    ) {
      setErro('Preencha todos os campos corretamente.');
      return;
    }

    try {
      const response = await api.post<LeituraSensor>('/leituras', {
        sensorId,
        voltagem,
        resistenciaInterna,
        temperatura,
        condutancia,
        desvio,
      });

      setMensagem(`✅ Leitura cadastrada com sucesso! ID: ${response.data.id}`);
      setSensorId('');
      setVoltagem('');
      setResistenciaInterna('');
      setTemperatura('');
      setCondutancia('');
      setDesvio('');
    } catch (error) {
      console.error('Erro ao cadastrar leitura:', error);
      setErro('❌ Erro ao cadastrar leitura. Verifique os dados e tente novamente.');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Cadastrar Leitura
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="ID do Sensor"
          type="number"
          required
          value={sensorId}
          onChange={(e) => setSensorId(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <TextField
          label="Voltagem"
          type="number"
          required
          value={voltagem}
          onChange={(e) => setVoltagem(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <TextField
          label="Resistência Interna"
          type="number"
          required
          value={resistenciaInterna}
          onChange={(e) => setResistenciaInterna(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <TextField
          label="Temperatura"
          type="number"
          required
          value={temperatura}
          onChange={(e) => setTemperatura(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <TextField
          label="Condutância"
          type="number"
          required
          value={condutancia}
          onChange={(e) => setCondutancia(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <TextField
          label="Desvio"
          type="number"
          required
          value={desvio}
          onChange={(e) => setDesvio(e.target.value === '' ? '' : Number(e.target.value))}
        />

        <Button type="submit" variant="contained" color="success">
          Cadastrar Leitura
        </Button>

        {mensagem && <Alert severity="success">{mensagem}</Alert>}
        {erro && <Alert severity="error">{erro}</Alert>}
      </Box>
    </Paper>
  );
}