function getId() {
  return new URLSearchParams(location.search).get('id');
}

function fmtDuration(min) {
  if (min === null || min === undefined) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

async function initSinopse() {
  const id = getId();
  const backdrop = document.getElementById('backdrop');
  const titleEl = document.getElementById('title');
  const metaEl = document.getElementById('meta');
  const descEl = document.getElementById('description');
  const watchEl = document.getElementById('watch');
  const noteEl = document.getElementById('note');

  if (!id) { titleEl.textContent = 'Filme nao informado'; return; }

  try {
    const movie = await fetchMovieById(id);
    document.title = `${movie.title} - NXPlay`;

    backdrop.style.backgroundImage = `url('${movie.banner}')`;
    titleEl.textContent = movie.title;
    descEl.textContent = movie.description;

    const parts = [];
    if (movie.year) parts.push(`<span>${movie.year}</span>`);
    const dur = fmtDuration(movie.duration);
    if (dur) parts.push(`<span>${dur}</span>`);
    if (movie.classification) parts.push(`<span class="chip">${movie.classification}</span>`);
    if (movie.imdb) parts.push(`<span class="imdb">IMDb ${movie.imdb}</span>`);
    if (parts.length) { metaEl.innerHTML = parts.join(''); metaEl.hidden = false; }

    if (movie.hls) {
      watchEl.href = `player.html?id=${movie.id}`;
      watchEl.hidden = false;
    } else {
      noteEl.textContent = 'Reproducao indisponivel para este titulo.';
      noteEl.hidden = false;
    }
  } catch (err) {
    titleEl.textContent = 'Erro ao reproduzir o título';
    descEl.textContent = err.message;
  }
}
document.addEventListener('DOMContentLoaded', initSinopse);
