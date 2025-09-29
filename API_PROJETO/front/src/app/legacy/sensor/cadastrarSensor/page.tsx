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
import Sensor from '@/Types/sensor';
import api from '@/Service/api';

export default function CadastrarSensor() {
  const [codigoSensor, setCodigoSensor] = useState<number | ''>('');
  const [localizacao, setLocalizacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (!codigoSensor || !localizacao.trim() || !descricao.trim()) {
      setErro('Preencha todos os campos corretamente.');
      return;
    }

    try {
      const response = await api.post<Sensor>('/sensors', {
        codigoSensor,
        localizacao,
        descricao,
      });

      setMensagem(`✅ Sensor cadastrado com sucesso! ID: ${response.data.id}`);
      setCodigoSensor('');
      setLocalizacao('');
      setDescricao('');
    } catch (error) {
      console.error('Erro ao cadastrar sensor:', error);
      setErro('❌ Erro ao cadastrar sensor. Verifique os dados e tente novamente.');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Cadastrar Sensor
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="Código do Sensor"
          type="number"
          required
          value={codigoSensor}
          onChange={(e) => {
            const value = e.target.value;
            setCodigoSensor(value === '' ? '' : Number(value));
          }}
        />
        <TextField
          label="Localização"
          required
          value={localizacao}
          onChange={(e) => setLocalizacao(e.target.value)}
        />
        <TextField
          label="Descrição"
          multiline
          rows={3}
          required
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <Button type="submit" variant="contained" color="success">
          Cadastrar
        </Button>

        {mensagem && <Alert severity="success">{mensagem}</Alert>}
        {erro && <Alert severity="error">{erro}</Alert>}
      </Box>
    </Paper>
  );
}