function chevron(dir) {
  const points = dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
         `stroke-linecap="round" stroke-linejoin="round"><polyline points="${points}"/></svg>`;
}

function buildCard(movie) {
  const card = document.createElement('a');
  card.className = 'card';
  card.href = `sinopse.html?id=${movie.id}`;

  const img = document.createElement('img');
  img.src = movie.cover;
  img.alt = movie.title;
  img.loading = 'lazy';

  card.appendChild(img);
  return card;
}

function makeArrow(dir, track) {
  const btn = document.createElement('button');
  btn.className = `row-${dir === 'left' ? 'prev' : 'next'} icon-btn`;
  btn.setAttribute('aria-label', dir === 'left' ? 'Voltar' : 'Avancar');
  btn.innerHTML = chevron(dir);
  btn.addEventListener('click', () => {
    const delta = track.clientWidth * 0.8;
    track.scrollBy({ left: dir === 'left' ? -delta : delta, behavior: 'smooth' });
  });
  return btn;
}

function buildRow(category) {
  const section = document.createElement('section');
  section.className = 'row';

  const h2 = document.createElement('h2');
  h2.className = 'row__title';
  h2.textContent = category.cat_label;
  section.appendChild(h2);

  const wrap = document.createElement('div');
  wrap.className = 'track-wrap';

  const track = document.createElement('div');
  track.className = 'track';
  category.content.forEach((m) => track.appendChild(buildCard(m)));

  const prev = makeArrow('left', track);
  const next = makeArrow('right', track);

  function updateArrows() {
    const EPS = 4;
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    prev.classList.toggle('is-hidden', track.scrollLeft <= EPS);
    next.classList.toggle('is-hidden', track.scrollLeft >= maxScroll - EPS);
  }
  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  requestAnimationFrame(updateArrows);

  wrap.append(prev, track, next);
  section.appendChild(wrap);
  return section;
}

async function initCarousel() {
  const root = document.getElementById('app');
  try {
    const categories = await fetchMovies();          // GET /movies (Recomendados, Acao e Aventura)
    categories.forEach((cat) => root.appendChild(buildRow(cat)));
  } catch (err) {
    root.innerHTML =
      `<p class="error">Erro ao carregar filmes: ${err.message}. A API (porta 3000) esta rodando?</p>`;
  }
}
document.addEventListener('DOMContentLoaded', initCarousel);
