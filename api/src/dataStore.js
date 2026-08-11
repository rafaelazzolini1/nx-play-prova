const fs = require('fs');       // módulo nativo do Node para ler arquivos
const path = require('path');   // módulo nativo para montar caminhos de arquivo

// --- Leitura única, na inicialização (Decisão 1) ---
// path.join monta o caminho de forma segura em qualquer sistema operacional.
// __dirname é a pasta onde ESTE arquivo está (api/src), então subimos um nível
// com '..' para chegar em api/ e entrar em data/movies.json.
const rawPath = path.join(__dirname, '..', 'data', 'movies.json');
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
// readFileSync lê o arquivo como texto; JSON.parse transforma o texto em
// objeto/array JavaScript. "Sync" (síncrono) é aceitável aqui porque roda
// só uma vez, na largada, antes de o servidor aceitar requisições.

// --- Normalização: 1 filme bruto -> formato do contrato (Decisões 2 e 3) ---
function normalize(movie) {
  return {
    id: movie.id,
    title: movie.title,
    description: movie.description,
    banner: movie.banner,
    cover: movie.cover,
    hls: movie.trailer ?? null,  // trailer -> hls;
    year: movie.year ?? null,
    duration: movie.video_duration ?? null,
    classification: movie.classification ?? null,
    imdb: movie.imdb_score ?? null,
  };
}

// --- Estrutura 1: categorias para o carrossel (Decisão 4) ---
// Preserva o agrupamento em fileiras, mas com cada filme já normalizado.
const categories = raw.map((cat) => ({
  cat_id: cat.cat_id,
  cat_label: cat.cat_label,
  order: cat.order,
  content: cat.content.map(normalize),
}));

// --- Estrutura 2: índice por id para o detalhe (Decisão 4) ---
// O Map dá busca O(1). Ids repetidos se sobrescrevem => deduplicação de graça.
const byId = new Map();
for (const cat of raw) {
  for (const movie of cat.content) {
    byId.set(movie.id, normalize(movie));
  }
}

// Log de diagnóstico: confirma na subida quantos itens carregaram.
console.log(`[dataStore] ${categories.length} categorias, ${byId.size} filmes unicos carregados`);

// --- Interface pública do módulo ---
// O resto do sistema só enxerga estas duas funções; a "bagunça" fica encapsulada aqui.
function getCategories() { return categories; }
function getMovieById(id) { return byId.get(id) ?? null; }

module.exports = { getCategories, getMovieById };