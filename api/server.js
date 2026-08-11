const express = require('express');
const cors = require('cors');
const { getCategories, getMovieById } = require('./src/dataStore');

const app = express();
const PORT = 3000;

// Middleware de CORS (Decisão 5): libera o front (origem diferente) a chamar a API.
app.use(cors());

// --- GET /movies : lista agrupada por categoria (para o carrossel) ---
app.get('/movies', (req, res) => {
  res.json(getCategories());  // res.json serializa o objeto e envia com status 200
});

// --- GET /movies/:id : dados completos de um filme ---
app.get('/movies/:id', (req, res) => {
  const id = Number(req.params.id);  // params vêm como string; convertemos para número

  // Caso 1: id não-numérico -> 400 (Decisão 6)
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'id invalido' });
  }

  // Caso 2: id válido mas inexistente -> 404 (Decisão 6)
  const movie = getMovieById(id);
  if (!movie) {
    return res.status(404).json({ error: 'filme nao encontrado' });
  }

  // Caso 3: encontrado -> 200 com o filme
  res.json(movie);
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});