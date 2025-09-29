'use client';

import React, { useState, useEffect } from 'react';
import { Button, Alert, Box, Paper, Typography } from '@mui/material';
import api from '@/Service/api'; 

interface Leitura {
  id: number;
  valor: number;
}

export default function GerenciarLeituras() {
  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeituras = async () => {
    try {
      const response = await api.get<Leitura[]>('/leituras');
      setLeituras(response.data);
    } catch (err) {
      setError('Falha ao carregar leituras. Verifique a conexão com o back-end.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeituras();
  }, []);

  const handleDeleteLeitura = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja deletar esta leitura?")) {
      return;
    }

    try {
      await api.delete(`/leituras/${id}`);
      setLeituras(leituras.filter(leitura => leitura.id !== id));
      console.log(`Leitura com ID ${id} deletada com sucesso!`);
    } catch (err) {
      setError('Erro ao deletar a leitura.');
      console.error(err);
    }
  };

  if (loading) {
    return <Typography>Carregando leituras...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Gerenciar Leituras
      </Typography>
      <Box component="ul" sx={{ listStyleType: 'none', p: 0 }}>
        {leituras.length > 0 ? (
          leituras.map(leitura => (
            <Box
              component="li"
              key={leitura.id}
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
                ID: {leitura.id} - Valor: {leitura.valor}
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDeleteLeitura(leitura.id)}
              >
                Deletar
              </Button>
            </Box>
          ))
        ) : (
          <Typography>Nenhuma leitura encontrada.</Typography>
        )}
      </Box>
    </Paper>
  );
}