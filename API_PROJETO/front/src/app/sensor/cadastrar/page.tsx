'use client';

import { useState, useRef } from 'react';
import { 
  Container, Typography, Box, TextField, Button, Modal, IconButton, 
  InputAdornment, Alert, Snackbar, CircularProgress, Paper 
} from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import jsQR from 'jsqr';
import api from '@/Service/api';
import Sensor from '@/Types/sensor';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '500px',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export default function CadastrarSensorPage() {
  const [codigoSensor, setCodigoSensor] = useState<number | ''>('');
  const [localizacao, setLocalizacao] = useState('');
  const [descricao, setDescricao] = useState('');
  
  const [scannerOpen, setScannerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'info'}>({ open: false, message: '', severity: 'success' });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FUNÇÃO CORRIGIDA E MELHORADA ---
  const handleQrCodeResult = (text: string) => {
    try {
      const parsedData = JSON.parse(text);

      // Verifica se os campos necessários existem no JSON
      if (parsedData && typeof parsedData.codigoSensor === 'number' && parsedData.localizacao && parsedData.descricao) {
        setCodigoSensor(parsedData.codigoSensor);
        setLocalizacao(parsedData.localizacao);
        setDescricao(parsedData.descricao);
        setSnackbar({ open: true, message: 'Todos os campos foram preenchidos via QR Code!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'QR Code com dados incompletos.', severity: 'error' });
      }
    } catch (error) {
       setSnackbar({ open: true, message: 'Conteúdo do QR Code é inválido (não é um JSON esperado).', severity: 'error' });
    }
  };
  
  // Função para a CÂMERA (usa Html5QrcodeScanner)
  const onNewScanResult = (decodedText: string) => {
    setScannerOpen(false);
    handleQrCodeResult(decodedText);
  };

  // Função de UPLOAD (usa jsQR)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0, image.width, image.height);
          const imageData = ctx.getImageData(0, 0, image.width, image.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            handleQrCodeResult(code.data);
          } else {
            setSnackbar({ open: true, message: 'Nenhum QR Code encontrado na imagem.', severity: 'error' });
          }
        }
        setIsProcessing(false);
      };
      image.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // Função de SUBMISSÃO
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!codigoSensor || !localizacao.trim() || !descricao.trim()) {
      setSnackbar({ open: true, message: 'Preencha todos os campos obrigatórios.', severity: 'error' });
      return;
    }

    try {
      const response = await api.post<Sensor>('/sensors', {
        codigoSensor,
        localizacao,
        descricao,
      });

      setSnackbar({ open: true, message: `Sensor cadastrado com sucesso! ID: ${response.data.id}`, severity: 'success' });
      setCodigoSensor('');
      setLocalizacao('');
      setDescricao('');
    } catch (error) {
      console.error('Erro ao cadastrar sensor:', error);
      setSnackbar({ open: true, message: 'Erro ao cadastrar sensor. Verifique os dados e tente novamente.', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="md">
      <input
        type="file" accept="image/*" ref={fileInputRef}
        style={{ display: 'none' }} onChange={handleFileSelect}
      />

      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
          Cadastrar Novo Sensor
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Preencha os dados manualmente ou use o QR code para preencher o formulário.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Código do Sensor"
            variant="outlined"
            type="number"
            required
            value={codigoSensor}
            onChange={(e) => setCodigoSensor(e.target.value === '' ? '' : Number(e.target.value))}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="Escanear QR code com a câmera" onClick={() => setScannerOpen(true)}>
                    📷
                  </IconButton>
                  <IconButton aria-label="Carregar imagem de QR code" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                    {isProcessing ? <CircularProgress size={24} /> : "📂"}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Localização"
            variant="outlined"
            required
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
          />
          <TextField
            label="Descrição"
            variant="outlined"
            multiline
            rows={3}
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <Button type="submit" variant="contained" size="large" sx={{ mt: 2 }}>
            Cadastrar Sensor
          </Button>
        </Box>
      </Paper>

      {/* Modal com o Scanner */}
      <Modal open={scannerOpen} onClose={() => setScannerOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 2 }}>Aponte para o QR Code</Typography>
          <Box id="reader" sx={{ width: '100%' }} />
          <Button onClick={() => setScannerOpen(false)} sx={{ mt: 2 }}>Cancelar</Button>
        </Box>
      </Modal>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}