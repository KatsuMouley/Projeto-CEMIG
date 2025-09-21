'use client';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import "./globals.css";
import { AppBar, Box, Container, CssBaseline, Toolbar, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <CssBaseline />

        {/* Barra de ferramentas - CEMIG */}
        <AppBar position="static" sx={{ bgcolor: "#006837" }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
              CEMIG - Companhia Energética de Minas Gerais
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" component={Link} href="/">
                Voltar para Cadastro
              </Button>
              <Button color="inherit" component={Link} href="/sensor/gerenciarSensor">
                Gerenciar Sensores
              </Button>
              <Button color="inherit" component={Link} href="/leitura/gerenciarLeitura">
                Gerenciar Leituras
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Conteúdo principal */}
        <Box component="main"
          sx={{ minHeight: "calc(100vh - 120px)", py: 4, bgcolor: "#f5f5f5" }}>
          <Container>
            {children}
          </Container>
        </Box>

        {/* Rodapé institucional */}
        <Box component="footer"
          sx={{
            bgcolor: "#006837",
            color: "#fff",
            py: 2,
            textAlign: "center"
          }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} CEMIG - Todos os direitos reservados
          </Typography>
        </Box>
      </body>
    </html>
  );
}