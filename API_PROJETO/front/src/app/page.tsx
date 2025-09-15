'use client';

import { Box, Button, Typography, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao Sistema de Sensores
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Escolha uma das opções abaixo para começar:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/sensor/cadastrarSensor')}
        >
          Cadastrar Sensor
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={() => router.push('/sensor/cadastrarLeitura')}
        >
          Cadastrar Leitura
        </Button>
      </Box>
    </Paper>
  );
}