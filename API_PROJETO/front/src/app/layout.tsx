'use client';

import "./globals.css"; 
import { AppBar, Box, CssBaseline, Toolbar, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <title>CEMIG - Monitoramento</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
        />
      </head>
      <body>
        <CssBaseline />

        {/* Barra de ferramentas com tema branco */}
        <AppBar position="static" sx={{ bgcolor: "#ffffff", color: "#212121" }} elevation={1}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
              CEMIG - Monitoramento de Baterias
            </Typography>

            <Box>
              <Button color="inherit" component={Link} href="/">
                Dashboard
              </Button>
              {/* --- BOTÃO ADICIONADO --- */}
              <Button 
                color="inherit" 
                component={Link} 
                href="/sensor/cadastrar" 
                sx={{ ml: 2 }}
              >
                Cadastrar Sensor
              </Button>
               {/* --- FIM DA ADIÇÃO --- */}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Conteúdo principal */}
        <Box component="main" sx={{ flexGrow: 1, py: 4, minHeight: 'calc(100vh - 128px)' }}>
          {children}
        </Box>

        {/* Rodapé institucional com tema branco */}
        <Box component="footer"
          sx={{
            bgcolor: "#ffffff",
            color: "rgba(0, 0, 0, 0.6)",
            py: 2,
            textAlign: "center",
            borderTop: '1px solid #e0e0e0'
          }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} CEMIG - Todos os direitos reservados
          </Typography>
        </Box>
      </body>
    </html>
  );
}