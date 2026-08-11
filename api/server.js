const express = require('express');
const cors = require('cors');
const { getCategories, getMovieById } = require('./src/dataStore');

const app = express();
const PORT = 3000;

// Middleware CORS
app.use(cors());

// --- GET /movies : lista agrupada p/ categoria ---
app.get('/movies', (req, res) => {
  res.json(getCategories());
});

// --- GET /movies/:id : dados completos p/ filme ---
app.get('/movies/:id', (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'id invalido' });
  }

  const movie = getMovieById(id);
  if (!movie) {
    return res.status(404).json({ error: 'filme nao encontrado' });
  }

  res.json(movie);
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});