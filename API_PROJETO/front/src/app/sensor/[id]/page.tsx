'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    CircularProgress,
    Alert,
    Button,
    createTheme,
    ThemeProvider,
    CssBaseline,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import Sensor from '../../../Types/sensor';
import { LeituraSensor } from '../../../Types/leituraSensor';
import api from '../../../Service/api';

// Tema escuro para a página
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#f48fb1',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
    },
});

// Componente reutilizável para os gráficos
const LeituraChart = ({
    data,
    title,
    dataKey,
    color,
    unit,
}: {
    data: LeituraSensor[];
    title: string;
    dataKey: keyof LeituraSensor;
    color: string;
    unit: string;
}) => {
    const formatXAxis = (tickItem: string) => {
        return new Date(tickItem).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Paper elevation={3} sx={{ p: 2, height: '500px' }}>
            <Typography variant="h6" align="center" gutterBottom>
                {title}
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                    <YAxis
                        label={{ value: unit, angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        labelFormatter={(label) =>
                            new Date(label).toLocaleString('pt-BR')
                        }
                        formatter={(value) => [`${Number(value).toFixed(2)} ${unit}`, title]}
                        contentStyle={{ backgroundColor: '#333' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        activeDot={{ r: 8 }}
                        name={title}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default function SensorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [sensor, setSensor] = useState<Sensor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchSensorData = async () => {
            try {
                const response = await api.get<Sensor>(`/sensors/${id}`);
                if (response.data.leituras) {
                    response.data.leituras.sort(
                        (a, b) =>
                            new Date(a.timestamp).getTime() -
                            new Date(b.timestamp).getTime()
                    );
                }
                setSensor(response.data);
                setError(null);
            } catch (err) {
                console.error(`Falha ao buscar dados do sensor ${id}:`, err);
                setError(`Não foi possível carregar os dados do sensor.`);
            } finally {
                setLoading(false);
            }
        };

        fetchSensorData();
        const intervalId = setInterval(fetchSensorData, 60000);

        return () => clearInterval(intervalId);
    }, [id]);

    const ultimasLeituras = sensor?.leituras
        ? sensor.leituras.slice(-20)
        : [];

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ py: 12 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                        <CircularProgress />
                    </Box>
                )}
                {error && <Alert severity="error">{error}</Alert>}

                {sensor && (
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => router.push('/')}
                            sx={{ mb: 3 }}
                        >
                            &larr; Voltar ao Dashboard
                        </Button>

                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" gutterBottom>
                                Sensor #{sensor.codigoSensor}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                <strong>Localização:</strong> {sensor.localizacao}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                <strong>Descrição:</strong> {sensor.descricao}
                            </Typography>
                        </Box>

                        {ultimasLeituras.length > 1 ? (
                            <Grid container spacing={4} direction="column">
                                <Grid item xs={12}>
                                    <LeituraChart
                                        data={ultimasLeituras}
                                        title="Voltagem"
                                        dataKey="voltagem"
                                        color="#8884d8"
                                        unit="V"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <LeituraChart
                                        data={ultimasLeituras}
                                        title="Temperatura"
                                        dataKey="temperatura"
                                        color="#82ca9d"
                                        unit="°C"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <LeituraChart
                                        data={ultimasLeituras}
                                        title="Resistência Interna"
                                        dataKey="resistenciaInterna"
                                        color="#ffc658"
                                        unit="mΩ"
                                    />
                                </Grid>
                                
                                {/* GRÁFICOS ADICIONADOS */}
                                <Grid item xs={12}>
                                    <LeituraChart
                                        data={ultimasLeituras}
                                        title="Condutância"
                                        dataKey="condutancia"
                                        color="#ff7300"
                                        unit="S"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <LeituraChart
                                        data={ultimasLeituras}
                                        title="Desvio Padrão"
                                        dataKey="desvio"
                                        color="#f48fb1"
                                        unit=""
                                    />
                                </Grid>
                                {/* FIM DA ADIÇÃO */}

                            </Grid>
                        ) : (
                            <Alert severity="info">
                                É necessário pelo menos 2 leituras para exibir os gráficos.
                            </Alert>
                        )}
                    </>
                )}
            </Container>
        </ThemeProvider>
    );
}