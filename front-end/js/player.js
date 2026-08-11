async function initPlayer() {
  const id = new URLSearchParams(location.search).get('id');
  const video = document.getElementById('video');

  connectWS();

  let movie;
  try {
    movie = await fetchMovieById(id);
  } catch (err) {
    document.body.innerHTML = `<p class="error">Erro: ${err.message}</p>`;
    return;
  }
  if (!movie.hls) {
    document.body.innerHTML = '<p class="error">Este filme nao tem stream disponivel.</p>';
    return;
  }

  document.title = `${movie.title} - NXPlay`;
  document.getElementById('title').textContent = movie.title;

  if (window.Hls && Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(movie.hls);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (evt, data) => {
      if (data.fatal) sendEvent('error', movie.id, video.currentTime);
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = movie.hls;
  } else {
    document.body.innerHTML = '<p class="error">Seu navegador nao suporta HLS.</p>';
    return;
  }

  const send = (name) => sendEvent(name, movie.id, video.currentTime);
  video.addEventListener('play', () => send('play'));
  video.addEventListener('playing', () => send('playing'));
  video.addEventListener('pause', () => send('pause'));
  video.addEventListener('seeked', () => send('seek'));
  video.addEventListener('ended', () => send('finished'));
  video.addEventListener('error', () => send('error'));
}
document.addEventListener('DOMContentLoaded', initPlayer);
