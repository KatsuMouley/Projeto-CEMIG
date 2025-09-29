'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Container, 
    Typography, 
    Box, 
    Grid, 
    Card, 
    CardContent, 
    CardActions, 
    Button,
    CircularProgress,
    Chip,
    Alert
} from '@mui/material';
import Sensor from '../Types/sensor'; // Supondo que você tenha o tipo Sensor que usa LeituraSensor
import api from '../Service/api';

export default function DashboardPage() {
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const response = await api.get<Sensor[]>('/sensors');
                setSensors(response.data);
                setError(null);
            } catch (err) {
                console.error("Falha ao buscar sensores:", err);
                setError("Não foi possível conectar à API. Verifique se o backend está rodando.");
            } finally {
                setLoading(false);
            }
        };

        fetchSensors();
        const intervalId = setInterval(fetchSensors, 60000);

        return () => clearInterval(intervalId);
    }, []);

    const getStatusChip = (sensor: Sensor) => {
        if (!sensor.leituras || sensor.leituras.length === 0) {
            return <Chip label="Sem Dados" color="default" />;
        }
        const latestReading = sensor.leituras[sensor.leituras.length - 1];

        if (latestReading.voltagem < 12.0 || latestReading.temperatura > 50) {
            return <Chip label="Alerta" color="error" />;
        }
        if (latestReading.resistenciaInterna > 0.02) {
            return <Chip label="Atenção" color="warning" />;
        }
        return <Chip label="Normal" color="success" />;
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 4 }}>
                Dashboard de Monitoramento
            </Typography>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                    <CircularProgress size={60} />
                    <Typography sx={{ml: 2, mt: 2}}>Carregando sensores...</Typography>
                </Box>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && (
                <Grid container spacing={4}>
                    {sensors.map((sensor) => {
                        const latestReading = sensor.leituras && sensor.leituras.length > 0 
                            ? sensor.leituras.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] 
                            : undefined;
                        
                        return (
                            <Grid item xs={12} sm={6} md={4} key={sensor.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.2s', '&:hover': {transform: 'scale(1.03)'} }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                                            <Typography variant="h6" component="h2">
                                                Sensor #{sensor.codigoSensor}
                                            </Typography>
                                            {getStatusChip(sensor)}
                                        </Box>
                                        <Typography color="text.secondary" gutterBottom>
                                            {sensor.localizacao}
                                        </Typography>
                                        
                                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                            <Typography variant='subtitle2' sx={{mb: 1}}>Última Leitura:</Typography>
                                            {latestReading ? (
                                                <>
                                                    <Typography><strong>Voltagem:</strong> {latestReading.voltagem.toFixed(2)} V</Typography>
                                                    <Typography><strong>Temperatura:</strong> {latestReading.temperatura.toFixed(1)} °C</Typography>
                                                    <Typography><strong>Resistência:</strong> {(latestReading.resistenciaInterna * 1000).toFixed(2)} mΩ</Typography>
                                                    
                                                    {/* ADICIONADO */}
                                                    <Typography><strong>Condutância:</strong> {latestReading.condutancia.toFixed(2)} S</Typography>
                                                    <Typography><strong>Desvio:</strong> {latestReading.desvio.toFixed(4)}</Typography>
                                                    {/* FIM DA ADIÇÃO */}

                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(latestReading.timestamp).toLocaleString('pt-BR')}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography>Nenhuma leitura registrada.</Typography>
                                            )}
                                        </Box>

                                    </CardContent>
                                    <CardActions sx={{ p: 2}}>
                                        <Button 
                                            size="small" 
                                            variant="contained" 
                                            fullWidth
                                            onClick={() => router.push(`/sensor/${sensor.id}`)}
                                        >
                                            Ver Detalhes e Gráficos
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Container>
    );
}