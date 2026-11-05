const express = require('express');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Erro padrão da AgroGest para rota inexistente
app.use((req, res) => {
  res.status(404).json({ codigo: 'NAO_ENCONTRADO', mensagem: 'Recurso não encontrado' });
});

module.exports = app;