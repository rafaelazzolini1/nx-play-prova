const fs = require('fs');  
const path = require('path');

// --- Leitura única, na inicialização  ---
const rawPath = path.join(__dirname, '..', 'data', 'movies.json');
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

// --- Normalização: 1 filme bruto ------
function normalize(movie) {
  return {
    id: movie.id ?? null,
    title: movie.title ?? null,
    description: movie.description ?? null,
    banner: movie.banner ?? null,
    cover: movie.cover ?? null,
    hls: movie.trailer ?? null,  // trailer -> hls;
    year: movie.year ?? null,
    duration: movie.video_duration ?? null,
    classification: movie.classification ?? null,
    imdb: movie.imdb_score ?? null,
  };
}

// --- Estrutura 1: categorias para o carrossel ---
const categories = raw.map((cat) => ({
  cat_id: cat.cat_id ?? null,
  cat_label: cat.cat_label ?? null,
  order: cat.order ?? null,
  content: cat.content.map(normalize),
}));

// --- Estrutura 2: índice por id para o detalhe ---
// Map trata registros repetidos e otimiza busca
const byId = new Map();
for (const cat of raw) {
  for (const movie of cat.content) {
    byId.set(movie.id, normalize(movie));
  }
}

// Log de diagnóstico
console.log(`[dataStore] ${categories.length} categorias, ${byId.size} filmes unicos carregados`);

// --- Interface pública do módulo ---
function getCategories() { return categories; }
function getMovieById(id) { return byId.get(id) ?? null; }

module.exports = { getCategories, getMovieById };