let socket;

function connectWS() {
  socket = new WebSocket(CONFIG.WS_URL);
  socket.addEventListener('open',  () => console.log('[ws] conectado'));
  socket.addEventListener('close', () => console.log('[ws] desconectado'));
  socket.addEventListener('error', () => console.log('[ws] erro de conexao'));
  return socket;
}

function sendEvent(event, movieId, timestamp) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ event, movieId, timestamp }));
}
