'use client';

import React, { useState, useEffect } from 'react';
import { Button, Alert, Box, Paper, Typography } from '@mui/material';
import api from '@/Service/api'; 

interface Sensor {
  id: number;
  codigoSensor: number;
  localizacao: string;
  descricao: string;
}

export default function GerenciarSensores() {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensores = async () => {
    try {
      const response = await api.get<Sensor[]>('/sensors');
      setSensores(response.data);
    } catch (err) {
      setError('Falha ao carregar sensores. Verifique a conexão com o back-end.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensores();
  }, []);

  const handleDeleteSensor = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este sensor?")) {
      return;
    }

    try {
      await api.delete(`/sensors/${id}`);
      setSensores(sensores.filter(sensor => sensor.id !== id));
      console.log(`Sensor com ID ${id} deletado com sucesso!`);
    } catch (err) {
      setError('Erro ao deletar o sensor.');
      console.error(err);
    }
  };

  if (loading) {
    return <Typography>Carregando sensores...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Gerenciar Sensores
      </Typography>
      <Box component="ul" sx={{ listStyleType: 'none', p: 0 }}>
        {sensores.length > 0 ? (
          sensores.map(sensor => (
            <Box
              component="li"
              key={sensor.id}
              sx={{
                p: 2,
                mb: 1,
                border: '1px solid #ccc',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography>
                Código: {sensor.codigoSensor} - Localização: {sensor.localizacao} - Descrição: {sensor.descricao}
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDeleteSensor(sensor.id)}
              >
                Deletar
              </Button>
            </Box>
          ))
        ) : (
          <Typography>Nenhum sensor encontrado.</Typography>
        )}
      </Box>
    </Paper>
  );
}